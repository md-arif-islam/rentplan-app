<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => '12345678',
            'remember_token' => Str::random(10),
            'company_id' => function () {
                return Company::factory()->create()->id;
            },
            'role_id' => function () {
                return Role::where('name', 'company_admin')->first()->id;
            },
            'status' => 'active',
            'force_password_change' => false,
            'last_login_at' => $this->faker->dateTimeThisMonth(),
            'last_login_ip' => $this->faker->ipv4(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Configure the model to be a super admin.
     */
    public function superAdmin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'role_id' => Role::where('name', 'super_admin')->first()->id,
            ];
        });
    }

    /**
     * Configure the model to be a company admin for an existing company.
     */
    public function forCompany(Company $company): static
    {
        return $this->state(function (array $attributes) use ($company) {
            return [
                'company_id' => $company->id,
                'role_id' => Role::where('name', 'company_admin')->first()->id,
            ];
        });
    }
}
