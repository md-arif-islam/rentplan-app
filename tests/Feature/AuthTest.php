<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_correct_credentials()
    {
        // Create a role for testing
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);
        
        // Create a user for testing
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);

        // Attempt login
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user',
                'message'
            ]);
    }

    public function test_user_cannot_login_with_incorrect_password()
    {
        // Create a role for testing
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);
        
        // Create a user for testing
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);

        // Attempt login with wrong password
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(402)
            ->assertJsonStructure(['message']);
    }
}
