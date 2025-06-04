<?php

namespace Tests\Unit\Services;

use App\Models\Role;
use App\Models\User;
use App\Services\AuthLoggerService;
use App\Services\AuthService;
use App\Repositories\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Mockery;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $userRepositoryMock;
    protected $authLoggerMock;
    protected $authService;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        $this->userRepositoryMock = Mockery::mock(UserRepository::class);
        $this->authLoggerMock = Mockery::mock(AuthLoggerService::class);

        $this->authService = new AuthService(
            $this->userRepositoryMock,
            $this->authLoggerMock
        );
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_authenticates_user_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'role_id' => Role::where('name', 'company_admin')->first()->id
        ]);

        $this->userRepositoryMock
            ->shouldReceive('findByEmail')
            ->with('test@example.com')
            ->once()
            ->andReturn($user);

        $this->authLoggerMock
            ->shouldReceive('logLogin')
            ->with($user->id, $user->email)
            ->once();

        $result = $this->authService->attemptLogin('test@example.com', 'password123');

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertEquals($user->id, $result['user']->id);
        $this->assertEquals('User logged in successfully', $result['message']);
    }

    /** @test */
    public function it_throws_exception_for_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->userRepositoryMock
            ->shouldReceive('findByEmail')
            ->with('test@example.com')
            ->once()
            ->andReturn($user);

        $this->authLoggerMock
            ->shouldReceive('logFailedLogin')
            ->with('test@example.com')
            ->once();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid credentials');
        $this->expectExceptionCode(401);

        $this->authService->attemptLogin('test@example.com', 'wrong_password');
    }

    /** @test */
    public function it_throws_exception_for_suspended_account()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'status' => 'suspended',
        ]);

        $this->userRepositoryMock
            ->shouldReceive('findByEmail')
            ->with('test@example.com')
            ->once()
            ->andReturn($user);

        $this->authLoggerMock
            ->shouldReceive('logFailedLogin')
            ->with('test@example.com')
            ->once();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('This account has been suspended. Please contact support.');
        $this->expectExceptionCode(403);

        $this->authService->attemptLogin('test@example.com', 'password123');
    }

    /** @test */
    public function it_logs_out_user()
    {
        $user = User::factory()->create();
        $user->createToken('test-token')->plainTextToken;

        $this->userRepositoryMock
            ->shouldReceive('deleteAllTokens')
            ->with($user)
            ->once();

        $this->authLoggerMock
            ->shouldReceive('logLogout')
            ->with($user->id, $user->email)
            ->once();

        $this->authService->logout($user);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /** @test */
    public function it_throttles_password_reset_requests()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->userRepositoryMock
            ->shouldReceive('findByEmail')
            ->with('test@example.com')
            ->andReturn($user);

        // Clear any existing rate limits
        RateLimiter::clear('password-reset:test@example.com');

        // Make 3 requests to hit the limit
        $this->authService->sendPasswordResetLink('test@example.com');
        $this->authService->sendPasswordResetLink('test@example.com');
        $this->authService->sendPasswordResetLink('test@example.com');

        // The 4th should be throttled
        $status = $this->authService->sendPasswordResetLink('test@example.com');

        $this->assertEquals('passwords.throttled', $status);
    }
}
