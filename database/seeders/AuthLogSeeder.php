<?php

namespace Database\Seeders;

use App\Models\AuthLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuthLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a mix of auth logs

        // Get existing users
        $users = User::all();

        // Create successful logins for existing users
        foreach ($users as $user) {
            // Create 3-10 login records per user
            $loginCount = rand(3, 10);

            for ($i = 0; $i < $loginCount; $i++) {
                $createdAt = now()->subDays(rand(0, 30))->subHours(rand(0, 23));

                AuthLog::factory()->state([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'action' => 'login',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])->create();

                // 80% chance of having a logout for each login
                if (rand(1, 5) <= 4) {
                    $logoutAt = (clone $createdAt)->addMinutes(rand(5, 120));

                    AuthLog::factory()->state([
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'action' => 'logout',
                        'created_at' => $logoutAt,
                        'updated_at' => $logoutAt,
                    ])->create();
                }
            }
        }

        // Create 20-50 failed login attempts
        AuthLog::factory()
            ->failedLogin()
            ->count(rand(20, 50))
            ->create();

        // Create 5-15 password reset requests
        AuthLog::factory()
            ->count(rand(5, 15))
            ->state(['action' => 'password-reset-request'])
            ->create();

        // Create 3-10 rate limited attempts
        AuthLog::factory()
            ->rateLimited()
            ->count(rand(3, 10))
            ->create();
    }
}
