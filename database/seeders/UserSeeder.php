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
        // Create super admin with the first company
        User::factory()->withRole('super_admin')->create([
            'email' => 'admin@rentplan.nl',
            'company_id' => 1,

        ]);

        // Create company admin users for each company
        $companies = Company::where('id', '>', 1)->get();

        foreach ($companies as $company) {
            User::factory()
                ->withRole('company_admin')
                ->create([
                    'company_id' => $company->id,
                    'email' => 'admin_' . $company->id . '@example.com',
                ]);
        }
    }
}
