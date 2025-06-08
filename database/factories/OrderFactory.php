<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Keep track of used woocommerce_order_ids to avoid duplicates
     */
    protected static $usedWoocommerceIds = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-30 days', '+10 days');
        $endDate = clone $startDate;
        $endDate->modify('+' . $this->faker->numberBetween(7, 90) . ' days');

        // Generate a unique woocommerce_order_id that hasn't been used before
        $woocommerceOrderId = null;
        if ($this->faker->boolean(30)) { // Only 30% of orders have woocommerce IDs
            do {
                $woocommerceOrderId = $this->faker->numberBetween(10000, 99999);
            } while (in_array($woocommerceOrderId, self::$usedWoocommerceIds));

            self::$usedWoocommerceIds[] = $woocommerceOrderId;
        }

        return [
            'customer_id' => function () {
                return Customer::factory()->create()->id;
            },
            'product_id' => function () {
                return Product::factory()->create()->id;
            },
            'company_id' => function () {
                return Company::factory()->create()->id;
            },
            'start_date' => $startDate,
            'end_date' => $endDate,
            'order_status' => $this->faker->randomElement(['pending', 'active', 'completed', 'cancelled']),
            'woocommerce_order_id' => $woocommerceOrderId,
            'invoice_street' => $this->faker->streetName(),
            'invoice_postal_code' => $this->faker->postcode(),
            'invoice_house_number' => $this->faker->buildingNumber(),
            'invoice_city' => $this->faker->city(),
            'invoice_country' => $this->faker->country(),
            'delivery_street' => $this->faker->streetName(),
            'delivery_postal_code' => $this->faker->postcode(),
            'delivery_house_number' => $this->faker->buildingNumber(),
            'delivery_city' => $this->faker->city(),
            'delivery_country' => $this->faker->country(),
        ];
    }

    /**
     * Configure the model for an active order
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = $this->faker->dateTimeBetween('-30 days', 'now');
            $endDate = clone $startDate;
            $endDate->modify('+' . $this->faker->numberBetween(14, 90) . ' days');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'order_status' => 'active',
            ];
        });
    }

    /**
     * Configure the model for a completed order
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $endDate = $this->faker->dateTimeBetween('-60 days', '-1 days');
            $startDate = clone $endDate;
            $startDate->modify('-' . $this->faker->numberBetween(7, 60) . ' days');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'order_status' => 'completed',
            ];
        });
    }

    /**
     * Create an order for existing customer and product
     */
    public function forCustomerAndProduct(Customer $customer, Product $product): static
    {
        return $this->state(function (array $attributes) use ($customer, $product) {
            return [
                'customer_id' => $customer->id,
                'product_id' => $product->id,
                'company_id' => $customer->company_id,
            ];
        });
    }

    /**
     * Create an order for a specific company
     */
    public function forCompany(Company $company): static
    {
        return $this->state(function (array $attributes) use ($company) {
            return [
                'company_id' => $company->id,
            ];
        });
    }
}
