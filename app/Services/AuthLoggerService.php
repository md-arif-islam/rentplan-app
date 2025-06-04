<?php

namespace App\Services;

use App\Models\AuthLog;
use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;

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
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        // Get useful information from Agent
        $deviceType = $this->getDeviceType($agent);
        $browser = $agent->browser();
        $browserVersion = $agent->version($browser);
        $platform = $agent->platform();
        $platformVersion = $agent->version($platform);

        $agentInfo = [
            'browser' => $browser,
            'browser_version' => $browserVersion,
            'platform' => $platform,
            'platform_version' => $platformVersion,
            'device_type' => $deviceType,
            'is_mobile' => $agent->isMobile(),
            'is_tablet' => $agent->isTablet(),
            'is_desktop' => $agent->isDesktop(),
            'is_robot' => $agent->isRobot(),
        ];

        // Merge agent info with provided metadata
        $enhancedMetadata = array_merge($metadata, ['user_agent_details' => $agentInfo]);

        AuthLog::create([
            'user_id' => $userId,
            'email' => $email,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $enhancedMetadata,
        ]);
    }

    /**
     * Get device type based on Agent detection
     *
     * @param Agent $agent
     * @return string
     */
    private function getDeviceType(Agent $agent): string
    {
        if ($agent->isTablet()) {
            return 'tablet';
        } elseif ($agent->isPhone()) {
            return 'phone';
        } elseif ($agent->isRobot()) {
            return 'robot';
        } elseif ($agent->isDesktop()) {
            return 'desktop';
        }

        return 'unknown';
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
