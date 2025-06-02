<?php

namespace App\Http\Controllers;

use App\Models\Breeder;
use App\Models\Customer;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Dashboard',
        ]);
    }
}