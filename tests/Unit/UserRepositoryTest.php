<?php

namespace Tests\Unit;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected UserRepository $userRepository;

    public function setUp(): void
    {
        parent::setUp();
        $this->userRepository = new UserRepository();
    }

    public function test_find_by_email()
    {
        // Create a test user
        $user = User::factory()->create([
            'email' => 'repository_test@example.com',
        ]);

        // Use repository to find user
        $foundUser = $this->userRepository->findByEmail('repository_test@example.com');

        // Assert user was found
        $this->assertNotNull($foundUser);
        $this->assertEquals($user->id, $foundUser->id);
        $this->assertEquals('repository_test@example.com', $foundUser->email);
    }

    public function test_create_user()
    {
        // Create user data
        $userData = [
            'email' => 'new_user@example.com',
            'password' => bcrypt('password'),
            'role_id' => 1,
            'company_id' => 1,
        ];

        // Use repository to create user
        $user = $this->userRepository->create($userData);

        // Assert user was created
        $this->assertNotNull($user);
        $this->assertEquals('new_user@example.com', $user->email);
        $this->assertEquals(1, $user->role_id);
        $this->assertEquals(1, $user->company_id);
    }
}
