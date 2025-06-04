<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'scope' => 'platform',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'company_admin',
                'scope' => 'company',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'employee',
                'scope' => 'company',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('roles')->insert($roles);
    }
}
