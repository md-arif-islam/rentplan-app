<?php

namespace Tests\Feature\Middleware;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    /** @test */
    public function super_admin_can_access_admin_routes()
    {
        // Create a super admin user
        $superAdmin = User::factory()->create([
            'role_id' => Role::where('name', 'super_admin')->first()->id,
        ]);

        // Authenticate as super admin
        Sanctum::actingAs($superAdmin);

        // Access an admin route
        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(200);
    }

    /** @test */
    public function company_admin_cannot_access_admin_routes()
    {
        // Create a company admin user
        $companyAdmin = User::factory()->create([
            'role_id' => Role::where('name', 'company_admin')->first()->id,
        ]);

        // Authenticate as company admin
        Sanctum::actingAs($companyAdmin);

        // Try to access an admin route
        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    /** @test */
    public function company_admin_can_access_company_routes()
    {
        // Create a company admin user
        $companyAdmin = User::factory()->create([
            'role_id' => Role::where('name', 'company_admin')->first()->id,
        ]);

        // Authenticate as company admin
        Sanctum::actingAs($companyAdmin);

        // Access a company route
        $response = $this->getJson('/api/company/dashboard');

        $response->assertStatus(200);
    }

    /** @test */
    public function super_admin_cannot_access_company_routes()
    {
        // Create a super admin user
        $superAdmin = User::factory()->create([
            'role_id' => Role::where('name', 'super_admin')->first()->id,
        ]);

        // Authenticate as super admin
        Sanctum::actingAs($superAdmin);

        // Try to access a company route
        $response = $this->getJson('/api/company/dashboard');

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_users_cannot_access_protected_routes()
    {
        // Try to access protected routes without authentication
        $adminResponse = $this->getJson('/api/admin/dashboard');
        $companyResponse = $this->getJson('/api/company/dashboard');

        $adminResponse->assertStatus(401);
        $companyResponse->assertStatus(401);
    }

    /** @test */
    public function rate_limiter_works_on_api_endpoints()
    {
        // Create a user
        $user = User::factory()->create();

        // Authenticate as the user
        Sanctum::actingAs($user);

        // Set up a key for rate limiting test
        $key = 'api|' . $user->id . '|127.0.0.1';

        // Clear any existing rate limits
        app('redis')->del($key);

        // Make multiple requests to exceed the rate limit
        $maxAttempts = config('rentplan.api_rate_limit', 60);

        for ($i = 0; $i < $maxAttempts; $i++) {
            $this->getJson('/api/user');
        }

        // The next request should be rate limited
        $response = $this->getJson('/api/user');

        $response->assertStatus(429)
            ->assertHeader('X-RateLimit-Limit')
            ->assertHeader('X-RateLimit-Remaining')
            ->assertHeader('Retry-After');
    }
}
