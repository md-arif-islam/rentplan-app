<?php

namespace Tests\Feature\Services;

use App\Models\AuthLog;
use App\Models\User;
use App\Services\AuthLoggerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoggerServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $authLogger;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        $this->authLogger = new AuthLoggerService();
    }

    /** @test */
    public function it_logs_login_events()
    {
        $user = User::factory()->create();

        $this->authLogger->logLogin($user->id, $user->email);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'login',
        ]);
    }

    /** @test */
    public function it_logs_logout_events()
    {
        $user = User::factory()->create();

        $this->authLogger->logLogout($user->id, $user->email);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'logout',
        ]);
    }

    /** @test */
    public function it_logs_failed_login_events()
    {
        $email = 'failed@example.com';

        $this->authLogger->logFailedLogin($email);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => null,
            'email' => $email,
            'action' => 'failed-login',
        ]);
    }

    /** @test */
    public function it_logs_password_reset_requests()
    {
        $email = 'reset@example.com';

        $this->authLogger->logPasswordResetRequest($email);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => null,
            'email' => $email,
            'action' => 'password-reset-request',
        ]);
    }

    /** @test */
    public function it_logs_successful_password_resets()
    {
        $user = User::factory()->create();

        $this->authLogger->logPasswordReset($user->id, $user->email);

        $this->assertDatabaseHas('auth_logs', [
            'user_id' => $user->id,
            'email' => $user->email,
            'action' => 'password-reset',
        ]);
    }

    /** @test */
    public function it_logs_user_agent_details()
    {
        // Set a mock user agent string
        $this->withServerVariables(['HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36']);

        $user = User::factory()->create();

        $this->authLogger->logLogin($user->id, $user->email);

        $log = AuthLog::where('user_id', $user->id)
            ->where('action', 'login')
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', $log->user_agent);

        // Check that metadata contains user agent details
        $metadata = $log->metadata;
        $this->assertArrayHasKey('user_agent_details', $metadata);
        $this->assertArrayHasKey('browser', $metadata['user_agent_details']);
        $this->assertArrayHasKey('platform', $metadata['user_agent_details']);
    }

    /** @test */
    public function it_logs_metadata_parameters()
    {
        $user = User::factory()->create();

        $metadata = [
            'ip_location' => 'test location',
            'custom_field' => 'custom value',
        ];

        $this->authLogger->log('custom-action', $user->id, $user->email, $metadata);

        $log = AuthLog::where('user_id', $user->id)
            ->where('action', 'custom-action')
            ->first();

        $this->assertNotNull($log);
        $logMetadata = $log->metadata;

        $this->assertArrayHasKey('ip_location', $logMetadata);
        $this->assertEquals('test location', $logMetadata['ip_location']);
        $this->assertArrayHasKey('custom_field', $logMetadata);
        $this->assertEquals('custom value', $logMetadata['custom_field']);
    }
}
