<?php

namespace App\Repositories;

use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Collection;

class UserProfileRepository
{
    /**
     * Find a profile by its ID
     *
     * @param int $id
     * @return UserProfile|null
     */
    public function findById(int $id): ?UserProfile
    {
        return UserProfile::with('user')->find($id);
    }

    /**
     * Find a profile by user ID
     *
     * @param int $userId
     * @return UserProfile|null
     */
    public function findByUserId(int $userId): ?UserProfile
    {
        return UserProfile::where('user_id', $userId)->with('user')->first();
    }

    /**
     * Create a new user profile
     *
     * @param array $data
     * @return UserProfile
     */
    public function create(array $data): UserProfile
    {
        return UserProfile::create($data);
    }

    /**
     * Update a user profile
     *
     * @param UserProfile $profile
     * @param array $data
     * @return bool
     */
    public function update(UserProfile $profile, array $data): bool
    {
        return $profile->update($data);
    }

    /**
     * Delete a user profile
     *
     * @param UserProfile $profile
     * @return bool|null
     */
    public function delete(UserProfile $profile): ?bool
    {
        return $profile->delete();
    }

    /**
     * Create or update a profile
     *
     * @param int $userId
     * @param array $data
     * @return UserProfile
     */
    public function createOrUpdate(int $userId, array $data): UserProfile
    {
        $profile = $this->findByUserId($userId);

        if (!$profile) {
            $data['user_id'] = $userId;
            return $this->create($data);
        }

        $this->update($profile, $data);
        return $profile->fresh();
    }
}
