<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create platform level roles
        Role::create([
            'name' => 'super_admin',
            'scope' => 'platform',
        ]);
        
        // Create company level roles
        Role::create([
            'name' => 'company_admin',
            'scope' => 'company',
        ]);
        
        Role::create([
            'name' => 'company_user',
            'scope' => 'company',
        ]);
    }
}
