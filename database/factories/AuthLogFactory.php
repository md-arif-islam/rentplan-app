<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuthLog>
 */
class AuthLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = ['login', 'logout', 'failed-login', 'password-reset-request', 'password-reset'];
        $action = $this->faker->randomElement($actions);
        
        $userAgentDetails = [
            'browser' => $this->faker->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            'browser_version' => $this->faker->numerify('#.#.#'),
            'platform' => $this->faker->randomElement(['Windows', 'MacOS', 'iOS', 'Android', 'Linux']),
            'platform_version' => $this->faker->numerify('#.#'),
            'device_type' => $this->faker->randomElement(['desktop', 'mobile', 'tablet']),
            'is_mobile' => $this->faker->boolean(30),
            'is_tablet' => $this->faker->boolean(20),
            'is_desktop' => $this->faker->boolean(50),
            'is_robot' => $this->faker->boolean(5),
        ];
        
        return [
            'user_id' => function() use ($action) {
                return in_array($action, ['login', 'logout', 'password-reset']) 
                    ? User::factory()->create()->id
                    : null;
            },
            'email' => function(array $attributes) use ($action) {
                if (!$attributes['user_id'] && in_array($action, ['failed-login', 'password-reset-request'])) {
                    return $this->faker->safeEmail();
                }
                return null;
            },
            'action' => $action,
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'metadata' => [
                'user_agent_details' => $userAgentDetails
            ],
        ];
    }
    
    /**
     * Configure for a login event
     */
    public function login(): static
    {
        return $this->state(function (array $attributes) {
            $user = User::factory()->create();
            
            return [
                'user_id' => $user->id,
                'email' => $user->email,
                'action' => 'login',
            ];
        });
    }
    
    /**
     * Configure for a failed login event
     */
    public function failedLogin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => null,
                'email' => $this->faker->safeEmail(),
                'action' => 'failed-login',
            ];
        });
    }
    
    /**
     * Configure for a rate-limited event
     */
    public function rateLimited(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => null,
                'email' => $this->faker->optional(0.7)->safeEmail(),
                'action' => 'rate-limited',
                'metadata' => [
                    'user_agent_details' => $attributes['metadata']['user_agent_details'],
                    'type' => $this->faker->randomElement(['auth', 'api', 'public']),
                    'path' => '/api/' . $this->faker->word,
                    'method' => $this->faker->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
                ],
            ];
        });
    }
}
