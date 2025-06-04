<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    /**
     * Find a user by their email
     * 
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->with(['userProfile'])->first();
    }
    
    /**
     * Find a user by their ID
     * 
     * @param int $id
     * @return User|null
     */
    public function findById(int $id): ?User
    {
        return User::with(['userProfile', 'role'])->findOrFail($id);
    }
    
    /**
     * Create a new user
     * 
     * @param array $data
     * @return User
     */
    public function create(array $data): User
    {
        return User::create($data);
    }
    
    /**
     * Update a user
     * 
     * @param User $user
     * @param array $data
     * @return bool
     */
    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }
    
    /**
     * Delete all tokens for a user
     * 
     * @param User $user
     * @return void
     */
    public function deleteAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }
}
