<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class DashboardService
{
    /**
     * Get admin dashboard statistics
     *
     * @return array
     */
    public function getAdminDashboardStats(): array
    {
        $totalCompanies = Company::count();
        $activeCompanies = Company::whereJsonContains('plan->plan_status', 'active')->count();
        $totalUsers = User::count();

        $recentCompanies = Company::latest()->take(5)->get();

        return [
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'activeCompanies' => $activeCompanies,
                'totalUsers' => $totalUsers,
            ],
            'recentCompanies' => $recentCompanies,
        ];
    }

    /**
     * Get company dashboard statistics
     *
     * @param int $companyId
     * @return array
     */
    public function getCompanyDashboardStats(int $companyId): array
    {
        $totalCustomers = Customer::where('company_id', $companyId)->count();
        $totalProducts = Product::where('company_id', $companyId)->count();
        $totalOrders = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        $activeOrders = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })
            ->where('order_status', 'active')
            ->count();

        $recentOrders = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })
            ->with(['customer', 'product'])
            ->latest()
            ->take(5)
            ->get();

        return [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'activeOrders' => $activeOrders,
            ],
            'recentOrders' => $recentOrders,
        ];
    }
}
