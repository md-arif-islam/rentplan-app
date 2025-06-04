<?php

namespace Tests\Feature\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $profile;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create a user and profile
        $this->user = User::factory()->create([
            'role_id' => Role::where('name', 'super_admin')->where('scope', 'platform')->first()->id,
        ]);

        $this->profile = UserProfile::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Profile',
            'phone' => '1234567890',
        ]);

        Storage::fake('public');
    }

    /** @test */
    public function it_can_show_profile_by_id()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/admin/profile/{$this->profile->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $this->profile->id,
                'user_id' => $this->user->id,
                'name' => 'Test Profile',
                'phone' => '1234567890',
            ]);
    }

    /** @test */
    public function it_can_show_profile_by_user_id()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/admin/profile/user/{$this->user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $this->profile->id,
                'user_id' => $this->user->id,
                'name' => 'Test Profile',
                'phone' => '1234567890',
            ]);
    }

    /** @test */
    public function it_can_update_profile()
    {
        Sanctum::actingAs($this->user);

        $updateData = [
            'name' => 'Updated Profile',
            'phone' => '0987654321',
        ];

        $response = $this->putJson("/api/admin/profile/{$this->profile->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profile updated successfully',
                'data' => [
                    'name' => 'Updated Profile',
                    'phone' => '0987654321',
                ],
            ]);

        // Verify profile was updated in database
        $this->assertDatabaseHas('user_profiles', [
            'id' => $this->profile->id,
            'name' => 'Updated Profile',
            'phone' => '0987654321',
        ]);
    }

    /** @test */
    public function it_can_upload_avatar_as_base64()
    {
        Sanctum::actingAs($this->user);

        // Create a fake image and convert to base64
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);
        $base64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($file->path()));

        $updateData = [
            'name' => 'Avatar Test',
            'avatar' => $base64,
        ];

        $response = $this->putJson("/api/admin/profile/{$this->profile->id}", $updateData);

        $response->assertStatus(200);

        // Check if avatar path is returned and starts with the expected directory
        $avatarPath = $response->json('data.avatar');
        $this->assertNotNull($avatarPath);
        $this->assertStringStartsWith('images/profiles/', $avatarPath);

        // Verify profile was updated with the avatar path
        $this->assertDatabaseHas('user_profiles', [
            'id' => $this->profile->id,
            'name' => 'Avatar Test',
        ]);

        $updatedProfile = UserProfile::find($this->profile->id);
        $this->assertNotNull($updatedProfile->avatar);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_profile()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/admin/profile/999");

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_invalid_base64_data()
    {
        Sanctum::actingAs($this->user);

        $updateData = [
            'name' => 'Invalid Avatar Test',
            'avatar' => 'not-a-valid-base64-string',
        ];

        $response = $this->putJson("/api/admin/profile/{$this->profile->id}", $updateData);

        $response->assertStatus(422);
    }
}
