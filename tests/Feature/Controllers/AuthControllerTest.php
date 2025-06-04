<?php

namespace Tests\Feature\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => Role::where('name', 'company_admin')->first()->id,
        ]);
        
        UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test User',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'email',
                    'role',
                    'user_profile',
                ],
                'message'
            ])
            ->assertJson([
                'message' => 'User logged in successfully'
            ]);
            
        // Verify that the user profile is included
        $this->assertEquals('Test User', $response->json()['user']['user_profile']['name']);
    }
    
    /** @test */
    public function user_cannot_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials'
            ]);
    }
    
    /** @test */
    public function user_can_logout()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User logged out successfully'
            ]);
            
        // Verify token was deleted
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /** @test */
    public function user_can_request_password_reset()
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
        ]);

        $response = $this->postJson('/api/send-reset-link-email', [
            'email' => 'reset@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password reset link sent'
            ]);
            
        // Verify entry in the password_reset_tokens table
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'reset@example.com'
        ]);
    }
    
    /** @test */
    public function rate_limiting_is_applied_to_login()
    {
        // Clear any existing rate limits
        $this->app->make(\Illuminate\Cache\RateLimiter::class)->clear('auth|test@example.com|127.0.0.1');
        
        // Create user
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Make 5 failed login attempts to trigger rate limiting
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'wrong-password'
            ]);
        }
        
        // 6th attempt should be rate limited
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password'
        ]);
        
        $response->assertStatus(429)
            ->assertJsonStructure([
                'message',
                'retry_after',
                'seconds_until_retry',
            ]);
    }
}
