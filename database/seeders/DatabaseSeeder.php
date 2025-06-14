<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Roles must be seeded first as they are referenced by users
            RoleSeeder::class,

            // Companies come next as users belong to companies
            CompanySeeder::class,

            // Users are created after companies and roles
            UserSeeder::class,

            // User profiles are created last as they depend on users
            UserProfileSeeder::class,

            // Add order seeder to create additional orders if needed
            // OrderSeeder::class, // Uncomment if you need more orders

            // Auth logs for user authentication history
            AuthLogSeeder::class,

            // Add settings seeder
            SettingSeeder::class,
        ]);
    }
}
