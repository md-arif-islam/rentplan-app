<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompanyAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (
            $user &&
            $user->role &&
            $user->role->name === 'company_admin' &&
            $user->role->scope === 'company'
        ) {
            return $next($request);
        }

        return response()->json(['message' => 'You do not have access to this resource'], 403);
    }
}
