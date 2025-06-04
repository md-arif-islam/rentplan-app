<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyUserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserProfileController;
use App\Http\Middleware\CompanyAdminMiddleware;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Support\Facades\Route;

// -------------------- Guest routes related to authentication ----------------------
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-reset-link-email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/reset-password/{token}', [AuthController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
Route::get('/user', [AuthController::class, 'authCheck']);


// -------------------- Super Admin routes ----------------------
Route::prefix('admin')->middleware(['auth:sanctum', SuperAdminMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);

    // Profiles
    Route::get('/profile/{id}', [UserProfileController::class, 'show']);
    Route::put('/profile/{id}', [UserProfileController::class, 'update']);
    Route::get('/profile/user/{userId}', [UserProfileController::class, 'showByUserId']);

    // Companies
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::post('/companies', [CompanyController::class, 'store']);
    Route::put('/companies/{company}', [CompanyController::class, 'update']);
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);


    // Add more admin-specific routes here
});

// -------------------- Company Admin routes ----------------------
Route::prefix('company')->middleware(['auth:sanctum', CompanyAdminMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'companyDashboard']);
    Route::get('/profile/{id}', [UserProfileController::class, 'show']);
    Route::put('/profile/{id}', [UserProfileController::class, 'update']);

    // Company user management routes
    Route::get('/users', [CompanyUserController::class, 'index']);
    Route::post('/users', [CompanyUserController::class, 'store']);
    Route::get('/users/{id}', [CompanyUserController::class, 'show']);
    Route::put('/users/{id}', [CompanyUserController::class, 'update']);
    Route::delete('/users/{id}', [CompanyUserController::class, 'destroy']);
    Route::get('/roles', [CompanyUserController::class, 'getRoles']);

    // Customer management routes
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

    // Product management routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Order management routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // Add more company-specific routes here
});

// -------------------- Public routes ----------------------
Route::prefix('public')->group(function () {
    // Public routes here
});

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
