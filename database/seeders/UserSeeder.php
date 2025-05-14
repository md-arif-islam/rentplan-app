<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::factory()->withRole('super_admin')->create([
                'email' => 'admin@rentplan.nl',
            ]);

        // Create 5 company admin users
        for ($i = 1; $i <= 5; $i++) {


            User::factory()
                ->withRole('company_admin')
                ->create();
        }
    }
}
