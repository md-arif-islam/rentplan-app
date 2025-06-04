<?php

namespace App\Providers;

use App\Repositories\CompanyRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\Repositories\UserProfileRepository;
use App\Repositories\UserRepository;
use App\Services\AuthLoggerService;
use App\Services\AuthService;
use App\Services\CompanyService;
use App\Services\CustomerService;
use App\Services\DashboardService;
use App\Services\OrderService;
use App\Services\ProductService;
use App\Services\UserProfileService;
use App\Services\UserService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register repositories
        $this->app->bind(UserRepository::class, function ($app) {
            return new UserRepository();
        });
        
        $this->app->bind(CompanyRepository::class, function ($app) {
            return new CompanyRepository();
        });
        
        $this->app->bind(ProductRepository::class, function ($app) {
            return new ProductRepository();
        });
        
        $this->app->bind(CustomerRepository::class, function ($app) {
            return new CustomerRepository();
        });
        
        $this->app->bind(OrderRepository::class, function ($app) {
            return new OrderRepository();
        });
        
        $this->app->bind(UserProfileRepository::class, function ($app) {
            return new UserProfileRepository();
        });
        
        // Register services
        $this->app->bind(AuthLoggerService::class, function ($app) {
            return new AuthLoggerService();
        });
        
        $this->app->bind(AuthService::class, function ($app) {
            return new AuthService(
                $app->make(UserRepository::class),
                $app->make(AuthLoggerService::class)
            );
        });
        
        $this->app->bind(UserService::class, function ($app) {
            return new UserService(
                $app->make(UserRepository::class)
            );
        });
        
        $this->app->bind(UserProfileService::class, function ($app) {
            return new UserProfileService(
                $app->make(UserProfileRepository::class)
            );
        });
        
        $this->app->bind(CompanyService::class, function ($app) {
            return new CompanyService(
                $app->make(CompanyRepository::class)
            );
        });
        
        $this->app->bind(DashboardService::class, function ($app) {
            return new DashboardService();
        });
        
        $this->app->bind(ProductService::class, function ($app) {
            return new ProductService(
                $app->make(ProductRepository::class)
            );
        });
        
        $this->app->bind(CustomerService::class, function ($app) {
            return new CustomerService(
                $app->make(CustomerRepository::class)
            );
        });
        
        $this->app->bind(OrderService::class, function ($app) {
            return new OrderService(
                $app->make(OrderRepository::class),
                $app->make(CustomerRepository::class),
                $app->make(ProductRepository::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
