<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware {
    /**
     * Handle an incoming request.
     */
    public function handle( Request $request, Closure $next ) {
        // Ensure the user is authenticated and has the 'admin' role.
        $user = auth()->user();

        if ( $user && $user->role == 'admin' ) {
            return $next( $request );
        }
        abort( 403, 'Unauthorized' );

    }
}