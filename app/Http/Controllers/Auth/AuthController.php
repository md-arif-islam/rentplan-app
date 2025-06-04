<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Str;
use Illuminate\Validation\ValidationException;

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
            ], $e->getCode() ?: 401);
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
        return Str::transliterate(strtolower($email).'|'.request()->ip());
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
        auth()->logout(); if ($user) {
        
        return response()->json([   }
            'message' => 'Successfully logged out',
        ], 200);        return response()->json([
    }
        ], 200);
    /**
     * Send password reset link
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)minate\Http\JsonResponse
    {
        $request->validate(['email' => 'required|email']);    public function sendResetLinkEmail(Request $request)

        $status = $this->authService->sendPasswordResetLink($request->email);

        if ($status === Password::RESET_THROTTLED) {   $status = $this->authService->sendPasswordResetLink($request->email);
            $key = 'password-reset:'.$request->email;
             if ($status === Password::RESET_THROTTLED) {
            return response()->json([rd-reset:'.$request->email;
                'message' => 'Too many password reset attempts, please try again later.',     
                'seconds_until_retry' => RateLimiter::availableIn($key),
            ], 429);ord reset attempts, please try again later.',
        }         'seconds_until_retry' => RateLimiter::availableIn($key),

        return $status === Password::RESET_LINK_SENT   }
            ? response()->json(['message' => __('Password reset link sent')], 200)
            : response()->json(['error' => [__('Email could not be sent')]], 422);
    }? response()->json(['message' => __('Password reset link sent')], 200)
r' => [__('Email could not be sent')]], 422);
    /**
     * Reset user password
     * 
     * @param ResetPasswordRequest $request
     * @return \Illuminate\Http\JsonResponse
     */asswordRequest $request
    public function resetPassword(ResetPasswordRequest $request)eturn \Illuminate\Http\JsonResponse
    {*/
        try {    public function resetPassword(ResetPasswordRequest $request)
            $this->authService->resetPassword($request->email, $request->password);
            
            return response()->json([     $this->authService->resetPassword($request->email, $request->password);
                'message' => 'Password reset successfully',
            ], 200);son([
        } catch (\Exception $e) { successfully',
            return response()->json([     ], 200);
                'message' => $e->getMessage(),
            ], 500);       return response()->json([
        }getMessage(),
    }

    /**
     * Show reset password form
     *    /**
     * @param Request $request     * Show reset password form












}    }        ], 200);            'email' => $request->email,            'token' => $token,        return response()->json([    {    public function showResetForm(Request $request, $token = null)     */     * @return \Illuminate\Http\JsonResponse     * @param string|null $token     * 
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
