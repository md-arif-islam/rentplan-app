<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    protected $authService;

    /**
     * Constructor
     *
     * @param AuthService $authService
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Authenticate user login
     *
     * @param LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        try {
            $result = $this->authService->attemptLogin(
                $request->email,
                $request->password
            );

            // Clear rate limiting for successful logins
            RateLimiter::clear($this->throttleKey($request->email));
            return response()->json($result, 200);
        } catch (\Exception $e) {
            // Increment rate limiting on failed attempts
            RateLimiter::hit($this->throttleKey($request->email));

            return response()->json([
                'message' => $e->getMessage(),
            ],  402);
        }
    }

    /**
     * Get the throttle key for the given email
     *
     * @param  string  $email
     * @return string
     */
    private function throttleKey(string $email)
    {
        return Str::transliterate(strtolower($email) . '|' . request()->ip());
    }

    /**
     * Return authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function authCheck(Request $request)
    {
        return $request->user();
    }

    /**
     * Logout user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $user = auth()->user();

        if ($user) {
            $this->authService->logout($user);
        }

        return response()->json([
            'message' => 'User logged out successfully',
        ], 200);
    }

    /**
     * Send password reset link
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = $this->authService->sendPasswordResetLink($request->email);

        if ($status === Password::RESET_THROTTLED) {
            $key = 'password-reset:' . $request->email;

            return response()->json([
                'message' => 'Too many password reset attempts, please try again later.',
                'seconds_until_retry' => RateLimiter::availableIn($key),
            ], 429);
        }

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __('Password reset link sent')], 200)
            : response()->json(['error' => [__('Email could not be sent')]], 422);
    }

    /**
     * Reset user password
     *
     * @param ResetPasswordRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $this->authService->resetPassword($request->email, $request->password);

            return response()->json([
                'message' => 'Password reset successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show reset password form
     *
     * @param Request $request
     * @param string|null $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function showResetForm(Request $request, $token = null)
    {
        return response()->json([
            'token' => $token,
            'email' => $request->email,
        ], 200);
    }
}
