<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

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
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $result = $this->authService->attemptLogin(
                $request->email, 
                $request->password
            );
            
            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 402);
        }
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
     * Send reset password link
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = $this->authService->sendPasswordResetLink($request->email);

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __('Password reset link sent')], 200)
            : response()->json(['error' => [__('Email could not be sent')]], 422);
    }

    /**
     * Reset user password
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

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
