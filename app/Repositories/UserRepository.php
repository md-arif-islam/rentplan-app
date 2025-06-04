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
        return User::where('email', $email)
            ->with(['userProfile', 'role'])
            ->first();
    }

    /**
     * Find a user by their ID
     *
     * @param int $id
     * @return User|null
     */
    public function findById(int $id): ?User
    {
        return User::with(['userProfile', 'role'])
            ->findOrFail($id);
    }

    /**
     * Find users by company ID
     *
     * @param int $companyId
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function findByCompany(int $companyId, ?string $search = null, int $perPage = 10)
    {
        $query = User::where('company_id', $companyId)
            ->with(['role', 'userProfile']);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('userProfile', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
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

    /**
     * Delete a user
     *
     * @param User $user
     * @return bool|null
     */
    public function delete(User $user): ?bool
    {
        return $user->delete();
    }
}
