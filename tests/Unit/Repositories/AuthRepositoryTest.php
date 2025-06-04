<?php

namespace Tests\Unit\Repositories;

use App\Models\User;
use App\Models\Role;
use App\Repositories\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected UserRepository $userRepository;
    protected User $testUser;

    public function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = new UserRepository();
        
        // Create a role
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);
        
        // Create a test user
        $this->testUser = User::factory()->create([
            'email' => 'repo_test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);
    }

    public function test_find_user_by_id()
    {
        $user = $this->userRepository->findById($this->testUser->id);
        
        $this->assertNotNull($user);
        $this->assertEquals($this->testUser->id, $user->id);
        $this->assertEquals('repo_test@example.com', $user->email);
    }

    public function test_find_user_by_email()
    {
        $user = $this->userRepository->findByEmail('repo_test@example.com');
        
        $this->assertNotNull($user);
        $this->assertEquals($this->testUser->id, $user->id);
    }

    public function test_delete_all_tokens()
    {
        // Create some tokens for the user
        $this->testUser->createToken('test1');
        $this->testUser->createToken('test2');
        
        // Verify tokens exist
        $this->assertCount(2, $this->testUser->tokens);
        
        // Delete tokens
        $this->userRepository->deleteAllTokens($this->testUser);
        
        // Reload user and check tokens
        $this->testUser->refresh();
        $this->assertCount(0, $this->testUser->tokens);
    }
}
