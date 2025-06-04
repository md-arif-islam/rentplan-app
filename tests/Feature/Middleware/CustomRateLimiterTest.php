<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\CustomRateLimiter;
use App\Models\User;
use App\Services\AuthLoggerService;
use Illuminate\Cache\RateLimiter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class CustomRateLimiterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Clear redis cache for rate limiting if it exists
        if (class_exists(Redis::class)) {
            Redis::flushall();
        }
    }

    /** @test */
    public function it_allows_requests_within_rate_limit()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Test 3 login requests which should be allowed
        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'password'
            ]);

            // Even though login will fail with 401, it should not be rate limited (429)
            $this->assertNotEquals(429, $response->getStatusCode());
        }
    }

    /** @test */
    public function it_blocks_requests_exceeding_rate_limit()
    {
        // Use direct middleware to test with controlled parameters
        $rateLimiter = app(RateLimiter::class);
        $authLogger = app(AuthLoggerService::class);
        $middleware = new CustomRateLimiter($rateLimiter, $authLogger);

        // Create mock request with email for auth route
        $request = Request::create('/api/login', 'POST', ['email' => 'ratelimit@test.com']);

        // Allow a max of 2 attempts
        $maxAttempts = 2;

        // Clear any existing rate limits
        $key = 'auth|ratelimit@test.com|127.0.0.1';
        $rateLimiter->clear($key);

        // First request should pass
        $response1 = $middleware->handle($request, function () {
            return response('OK', 200);
        }, 'auth', $maxAttempts, 1);

        $this->assertEquals(200, $response1->getStatusCode());

        // Second request should pass
        $response2 = $middleware->handle($request, function () {
            return response('OK', 200);
        }, 'auth', $maxAttempts, 1);

        $this->assertEquals(200, $response2->getStatusCode());

        // Third request should be rate limited
        $response3 = $middleware->handle($request, function () {
            return response('OK', 200);
        }, 'auth', $maxAttempts, 1);

        $this->assertEquals(429, $response3->getStatusCode());
        $this->assertArrayHasKey('retry_after', $response3->getData(true));

        // Verify the event was logged
        $this->assertDatabaseHas('auth_logs', [
            'email' => 'ratelimit@test.com',
            'action' => 'rate-limited',
        ]);
    }

    /** @test */
    public function it_adds_rate_limit_headers()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Make a request to an protected API endpoint
        $response = $this->getJson('/api/user');

        // Check that the rate limit headers are present
        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
    }

    /** @test */
    public function it_uses_different_limits_for_different_route_types()
    {
        // Make multiple requests to auth endpoint (limit of 5)
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'wrong']);
        }

        // The 6th should be rate limited
        $response = $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'wrong']);
        $this->assertEquals(429, $response->getStatusCode());

        // But public endpoint should still be accessible (different limit)
        $response = $this->getJson('/api/clear');
        $this->assertNotEquals(429, $response->getStatusCode());
    }
}
