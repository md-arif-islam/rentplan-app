<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductVariation>
 */
class ProductVariationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => function() {
                return Product::factory()->variable()->create()->id;
            },
            'variant_name' => $this->faker->words(2, true),
            'sku' => strtoupper($this->faker->lexify('???')) . '-' . $this->faker->numberBetween(100, 999),
            'price' => $this->faker->randomFloat(2, 5, 500),
            'stock' => $this->faker->numberBetween(0, 100),
            'specifications' => $this->faker->paragraph(),
            'attributes' => json_encode([
                'color' => $this->faker->colorName(),
                'size' => $this->faker->randomElement(['S', 'M', 'L', 'XL']),
            ]),
            'image_url' => null,
            'woocommerce_variation_id' => $this->faker->optional(0.3)->numberBetween(1000, 9999),
        ];
    }
    
    /**
     * Create a variation for an existing product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(function (array $attributes) use ($product) {
            return [
                'product_id' => $product->id,
            ];
        });
    }
}
