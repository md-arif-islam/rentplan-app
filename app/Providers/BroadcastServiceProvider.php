<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     */
    public function boot(): void {
        // This registers the routes necessary for broadcasting authentication.
        Broadcast::routes( ['middleware' => ['auth:sanctum']] );

        // Load the channels file (make sure you have defined your channels here)
        require base_path( 'routes/channels.php' );
    }
}
