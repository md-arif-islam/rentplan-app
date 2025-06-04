<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
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
            'name' => $this->faker->words(3, true),
            'type' => 0, // Simple product by default
            'price' => $this->faker->randomFloat(2, 5, 500),
            'stock' => $this->faker->numberBetween(0, 100),
            'specifications' => $this->faker->paragraph(),
            'image_url' => null,
            'woocommerce_product_id' => $this->faker->optional(0.3)->numberBetween(1000, 9999),
        ];
    }
    
    /**
     * Configure the model as a variable product.
     */
    public function variable(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 1, // Variable product
                'price' => null,
            ];
        });
    }
    
    /**
     * Create a product for an existing company.
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
