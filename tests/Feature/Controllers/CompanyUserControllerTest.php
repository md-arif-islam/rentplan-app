<?php

namespace Tests\Feature\Controllers;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyUserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $company;
    protected $companyAdmin;
    protected $companyAdminRole;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        // Create a company and company admin
        $this->company = Company::factory()->create();
        $this->companyAdminRole = Role::where('name', 'company_admin')->where('scope', 'company')->first();
        
        $this->companyAdmin = User::factory()->create([
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
        ]);
        
        UserProfile::factory()->create([
            'user_id' => $this->companyAdmin->id,
            'name' => 'Admin User',
        ]);
    }

    /** @test */
    public function company_admin_can_list_users()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        // Create additional users for this company
        User::factory()->count(5)->create([
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
        ]);
        
        $response = $this->getJson('/api/company/users');
        
        $response->assertStatus(200)
            ->assertJsonCount(6, 'data') // 5 + the admin itself
            ->assertJsonStructure([
                'current_page',
                'data',
                'total',
                'per_page',
                'last_page',
            ]);
    }
    
    /** @test */
    public function company_admin_can_create_user()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        $data = [
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'name' => 'New User',
            'phone' => '1234567890',
        ];
        
        $response = $this->postJson('/api/company/users', $data);
        
        $response->assertStatus(201)
            ->assertJson([
                'message' => 'User created successfully',
                'data' => [
                    'email' => 'newuser@example.com',
                    'company_id' => $this->company->id,
                ]
            ]);
            
        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
        ]);
        
        // Verify profile was created
        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'name' => 'New User',
            'phone' => '1234567890',
        ]);
    }
    
    /** @test */
    public function company_admin_can_view_user()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
            'email' => 'view@example.com',
        ]);
        
        UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'View Test User',
        ]);
        
        $response = $this->getJson("/api/company/users/{$user->id}");
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'email' => 'view@example.com',
                'user_profile' => [
                    'name' => 'View Test User',
                ]
            ]);
    }
    
    /** @test */
    public function company_admin_can_update_user()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
            'email' => 'original@example.com',
        ]);
        
        UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Original User',
            'phone' => '1234567890',
        ]);
        
        $data = [
            'email' => 'updated@example.com',
            'name' => 'Updated User',
            'phone' => '0987654321',
        ];
        
        $response = $this->putJson("/api/company/users/{$user->id}", $data);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User updated successfully',
                'data' => [
                    'email' => 'updated@example.com',
                    'user_profile' => [
                        'name' => 'Updated User',
                        'phone' => '0987654321',
                    ]
                ]
            ]);
            
        // Verify user was updated in database
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'updated@example.com',
        ]);
        
        // Verify profile was updated
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'name' => 'Updated User',
            'phone' => '0987654321',
        ]);
    }
    
    /** @test */
    public function company_admin_can_delete_user()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        $user = User::factory()->create([
            'company_id' => $this->company->id,
            'role_id' => $this->companyAdminRole->id,
        ]);
        
        $response = $this->deleteJson("/api/company/users/{$user->id}");
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User deleted successfully',
            ]);
            
        // Verify user was soft deleted
        $this->assertSoftDeleted($user);
    }
    
    /** @test */
    public function company_admin_cannot_delete_own_account()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        $response = $this->deleteJson("/api/company/users/{$this->companyAdmin->id}");
        
        $response->assertStatus(400)
            ->assertJson([
                'message' => 'You cannot delete your own account',
            ]);
            
        // Verify user was not deleted
        $this->assertDatabaseHas('users', [
            'id' => $this->companyAdmin->id,
            'deleted_at' => null,
        ]);
    }
    
    /** @test */
    public function company_admin_cannot_access_users_from_other_companies()
    {
        Sanctum::actingAs($this->companyAdmin);
        
        // Create another company and user
        $otherCompany = Company::factory()->create();
        $otherUser = User::factory()->create([
            'company_id' => $otherCompany->id,
            'role_id' => $this->companyAdminRole->id,
        ]);
        
        // Try to access user from another company
        $response = $this->getJson("/api/company/users/{$otherUser->id}");
        
        $response->assertStatus(404);
    }
}
