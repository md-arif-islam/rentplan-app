<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'role_id' => null,
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt('12345678'),
            'remember_token' => Str::random(10),
        ];
    }

    public function withRole($roleName)
    {
        return $this->state(function () use ($roleName) {
            return [
                'role_id' => Role::firstWhere('name', $roleName)?->id
                    ?? Role::create(['name' => $roleName, 'scope' => 'company'])->id,
            ];
        });
    }

    public function unverified()
    {
        return $this->state(function () {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}
