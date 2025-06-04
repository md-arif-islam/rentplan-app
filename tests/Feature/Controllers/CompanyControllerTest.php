<?php

namespace Tests\Feature\Controllers;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create a super admin user
        $this->user = User::factory()->create([
            'role_id' => Role::where('name', 'super_admin')->where('scope', 'platform')->first()->id,
        ]);
    }

    /** @test */
    public function super_admin_can_list_companies()
    {
        Sanctum::actingAs($this->user);

        // Create some companies
        Company::factory()->count(5)->create();

        $response = $this->getJson('/api/admin/companies');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'current_page',
                'data',
                'total',
                'per_page',
                'last_page',
            ]);
    }

    /** @test */
    public function super_admin_can_create_company()
    {
        Sanctum::actingAs($this->user);

        $data = [
            'name' => 'Test Company',
            'email' => 'company@example.com',
            'phone' => '1234567890',
            'plan' => [
                'plan_name' => 'Basic',
                'plan_price' => 29.99,
                'plan_status' => 'active',
                'plan_features' => ['feature1', 'feature2'],
                'plan_start_date' => now()->format('Y-m-d'),
                'plan_expiry_date' => now()->addYear()->format('Y-m-d'),
            ],
        ];

        $response = $this->postJson('/api/admin/companies', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Company created successfully',
                'data' => [
                    'name' => 'Test Company',
                    'email' => 'company@example.com',
                ]
            ]);

        // Verify company was created in database
        $this->assertDatabaseHas('companies', [
            'name' => 'Test Company',
            'email' => 'company@example.com',
        ]);
    }

    /** @test */
    public function super_admin_can_view_company()
    {
        Sanctum::actingAs($this->user);

        $company = Company::factory()->create([
            'name' => 'View Test Company',
            'email' => 'view@example.com',
        ]);

        $response = $this->getJson("/api/admin/companies/{$company->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $company->id,
                'name' => 'View Test Company',
                'email' => 'view@example.com',
            ]);
    }

    /** @test */
    public function super_admin_can_update_company()
    {
        Sanctum::actingAs($this->user);

        $company = Company::factory()->create([
            'name' => 'Original Company',
            'email' => 'original@example.com',
        ]);

        $data = [
            'name' => 'Updated Company',
            'email' => 'updated@example.com',
        ];

        $response = $this->putJson("/api/admin/companies/{$company->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Company updated successfully',
                'data' => [
                    'name' => 'Updated Company',
                    'email' => 'updated@example.com',
                ]
            ]);

        // Verify company was updated in database
        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'name' => 'Updated Company',
            'email' => 'updated@example.com',
        ]);
    }

    /** @test */
    public function super_admin_can_delete_company()
    {
        Sanctum::actingAs($this->user);

        $company = Company::factory()->create();

        $response = $this->deleteJson("/api/admin/companies/{$company->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Company deleted successfully',
            ]);

        // Verify company was soft deleted
        $this->assertSoftDeleted($company);
    }

    /** @test */
    public function company_admin_cannot_access_admin_routes()
    {
        // Create a company admin user
        $company = Company::factory()->create();
        $companyAdmin = User::factory()->create([
            'role_id' => Role::where('name', 'company_admin')->where('scope', 'company')->first()->id,
            'company_id' => $company->id,
        ]);

        Sanctum::actingAs($companyAdmin);

        // Try to access admin companies endpoint
        $response = $this->getJson('/api/admin/companies');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'You do not have access to this resource'
            ]);
    }
}
