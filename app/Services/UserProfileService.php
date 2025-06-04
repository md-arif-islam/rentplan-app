<?php

namespace App\Services;

use App\Models\UserProfile;
use App\Repositories\UserProfileRepository;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class UserProfileService
{
    protected $userProfileRepository;

    /**
     * Constructor
     *
     * @param UserProfileRepository $userProfileRepository
     */
    public function __construct(UserProfileRepository $userProfileRepository)
    {
        $this->userProfileRepository = $userProfileRepository;
    }

    /**
     * Get a user profile by ID
     *
     * @param int $id
     * @return UserProfile
     * @throws \Exception
     */
    public function getProfile(int $id): UserProfile
    {
        $profile = $this->userProfileRepository->findById($id);

        if (!$profile) {
            throw new \Exception('User profile not found', 404);
        }

        return $profile;
    }

    /**
     * Get a user profile by user ID
     *
     * @param int $userId
     * @return UserProfile
     * @throws \Exception
     */
    public function getProfileByUserId(int $userId): UserProfile
    {
        $profile = $this->userProfileRepository->findByUserId($userId);

        if (!$profile) {
            throw new \Exception('User profile not found', 404);
        }

        return $profile;
    }

    /**
     * Update a user profile
     *
     * @param int $id
     * @param array $data
     * @return UserProfile
     * @throws \Exception
     */
    public function updateProfile(int $id, array $data): UserProfile
    {
        $profile = $this->userProfileRepository->findById($id);

        if (!$profile) {
            throw new \Exception('User profile not found', 404);
        }

        // Handle avatar upload if provided as base64
        if (isset($data['avatar']) && $data['avatar'] && is_string($data['avatar']) && preg_match('/^data:image\//', $data['avatar'])) {
            // Delete old avatar if it exists
            if ($profile->avatar && File::exists(public_path($profile->avatar))) {
                File::delete(public_path($profile->avatar));
            }

            $data['avatar'] = $this->saveImage($data['avatar']);
        }

        $this->userProfileRepository->update($profile, $data);

        return $profile->fresh();
    }

    /**
     * Create or update a profile for a user
     *
     * @param int $userId
     * @param array $data
     * @return UserProfile
     */
    public function createOrUpdateProfile(int $userId, array $data): UserProfile
    {
        // Handle avatar upload if provided as base64
        if (isset($data['avatar']) && $data['avatar'] && is_string($data['avatar']) && preg_match('/^data:image\//', $data['avatar'])) {
            $data['avatar'] = $this->saveImage($data['avatar']);
        }

        return $this->userProfileRepository->createOrUpdate($userId, $data);
    }

    /**
     * Save Base64 image to storage.
     *
     * @param string $image
     * @return string
     * @throws \Exception
     */
    protected function saveImage(string $image): string
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('Invalid image type');
            }

            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('Base64 decode failed');
            }
        } else {
            throw new \Exception('Did not match data URI with image data');
        }

        $dir = 'images/profiles/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents(public_path($relativePath), $image);

        return $relativePath;
    }
}
