<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    protected $userRepository;
    
    /**
     * Constructor
     * 
     * @param UserRepository $userRepository
     */
    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }
    
    /**
     * Get all users for a company
     * 
     * @param int $companyId
     * @param array $params
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getCompanyUsers(int $companyId, array $params)
    {
        $search = $params['search'] ?? null;
        $perPage = $params['perPage'] ?? 10;
        
        return $this->userRepository->findByCompany($companyId, $search, $perPage);
    }
    
    /**
     * Get a user by ID
     * 
     * @param int $id
     * @param int $companyId
     * @return User
     * @throws \Exception
     */
    public function getCompanyUser(int $id, int $companyId): User
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user || $user->company_id !== $companyId) {
            throw new \Exception('User not found or does not belong to your company', 404);
        }
        
        return $user;
    }
    
    /**
     * Create a new user for a company
     * 
     * @param array $data
     * @param int $companyId
     * @param int $roleId
     * @return User
     * @throws \Exception
     */
    public function createCompanyUser(array $data, int $companyId, int $roleId): User
    {
        DB::beginTransaction();
        
        try {
            // Create user
            $userData = [
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role_id' => $roleId,
                'company_id' => $companyId,
            ];
            
            $user = $this->userRepository->create($userData);
            
            // Create profile
            UserProfile::createOrUpdateProfile($user->id, [
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'avatar' => $data['avatar'] ?? null,
            ]);
            
            DB::commit();
            
            // Return user with relationships
            return $this->userRepository->findById($user->id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Update a user
     * 
     * @param int $id
     * @param array $data
     * @param int $companyId
     * @return User
     * @throws \Exception
     */
    public function updateCompanyUser(int $id, array $data, int $companyId): User
    {
        $user = $this->getCompanyUser($id, $companyId);
        
        DB::beginTransaction();
        
        try {
            // Update user data
            $userData = ['email' => $data['email']];
            
            // Update password if provided
            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }
            
            $this->userRepository->update($user, $userData);
            
            // Update profile
            UserProfile::createOrUpdateProfile($user->id, [
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'avatar' => $data['avatar'] ?? null,
            ]);
            
            DB::commit();
            
            // Return updated user with relationships
            return $this->userRepository->findById($user->id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Delete a user
     * 
     * @param int $id
     * @param int $companyId
     * @param int $currentUserId
     * @return bool
     * @throws \Exception
     */
    public function deleteCompanyUser(int $id, int $companyId, int $currentUserId): bool
    {
        if ($id === $currentUserId) {
            throw new \Exception('You cannot delete your own account', 422);
        }
        
        $user = $this->getCompanyUser($id, $companyId);
        
        DB::beginTransaction();
        
        try {
            // Delete profile
            if ($user->userProfile) {
                // Delete avatar if exists
                if ($user->userProfile->avatar && file_exists(public_path($user->userProfile->avatar))) {
                    unlink(public_path($user->userProfile->avatar));
                }
                
                $user->userProfile->delete();
            }
            
            // Delete user
            $result = $this->userRepository->delete($user);
            
            DB::commit();
            
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
