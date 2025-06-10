<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $companyAdminRole = Role::where('name', 'company_admin')->first();

        // Get demo company
        $demoCompany = Company::where('name', 'RentPlan Demo Company')->first();

        // Create super admin user
        $superAdmin = User::create([
            'email' => 'admin@rentplan.nl',
            'password' => '12345678',
            'role_id' => $superAdminRole->id,
            'company_id' => $demoCompany->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'force_password_change' => false,
        ]);

        // Create profile for super admin
        UserProfile::create([
            'user_id' => $superAdmin->id,
            'name' => 'System Administrator',
            'phone' => '+31 612345678',
        ]);

        // Create demo company admin
        $demoCompanyAdmin = User::create([
            'email' => 'company@rentplan.test',
            'password' => Hash::make('password'),
            'role_id' => $companyAdminRole->id,
            'company_id' => $demoCompany->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'force_password_change' => false,
        ]);

        // Create profile for demo company admin
        UserProfile::create([
            'user_id' => $demoCompanyAdmin->id,
            'name' => 'Demo Company Manager',
            'phone' => '+31 687654321',
        ]);

        // For each other company, create 1-3 admin users
        $companies = Company::where('id', '!=', $demoCompany->id)->get();

        foreach ($companies as $company) {
            $adminCount = rand(1, 3);

            for ($i = 0; $i < $adminCount; $i++) {
                $user = User::factory()->forCompany($company)->create();
                UserProfile::factory()->forUser($user)->create();
            }
        }
    }
}
