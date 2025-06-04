<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default company for the super admin
        Company::factory()->create([
            'name' => 'RentPlan Admin',
            'email' => 'admin@rentplan.nl',
        ]);

        // Create additional companies
        Company::factory(4)->create();
    }
}
