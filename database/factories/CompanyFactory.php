<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
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
        return [
            'email' => $this->faker->unique()->companyEmail(),

            'plan' => json_encode([
                'plan_name' => $this->faker->word(),
                'plan_price' => $this->faker->randomFloat(2, 10, 100),
                'plan_duration' => $this->faker->numberBetween(1, 12),
                'plan_expiry_date' => $this->faker->dateTimeBetween('now', '+1 year'),
                'plan_status' => $this->faker->randomElement(['active', 'inactive']),
            ]),
        ];
    }
}
