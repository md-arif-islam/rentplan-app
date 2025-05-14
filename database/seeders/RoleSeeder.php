<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
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
        ]);
    }
}
