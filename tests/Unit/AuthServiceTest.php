<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Role;
use App\Repositories\UserRepository;
use App\Services\AuthLoggerService;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Mockery;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserRepository $userRepository;
    protected AuthLoggerService $authLogger;
    protected AuthService $authService;

    public function setUp(): void
    {
        parent::setUp();

        // We'll use real repositories but mock the logger
        $this->userRepository = new UserRepository();
        $this->authLogger = Mockery::mock(AuthLoggerService::class);

        // Don't log during tests
        $this->authLogger->shouldReceive('logLogin')->andReturn(null);
        $this->authLogger->shouldReceive('logFailedLogin')->andReturn(null);
        $this->authLogger->shouldReceive('logLogout')->andReturn(null);

        $this->authService = new AuthService(
            $this->userRepository,
            $this->authLogger
        );
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_attempt_login_with_valid_credentials()
    {
        // Create a role
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);

        // Create user with known password
        $user = User::factory()->create([
            'email' => 'service_test@example.com',
            'password' => Hash::make('correct_password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);

        // Test login
        $result = $this->authService->attemptLogin('service_test@example.com', 'correct_password');

        // Assert
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertEquals($user->id, $result['user']->id);
    }

    public function test_attempt_login_with_invalid_credentials()
    {
        // Create a role
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);

        // Create user with known password
        $user = User::factory()->create([
            'email' => 'service_test@example.com',
            'password' => Hash::make('correct_password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);

        // Test login with wrong password
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid credentials');

        $this->authService->attemptLogin('service_test@example.com', 'wrong_password');
    }
}
