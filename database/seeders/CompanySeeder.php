<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\CompanyProfile;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::factory(5)->create();

        foreach ($companies as $company) {
            CompanyProfile::factory()->create([
                'company_id' => $company->id,
            ]);
        }
    }
}
