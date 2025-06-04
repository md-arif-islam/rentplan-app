<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $planStartDate = now()->subDays(rand(1, 30));
        $planEndDate = $planStartDate->copy()->addDays(rand(30, 365));

        $planStatus = $this->faker->randomElement(['active', 'inactive', 'trial', 'expired']);

        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'website' => 'https://www.' . $this->faker->domainName(),
            'logo' => null, // Placeholder for image, can be set in specific test cases
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->optional(0.3)->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'plan' => [
                'plan_name' => $this->faker->randomElement(['Basic', 'Standard', 'Premium', 'Enterprise']),
                'plan_price' => $this->faker->randomFloat(2, 0, 1000),
                'plan_status' => $planStatus,
                'plan_features' => $this->getFeaturesByPlanStatus($planStatus),
                'plan_start_date' => $planStartDate->format('Y-m-d'),
                'plan_expiry_date' => $planEndDate->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Get features based on plan status
     *
     * @param string $status
     * @return array
     */
    private function getFeaturesByPlanStatus(string $status): array
    {
        $baseFeatures = ['basic_feature', 'customer_management'];

        if ($status === 'active' || $status === 'trial') {
            return array_merge($baseFeatures, ['product_management', 'order_management']);
        }

        return $baseFeatures;
    }

    /**
     * Create a company with active plan
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $planStartDate = now()->subDays(rand(1, 30));
            $planEndDate = $planStartDate->copy()->addDays(rand(30, 365));

            return [
                'plan' => [
                    'plan_name' => $this->faker->randomElement(['Standard', 'Premium', 'Enterprise']),
                    'plan_price' => $this->faker->randomFloat(2, 19.99, 1000),
                    'plan_status' => 'active',
                    'plan_features' => ['basic_feature', 'customer_management', 'product_management', 'order_management'],
                    'plan_start_date' => $planStartDate->format('Y-m-d'),
                    'plan_expiry_date' => $planEndDate->format('Y-m-d'),
                ],
            ];
        });
    }

    /**
     * Create a company with trial plan
     */
    public function trial(): static
    {
        return $this->state(function (array $attributes) {
            $planStartDate = now()->subDays(rand(1, 10));
            $planEndDate = $planStartDate->copy()->addDays(14);

            return [
                'plan' => [
                    'plan_name' => 'Trial',
                    'plan_price' => 0,
                    'plan_status' => 'trial',
                    'plan_features' => ['basic_feature', 'customer_management', 'product_management', 'order_management'],
                    'plan_start_date' => $planStartDate->format('Y-m-d'),
                    'plan_expiry_date' => $planEndDate->format('Y-m-d'),
                ],
            ];
        });
    }
}
