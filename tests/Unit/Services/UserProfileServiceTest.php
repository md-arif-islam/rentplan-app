<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\UserProfile;
use App\Repositories\UserProfileRepository;
use App\Services\UserProfileService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserProfileServiceTest extends TestCase
{
    use RefreshDatabase;
    
    protected $userProfileService;
    protected $userProfileRepository;
    
    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        Storage::fake('public');
        
        $this->userProfileRepository = new UserProfileRepository();
        $this->userProfileService = new UserProfileService($this->userProfileRepository);
    }
    
    /** @test */
    public function it_can_get_profile_by_id()
    {
        $user = User::factory()->create();
        $profile = UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test User',
            'phone' => '1234567890',
        ]);
        
        $result = $this->userProfileService->getProfile($profile->id);
        
        $this->assertEquals($profile->id, $result->id);
        $this->assertEquals('Test User', $result->name);
        $this->assertEquals('1234567890', $result->phone);
    }
    
    /** @test */
    public function it_can_get_profile_by_user_id()
    {
        $user = User::factory()->create();
        $profile = UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test User',
            'phone' => '1234567890',
        ]);
        
        $result = $this->userProfileService->getProfileByUserId($user->id);
        
        $this->assertEquals($profile->id, $result->id);
        $this->assertEquals($user->id, $result->user_id);
        $this->assertEquals('Test User', $result->name);
    }
    
    /** @test */
    public function it_throws_exception_when_profile_not_found()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('User profile not found');
        $this->expectExceptionCode(404);
        
        $this->userProfileService->getProfile(999);
    }
    
    /** @test */
    public function it_can_update_profile()
    {
        $user = User::factory()->create();
        $profile = UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Original Name',
            'phone' => '1234567890',
        ]);
        
        $data = [
            'name' => 'Updated Name',
            'phone' => '0987654321',
        ];
        
        $updated = $this->userProfileService->updateProfile($profile->id, $data);
        
        $this->assertEquals('Updated Name', $updated->name);
        $this->assertEquals('0987654321', $updated->phone);
        
        // Verify changes were saved to the database
        $this->assertDatabaseHas('user_profiles', [
            'id' => $profile->id,
            'name' => 'Updated Name',
            'phone' => '0987654321',
        ]);
    }
    
    /** @test */
    public function it_can_create_or_update_profile()
    {
        $user = User::factory()->create();
        
        // Test creating new profile
        $data = [
            'name' => 'New Profile',
            'phone' => '1234567890',
        ];
        
        $profile = $this->userProfileService->createOrUpdateProfile($user->id, $data);
        
        $this->assertEquals($user->id, $profile->user_id);
        $this->assertEquals('New Profile', $profile->name);
        $this->assertEquals('1234567890', $profile->phone);
        
        // Test updating existing profile
        $updateData = [
            'name' => 'Updated Profile',
            'phone' => '0987654321',
        ];
        
        $updated = $this->userProfileService->createOrUpdateProfile($user->id, $updateData);
        
        $this->assertEquals($profile->id, $updated->id);
        $this->assertEquals('Updated Profile', $updated->name);
        $this->assertEquals('0987654321', $updated->phone);
    }
    
    /** @test */
    public function it_handles_base64_image_upload()
    {
        $user = User::factory()->create();
        $profile = UserProfile::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test User',
        ]);
        
        // Generate a base64 image
        $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);
        $base64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($file->path()));
        
        $data = [
            'name' => 'Image Test',
            'avatar' => $base64,
        ];
        
        $updated = $this->userProfileService->updateProfile($profile->id, $data);
        
        $this->assertNotNull($updated->avatar);
        $this->assertStringStartsWith('images/profiles/', $updated->avatar);
    }
}
