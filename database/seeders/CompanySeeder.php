<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the default demo company
        $demoCompany = Company::create([
            'name' => 'RentPlan Demo Company',
            'email' => 'demo@rentplan.test',
            'phone' => '+1 234 567 890',
            'website' => 'https://www.rentplan-demo.test',
            'address_line_1' => '123 Main Street',
            'address_line_2' => 'Suite 101',
            'city' => 'Amsterdam',
            'state' => 'North Holland',
            'postal_code' => '1011',
            'country' => 'Netherlands',
            'plan' => [
                'plan_name' => 'Enterprise',
                'plan_price' => 99.99,
                'plan_status' => 'active',
                'plan_features' => [
                    'basic_feature',
                    'customer_management',
                    'product_management', 
                    'order_management',
                    'advanced_reporting',
                ],
                'plan_start_date' => now()->subDays(30)->format('Y-m-d'),
                'plan_expiry_date' => now()->addYear()->format('Y-m-d'),
            ],
        ]);

        // Create 5 other companies (trial, active, inactive, etc.)
        $companies = [
            Company::factory()->trial()->create(),
            Company::factory()->active()->create(),
            Company::factory()->active()->create(),
            Company::factory()->create(['plan' => ['plan_name' => 'Basic', 'plan_price' => 9.99, 'plan_status' => 'inactive', 'plan_features' => ['basic_feature'], 'plan_start_date' => now()->subYear()->format('Y-m-d'), 'plan_expiry_date' => now()->subDays(5)->format('Y-m-d')]]),
            Company::factory()->create(['plan' => ['plan_name' => 'Premium', 'plan_price' => 49.99, 'plan_status' => 'expired', 'plan_features' => ['basic_feature', 'customer_management', 'product_management'], 'plan_start_date' => now()->subMonths(2)->format('Y-m-d'), 'plan_expiry_date' => now()->subDays(1)->format('Y-m-d')]]),
        ];
        
        // Add all companies including the demo company to the array for seeding customers and products
        array_unshift($companies, $demoCompany);

        // For each company, create customers, products and orders
        foreach ($companies as $company) {
            // Create 10-20 customers per company
            $customers = Customer::factory()
                ->count(rand(10, 20))
                ->forCompany($company)
                ->create();
                
            // Create 5-15 simple products per company
            $simpleProducts = Product::factory()
                ->count(rand(5, 15))
                ->forCompany($company)
                ->create();
                
            // Create 1-5 variable products per company
            $variableProducts = Product::factory()
                ->variable()
                ->count(rand(1, 5))
                ->forCompany($company)
                ->create();
                
            // Create 2-4 variations for each variable product
            foreach ($variableProducts as $product) {
                ProductVariation::factory()
                    ->count(rand(2, 4))
                    ->forProduct($product)
                    ->create();
            }
            
            // Create orders: 5-10 active, 10-20 completed
            foreach ($customers as $customer) {
                // 50% chance for each customer to have active orders
                if (rand(0, 1) === 1) {
                    $product = $simpleProducts->random();
                    Order::factory()
                        ->active()
                        ->forCustomerAndProduct($customer, $product)
                        ->count(rand(1, 3))
                        ->create();
                }
                
                // 75% chance for each customer to have completed orders
                if (rand(0, 3) > 0) {
                    $product = $simpleProducts->random();
                    Order::factory()
                        ->completed()
                        ->forCustomerAndProduct($customer, $product)
                        ->count(rand(1, 5))
                        ->create();
                }
            }
        }
    }
}
