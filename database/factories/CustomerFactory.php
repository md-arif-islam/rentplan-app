<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => function() {
                return Company::factory()->create()->id;
            },
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'street' => $this->faker->streetName(),
            'house_number' => $this->faker->buildingNumber(),
            'postal_code' => $this->faker->postcode(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'woocommerce_customer_id' => $this->faker->optional(0.3)->numberBetween(1000, 9999),
        ];
    }
    
    /**
     * Create a customer for an existing company.
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
