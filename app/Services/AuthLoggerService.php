<?php

namespace App\Services;

use App\Models\AuthLog;
use Illuminate\Http\Request;

class AuthLoggerService
{
    /**
     * Log an authentication event
     *
     * @param string $action
     * @param int|null $userId
     * @param string|null $email
     * @param array $metadata
     * @return void
     */
    public function log(string $action, ?int $userId = null, ?string $email = null, array $metadata = []): void
    {
        $request = request();
        
        AuthLog::create([
            'user_id' => $userId,
            'email' => $email,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $metadata,
        ]);
    }
    
    /**
     * Log a successful login
     *
     * @param int $userId
     * @param string $email
     * @return void
     */
    public function logLogin(int $userId, string $email): void
    {
        $this->log('login', $userId, $email);
    }
    
    /**
     * Log a logout
     *
     * @param int $userId
     * @param string $email
     * @return void
     */
    public function logLogout(int $userId, string $email): void
    {
        $this->log('logout', $userId, $email);
    }
    
    /**
     * Log a password reset request
     *
     * @param string $email
     * @return void
     */
    public function logPasswordResetRequest(string $email): void
    {
        $this->log('password-reset-request', null, $email);
    }
    
    /**
     * Log a successful password reset
     *
     * @param int $userId
     * @param string $email
     * @return void
     */
    public function logPasswordReset(int $userId, string $email): void
    {
        $this->log('password-reset', $userId, $email);
    }
    
    /**
     * Log a failed login attempt
     *
     * @param string $email
     * @return void
     */
    public function logFailedLogin(string $email): void
    {
        $this->log('failed-login', null, $email);
    }
}
