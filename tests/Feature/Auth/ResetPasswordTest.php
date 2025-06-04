<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class ResetPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }
    
    /** @test */
    public function a_user_can_request_a_password_reset_link()
    {
        Notification::fake();
        
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/send-reset-link-email', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password reset link sent'
            ]);
            
        Notification::assertSentTo($user, ResetPassword::class);
        
        $this->assertDatabaseHas('auth_logs', [
            'email' => 'test@example.com',
            'action' => 'password-reset-request',
        ]);
    }
    
    /** @test */
    public function a_user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        
        // Create a password reset token
        $token = Password::createToken($user);
        
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password reset successfully'
            ]);
            
        // Check user can login with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'new-password'
        ]);
        
        $loginResponse->assertStatus(200);
        
        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'password-reset',
        ]);
    }
    
    /** @test */
    public function email_is_required_to_send_reset_link()
    {
        $response = $this->postJson('/api/send-reset-link-email', []);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }
    
    /** @test */
    public function password_reset_requires_token_email_and_password()
    {
        $response = $this->postJson('/api/reset-password', []);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['token', 'email', 'password']);
    }
    
    /** @test */
    public function passwords_must_match_for_reset()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        
        // Create a password reset token
        $token = Password::createToken($user);
        
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'new-password',
            'password_confirmation' => 'different-password',
        ]);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }
}
