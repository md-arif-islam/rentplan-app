<?php

namespace App\Http\Middleware;

use App\Services\AuthLoggerService;
use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter as FacadesRateLimiter;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CustomRateLimiter
{
    protected $authLogger;
    protected $limiter;
    
    /**
     * Create a new middleware instance.
     *
     * @param RateLimiter $limiter
     * @param AuthLoggerService $authLogger
     */
    public function __construct(RateLimiter $limiter, AuthLoggerService $authLogger)
    {
        $this->limiter = $limiter;
        $this->authLogger = $authLogger;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $type = 'api', $maxAttempts = 60, $decaySeconds = 60): Response
    {
        // Generate a unique key for the rate limiter based on the request
        $key = $this->resolveRequestSignature($request, $type);
        
        // Check if the request has exceeded the rate limit
        if (FacadesRateLimiter::tooManyAttempts($key, $maxAttempts)) {
            // Log the rate limit exceeded event
            if ($email = $request->input('email')) {
                $this->authLogger->log('rate-limited', null, $email, [
                    'type' => $type,
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);
            } else {
                $this->authLogger->log('rate-limited', null, null, [
                    'type' => $type,
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);
            }
            
            return $this->buildTooManyAttemptsResponse($request, $key);
        }
        
        // Increment the rate limiter
        FacadesRateLimiter::hit($key, $decaySeconds);
        
        // Add rate limit headers to the response
        $response = $next($request);
        return $this->addHeaders(
            $response,
            $maxAttempts,
            FacadesRateLimiter::retriesLeft($key, $maxAttempts)
        );
    }
    
    /**
     * Resolve request signature.
     *
     * @param Request $request
     * @param string $type
     * @return string
     */
    protected function resolveRequestSignature($request, $type)
    {
        // For auth routes, use the email as part of the key if available
        if ($type === 'auth' && $email = $request->input('email')) {
            return Str::lower($type.'|'.$email.'|'.$request->ip());
        }
        
        // For API routes, use the user ID if authenticated
        if ($request->user()) {
            return Str::lower($type.'|'.$request->user()->id.'|'.$request->ip());
        }
        
        // Default to IP address
        return Str::lower($type.'|'.$request->ip());
    }
    
    /**
     * Create a 'too many attempts' response.
     *
     * @param Request $request
     * @param string $key
     * @return Response
     */
    protected function buildTooManyAttemptsResponse(Request $request, $key)
    {
        $retryAfter = FacadesRateLimiter::availableIn($key);
        
        return response()->json([
            'message' => 'Too many attempts, please try again later.',
            'retry_after' => $retryAfter,
            'seconds_until_retry' => $retryAfter,
        ], 429)->header('Retry-After', $retryAfter);
    }
    
    /**
     * Add the rate limit headers to the given response.
     *
     * @param Response $response
     * @param int $maxAttempts
     * @param int $remainingAttempts
     * @return Response
     */
    protected function addHeaders($response, $maxAttempts, $remainingAttempts)
    {
        return $response->withHeaders([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remainingAttempts,
        ]);
    }
}
