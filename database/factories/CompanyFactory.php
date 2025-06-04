<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Company::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->companyEmail(),
            'logo' => $this->faker->imageUrl(200, 200, 'business'),
            'phone' => $this->faker->phoneNumber(),
            'website' => $this->faker->url(),
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'plan' => [
                'plan_name' => $this->faker->word(),
                'plan_price' => $this->faker->randomFloat(2, 10, 100),
                'plan_duration' => $this->faker->numberBetween(1, 12),
                'plan_expiry_date' => $this->faker->dateTimeBetween('now', '+1 year')->format('Y-m-d H:i:s'),
                'plan_status' => $this->faker->randomElement(['active', 'inactive']),
            ],
        ];
    }
}
