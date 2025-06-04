<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    /** @test */
    public function a_user_can_logout()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User logged out successfully'
            ]);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'logout',
        ]);
    }

    /** @test */
    public function logout_clears_user_tokens()
    {
        $user = User::factory()->create();

        // Create a token
        $token = $user->createToken('test-token')->plainTextToken;

        // Check token exists
        $this->assertDatabaseCount('personal_access_tokens', 1);

        // Logout with token
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200);

        // Token should be deleted
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
