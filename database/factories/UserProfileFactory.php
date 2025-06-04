<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => function() {
                return User::factory()->create()->id;
            },
            'name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'avatar' => null, // No avatar by default, can be set in specific test cases
        ];
    }
    
    /**
     * Create a profile for an existing user
     */
    public function forUser(User $user): static
    {
        return $this->state(function (array $attributes) use ($user) {
            return [
                'user_id' => $user->id,
                'name' => $this->faker->name(),
            ];
        });
    }
}
