<?php

namespace App\Http\Controllers;

use App\Models\Breeder;
use App\Models\Customer;

class DashboardController extends Controller {
    public function index() {
        $totalBreeders = Breeder::count();
        $totalCustomers = Customer::count();

        return response()->json( [
            'total_breeders' => $totalBreeders,
            'total_customers' => $totalCustomers,
        ] );
    }

}