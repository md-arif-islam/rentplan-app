<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => $this->faker->unique()->word(),
            'value' => $this->faker->paragraph(),
        ];
    }

    /**
     * Create a date/time format setting.
     */
    public function dateTimeSetting(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'key' => $this->faker->randomElement([
                    'starting_week_day',
                    'time_format',
                    'date_format',
                    'timezone'
                ]),
                'value' => $this->faker->randomElement([
                    'monday',
                    '24h',
                    'd-m-Y',
                    'Europe/Amsterdam'
                ]),
            ];
        });
    }
}
