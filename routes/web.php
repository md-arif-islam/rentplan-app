<?php

use Illuminate\Support\Facades\Route;

Route::get( '/{any}', function () {
    return response()->file( public_path( 'dist/index.html' ) );
} )->where( 'any', '.*' );
