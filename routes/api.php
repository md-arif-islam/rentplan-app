<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserProfileController;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Support\Facades\Route;

// -------------------- Guest routes related to authentication ----------------------
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-reset-link-email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/reset-password/{token}', [AuthController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
Route::get('/user', [AuthController::class, 'authCheck']);


// -------------------- Admin routes ----------------------
Route::prefix('admin')->middleware(['auth:sanctum', SuperAdminMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Profiles
    Route::get('/profile/{id}', [UserProfileController::class, 'show']);
    Route::put('/profile/{id}', [UserProfileController::class, 'update']);
    Route::get('/profile/user/{userId}', [UserProfileController::class, 'showByUserId']);
});

// -------------------- Public routes ----------------------
Route::prefix('public')->group(function () {});

Route::get('/clear', function () {
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('config:cache');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('route:cache');
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return 'Cleared';
});