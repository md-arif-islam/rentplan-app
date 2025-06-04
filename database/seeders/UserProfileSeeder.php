<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find any users without profiles and create profiles for them
        $usersWithoutProfiles = User::doesntHave('userProfile')->get();

        foreach ($usersWithoutProfiles as $user) {
            UserProfile::factory()->forUser($user)->create();
        }
    }
}
