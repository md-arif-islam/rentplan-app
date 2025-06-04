<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        // Clear rate limiter before each test
        RateLimiter::clear('auth|test@example.com|127.0.0.1');
    }
    
    /** @test */
    public function login_is_rate_limited_after_too_many_attempts()
    {
        // Create a user
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Make multiple login requests to trigger rate limiting
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'wrong-password'
            ]);
        }
        
        // The next login attempt should be rate limited
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
    
    /** @test */
    public function password_reset_is_rate_limited_after_too_many_attempts()
    {
        // Create a user
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Clear any rate limiter for this test
        RateLimiter::clear('password-reset:test@example.com');
        
        // Make multiple password reset requests to trigger rate limiting
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/send-reset-link-email', [
                'email' => 'test@example.com'
            ]);
        }
        
        // The next password reset attempt should be rate limited
        $response = $this->postJson('/api/send-reset-link-email', [
            'email' => 'test@example.com'
        ]);
        
        $response->assertStatus(429)
            ->assertJsonStructure([
                'message',
                'seconds_until_retry',
            ]);
    }
}
