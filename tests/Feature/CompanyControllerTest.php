<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $superAdminUser;
    protected $companyAdminUser;

    public function setUp(): void
    {
        parent::setUp();

        // Create roles
        $superAdminRole = Role::create([
            'name' => 'super_admin',
            'scope' => 'platform'
        ]);
        
        $companyAdminRole = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);

        // Create a test company
        $company = Company::create([
            'name' => 'Test Company',
            'email' => 'company@test.com',
        ]);

        // Create a super admin user
        $this->superAdminUser = User::factory()->create([
            'email' => 'super@admin.com',
            'role_id' => $superAdminRole->id,
            'company_id' => $company->id
        ]);

        // Create a company admin user
        $this->companyAdminUser = User::factory()->create([
            'email' => 'company@admin.com',
            'role_id' => $companyAdminRole->id,
            'company_id' => $company->id
        ]);
    }

    public function test_super_admin_can_fetch_companies()
    {
        Sanctum::actingAs($this->superAdminUser);

        $response = $this->getJson('/api/admin/companies');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total',
            ]);
    }

    public function test_company_admin_cannot_access_companies_list()
    {
        Sanctum::actingAs($this->companyAdminUser);

        $response = $this->getJson('/api/admin/companies');

        $response->assertStatus(403);
    }

    public function test_super_admin_can_create_company()
    {
        Sanctum::actingAs($this->superAdminUser);

        $companyData = [
            'name' => 'New Test Company',
            'email' => 'new@testcompany.com',
            'phone' => '1234567890',
            'website' => 'https://testcompany.com',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'country' => 'Test Country',
            'plan' => [
                'plan_name' => 'Basic',
                'plan_price' => 0,
                'plan_status' => 'active',
                'plan_features' => ['basic_features'],
                'plan_start_date' => now()->toDateString(),
                'plan_expiry_date' => now()->addMonth()->toDateString(),
            ]
        ];

        $response = $this->postJson('/api/admin/companies', $companyData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ]
            ]);
    }
}
