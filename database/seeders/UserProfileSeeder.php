<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users without profiles
        $users = User::doesntHave('userProfile')->get();

        foreach ($users as $user) {
            // Create profile for super admin
            if ($user->email === 'admin@rentplan.nl') {
                UserProfile::create([
                    'user_id' => $user->id,
                    'name' => 'Administrator',
                    'phone' => '0612345678',
                    'avatar' => null,
                ]);
            }
            // Create profiles for company admins
            else if (strpos($user->email, 'admin_') === 0) {
                UserProfile::create([
                    'user_id' => $user->id,
                    'name' => 'Company Admin ' . $user->company_id,
                    'phone' => '061234' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'avatar' => null,
                ]);
            }
            // Create profiles for other users with factories
            else {
                UserProfile::factory()->create([
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
