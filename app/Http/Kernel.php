<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // ...existing code...

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
        // ...existing code...
        'auth.super_admin' => \App\Http\Middleware\SuperAdminMiddleware::class,
        'auth.company_admin' => \App\Http\Middleware\CompanyAdminMiddleware::class,
        'custom.throttle' => \App\Http\Middleware\CustomRateLimiter::class,
    ];

    // ...existing code...
}