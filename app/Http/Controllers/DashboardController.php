<?php

namespace App\Http\Controllers;

use App\Models\Breeder;
use App\Models\Customer;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    protected $dashboardService;
    
    /**
     * Constructor
     * 
     * @param DashboardService $dashboardService
     */
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }
    
    /**
     * Super admin dashboard
     */
    public function adminDashboard()
    {
        $data = $this->dashboardService->getAdminDashboardStats();
        
        return response()->json([
            'message' => 'Admin dashboard data',
            'data' => $data,
        ]);
    }
    
    /**
     * Company admin dashboard
     */
    public function companyDashboard()
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        $data = $this->dashboardService->getCompanyDashboardStats($companyId);
        
        return response()->json([
            'message' => 'Company dashboard data',
            'data' => $data,
        ]);
    }
    
    /**
     * Generic dashboard endpoint - now delegates to appropriate dashboard
     */
    public function index()
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }
        
        $userRole = $currentUser->role->name ?? null;
        
        if ($userRole === 'super_admin') {
            return $this->adminDashboard();
        } elseif ($userRole === 'company_admin') {
            return $this->companyDashboard();
        }
        
        return response()->json([
            'message' => 'Dashboard',
        ]);
    }
}