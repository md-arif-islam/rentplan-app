<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $customers = Customer::where('company_id', $company->id)->get();

            if ($customers->isEmpty()) {
                // Create some customers if none exist
                $customers = Customer::factory()
                    ->count(5)
                    ->forCompany($company)
                    ->create();
            }

            $products = Product::where('company_id', $company->id)->get();

            if ($products->isEmpty()) {
                // Create some products if none exist
                $products = Product::factory()
                    ->count(5)
                    ->forCompany($company)
                    ->create();
            }

            // Skip if we still don't have customers or products
            if ($customers->isEmpty() || $products->isEmpty()) {
                continue;
            }

            // Create a variety of orders for each company
            foreach ($customers as $customer) {
                // Create some active orders
                foreach ($products->random(min(3, $products->count())) as $product) {
                    Order::factory()
                        ->active()
                        ->forCustomerAndProduct($customer, $product)
                        ->create();
                }

                // Create some completed orders
                foreach ($products->random(min(2, $products->count())) as $product) {
                    Order::factory()
                        ->completed()
                        ->forCustomerAndProduct($customer, $product)
                        ->create();
                }

                // Create a pending order
                if (rand(0, 1) === 1) {
                    Order::factory()
                        ->state(['order_status' => 'pending'])
                        ->forCustomerAndProduct($customer, $products->random())
                        ->create();
                }
            }
        }
    }
}
