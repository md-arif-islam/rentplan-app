<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\CustomResetPasswordNotification;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class AuthService
{
    protected $userRepository;
    protected $authLogger;

    /**
     * Constructor
     *
     * @param UserRepository $userRepository
     * @param AuthLoggerService $authLogger
     */
    public function __construct(UserRepository $userRepository, AuthLoggerService $authLogger)
    {
        $this->userRepository = $userRepository;
        $this->authLogger = $authLogger;
    }

    /**
     * Attempt to authenticate a user
     *
     * @param string $email
     * @param string $password
     * @return array
     * @throws \Exception
     */
    public function attemptLogin(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            // Log failed login attempt
            $this->authLogger->logFailedLogin($email);
            throw new \Exception('Invalid credentials', 401);
        }

        // Check if account is active
        if ($user->status === 'suspended') {
            $this->authLogger->logFailedLogin($email);
            throw new \Exception('This account has been suspended. Please contact support.', 403);
        }

        // Update last login information
        $user->last_login_at = now();
        $user->last_login_ip = request()->ip();
        $user->save();

        $token = $user->createToken($email)->plainTextToken;

        // Load relationships
        $user->load(['role', 'userProfile']);

        // Log successful login
        $this->authLogger->logLogin($user->id, $user->email);

        return [
            'token' => $token,
            'user' => $user,
            'message' => 'User logged in successfully',
        ];
    }

    /**
     * Log a user out
     *
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        $this->userRepository->deleteAllTokens($user);

        // Log logout event
        $this->authLogger->logLogout($user->id, $user->email);
    }

    /**
     * Send password reset link
     *
     * @param string $email
     * @return string
     */
    public function sendPasswordResetLink(string $email): string
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            return Password::INVALID_USER;
        }

        // Implement throttling for password reset requests
        $key = 'password-reset:' . $email;

        // Allow only 3 password reset requests per 60 minutes
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $this->authLogger->log('password-reset-throttled', null, $email, [
                'seconds_until_retry' => RateLimiter::availableIn($key)
            ]);

            return Password::RESET_THROTTLED;
        }

        RateLimiter::hit($key, 60 * 60); // 1 hour

        $status = Password::sendResetLink(
            ['email' => $email],
            function ($user, $token) {
                $url = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
                $user->notify(new CustomResetPasswordNotification($token, $url));
            }
        );

        // Log password reset request
        $this->authLogger->logPasswordResetRequest($email);

        return $status;
    }

    /**
     * Reset user password
     *
     * @param string $email
     * @param string $password
     * @return bool
     * @throws \Exception
     */
    public function resetPassword(string $email, string $password): bool
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        DB::beginTransaction();

        try {
            $user->password = Hash::make($password);
            $user->setRememberToken(Str::random(60));
            $user->force_password_change = false;
            $user->save();

            // Clear any login throttling for this user
            RateLimiter::clear('login:' . $email);

            event(new PasswordReset($user));

            // Log successful password reset
            $this->authLogger->logPasswordReset($user->id, $user->email);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
