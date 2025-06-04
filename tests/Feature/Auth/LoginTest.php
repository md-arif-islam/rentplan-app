<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    /** @test */
    public function a_user_can_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => Role::where('name', 'company_admin')->first()->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user',
                'message'
            ]);
            
        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'login',
        ]);
    }
    
    /** @test */
    public function a_user_cannot_login_with_incorrect_credentials()
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
            
        $this->assertDatabaseHas('auth_logs', [
            'email' => 'test@example.com',
            'action' => 'failed-login',
        ]);
    }
    
    /** @test */
    public function login_returns_user_with_correct_profile_and_role()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        $profile = $user->userProfile()->create([
            'name' => 'Test User',
            'phone' => '1234567890',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'test@example.com')
            ->assertJsonPath('user.user_profile.name', 'Test User')
            ->assertJsonPath('user.user_profile.phone', '1234567890')
            ->assertJsonPath('user.role.name', $user->role->name);
    }
}
