<?php

namespace App\Http\Controllers;

use App\Models\AuthLog;
use App\Models\Company;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard data.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function adminDashboard()
    {
        // Get company statistics
        $totalCompanies = Company::count();
        $activeCompanies = Company::where('plan->plan_status', 'active')->count();
        $trialCompanies = Company::where('plan->plan_status', 'trial')->count();
        $inactiveCompanies = Company::whereIn('plan->plan_status', ['inactive', 'expired'])->count();

        // Get user statistics
        $totalUsers = User::count();
        $recentLogins = AuthLog::where('action', 'login')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // Calculate revenue
        $totalRevenue = Company::sum('plan->plan_price');
        $monthlyRevenue = Company::where('plan->plan_status', 'active')
            ->whereDate('created_at', '>=', now()->startOfMonth())
            ->sum('plan->plan_price');

        // Get company trend data for the last 12 months
        $companyTrends = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M Y');
            $count = Company::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $companyTrends[] = [
                'month' => $month,
                'count' => $count
            ];
        }

        // Recent activity (logins, new companies, etc.)
        $recentActivity = [];

        // Recent company additions
        $recentCompanies = Company::latest()->take(5)->get();
        foreach ($recentCompanies as $company) {
            $recentActivity[] = [
                'type' => 'company',
                'message' => "Company \"{$company->name}\" was created",
                'timestamp' => $company->created_at->diffForHumans()
            ];
        }

        // Recent logins
        $recentLoginLogs = AuthLog::where('action', 'login')
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        foreach ($recentLoginLogs as $log) {
            if ($log->user) {
                $recentActivity[] = [
                    'type' => 'login',
                    'message' => "{$log->user->email} logged in",
                    'timestamp' => $log->created_at->diffForHumans()
                ];
            }
        }

        // Sort by most recent
        usort($recentActivity, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        $recentActivity = array_slice($recentActivity, 0, 10);

        // Get upcoming plan expirations in the next 30 days
        $upcomingExpiries = [];
        $expiringCompanies = Company::whereNotNull('plan->plan_expiry_date')
            ->where('plan->plan_status', '!=', 'expired')
            ->get();

        foreach ($expiringCompanies as $company) {
            $expiryDate = Carbon::parse($company->plan['plan_expiry_date']);
            $daysLeft = now()->diffInDays($expiryDate, false);

            // Only include if expiring within 30 days and not already expired
            if ($daysLeft >= 0 && $daysLeft <= 30) {
                $upcomingExpiries[] = [
                    'id' => $company->id,
                    'name' => $company->name,
                    'plan' => $company->plan['plan_name'],
                    'expiry_date' => $expiryDate->format('M d, Y'),
                    'days_left' => $daysLeft
                ];
            }
        }

        // Sort by days left (ascending)
        usort($upcomingExpiries, function ($a, $b) {
            return $a['days_left'] <=> $b['days_left'];
        });
        $upcomingExpiries = array_slice($upcomingExpiries, 0, 10);

        return response()->json([
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'activeCompanies' => $activeCompanies,
                'trialCompanies' => $trialCompanies,
                'inactiveCompanies' => $inactiveCompanies,
                'totalUsers' => $totalUsers,
                'recentLogins' => $recentLogins,
                'totalRevenue' => $totalRevenue,
                'monthlyRevenue' => $monthlyRevenue,
            ],
            'companyTrends' => $companyTrends,
            'recentActivity' => $recentActivity,
            'upcomingExpiries' => $upcomingExpiries,
        ]);
    }

    /**
     * Display company dashboard data.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function companyDashboard(Request $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        // Get company details
        $company = Company::with('users')->findOrFail($companyId);

        // User statistics
        $totalUsers = $company->users()->count();

        // Get plan information
        $plan = $company->plan ?? [];
        $planName = $plan['plan_name'] ?? 'No Plan';
        $planStatus = $plan['plan_status'] ?? 'inactive';
        $planExpiry = isset($plan['plan_expiry_date']) ? Carbon::parse($plan['plan_expiry_date'])->format('M d, Y') : 'N/A';
        $daysLeft = isset($plan['plan_expiry_date']) ? now()->diffInDays(Carbon::parse($plan['plan_expiry_date']), false) : 0;

        // Fix order count issues - directly query the orders table with company_id
        $totalCustomers = 0;
        $totalProducts = 0;
        $totalOrders = 0;
        $activeRentals = 0;

        try {
            // Use DB facade to query directly for more reliable results
            $totalCustomers = \DB::table('customers')->where('company_id', $companyId)->count();
            $totalProducts = \DB::table('products')->where('company_id', $companyId)->count();
            $totalOrders = \DB::table('orders')->where('company_id', $companyId)->count();
            $activeRentals = \DB::table('orders')
                ->where('company_id', $companyId)
                ->where('order_status', 'active')
                ->count();
        } catch (\Exception $e) {
            // Log error but continue
            \Log::error('Error counting dashboard items: ' . $e->getMessage());
        }

        // Monthly order trends with direct DB query
        $orderTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M Y');

            $count = 0;
            try {
                $count = \DB::table('orders')
                    ->where('company_id', $companyId)
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
            } catch (\Exception $e) {
                // Keep count as 0 if query fails
            }

            $orderTrends[] = [
                'month' => $month,
                'count' => $count
            ];
        }

        // Prepare empty arrays to avoid errors
        $recentActivity = [];
        $upcomingReturns = [];

        // Recent activity (only add if the related models exist)
        if (method_exists($company, 'orders') && class_exists('App\Models\Order') && class_exists('App\Models\Customer')) {
            try {
                // Recent orders
                $recentOrders = $company->orders()->with('customer')->latest()->take(5)->get();
                foreach ($recentOrders as $order) {
                    if ($order->customer) {
                        $recentActivity[] = [
                            'type' => 'order',
                            'message' => "New order for customer \"{$order->customer->first_name} {$order->customer->last_name}\"",
                            'timestamp' => $order->created_at->diffForHumans()
                        ];
                    }
                }
            } catch (\Exception $e) {
                // Skip if there's an error
            }
        }

        if (method_exists($company, 'customers') && class_exists('App\Models\Customer')) {
            try {
                // Recent customers
                $recentCustomers = $company->customers()->latest()->take(5)->get();
                foreach ($recentCustomers as $customer) {
                    $recentActivity[] = [
                        'type' => 'customer',
                        'message' => "New customer \"{$customer->first_name} {$customer->last_name}\" added",
                        'timestamp' => $customer->created_at->diffForHumans()
                    ];
                }
            } catch (\Exception $e) {
                // Skip if there's an error
            }
        }

        if (method_exists($company, 'products') && class_exists('App\Models\Product')) {
            try {
                // Recent products
                $recentProducts = $company->products()->latest()->take(5)->get();
                foreach ($recentProducts as $product) {
                    $recentActivity[] = [
                        'type' => 'product',
                        'message' => "New product \"{$product->name}\" added",
                        'timestamp' => $product->created_at->diffForHumans()
                    ];
                }
            } catch (\Exception $e) {
                // Skip if there's an error
            }
        }

        // Sort by timestamp if we have any activities
        if (!empty($recentActivity)) {
            usort($recentActivity, function ($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            $recentActivity = array_slice($recentActivity, 0, 10);
        }

        // Upcoming returns (only add if Order model exists)
        if (
            method_exists($company, 'orders') && class_exists('App\Models\Order') &&
            class_exists('App\Models\Customer') && class_exists('App\Models\Product')
        ) {
            try {
                $endingOrders = $company->orders()
                    ->where('order_status', 'active')
                    ->where('end_date', '>=', now())
                    ->where('end_date', '<=', now()->addDays(10))
                    ->with('customer', 'product')
                    ->get();

                foreach ($endingOrders as $order) {
                    if ($order->customer && $order->product) {
                        $daysLeft = now()->diffInDays(Carbon::parse($order->end_date), false);

                        $upcomingReturns[] = [
                            'id' => $order->id,
                            'customer_name' => "{$order->customer->first_name} {$order->customer->last_name}",
                            'product_name' => $order->product->name,
                            'end_date' => Carbon::parse($order->end_date)->format('M d, Y'),
                            'days_left' => $daysLeft
                        ];
                    }
                }

                // Sort by days left
                if (!empty($upcomingReturns)) {
                    usort($upcomingReturns, function ($a, $b) {
                        return $a['days_left'] <=> $b['days_left'];
                    });
                }
            } catch (\Exception $e) {
                // Keep empty array if error occurs
            }
        }

        return response()->json([
            'company' => [
                'name' => $company->name,
                'plan' => $planName,
                'planStatus' => $planStatus,
                'planExpiry' => $planExpiry,
                'daysLeft' => $daysLeft,
            ],
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'activeRentals' => $activeRentals,
            ],
            'orderTrends' => $orderTrends,
            'recentActivity' => $recentActivity,
            'upcomingReturns' => $upcomingReturns,
        ]);
    }
}
