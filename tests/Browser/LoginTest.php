<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_user_can_login_through_ui()
    {
        // Create role
        $role = Role::create([
            'name' => 'company_admin',
            'scope' => 'company'
        ]);
        
        // Create user
        $user = User::factory()->create([
            'email' => 'dusk_test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'company_id' => 1
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                    ->type('email', 'dusk_test@example.com')
                    ->type('password', 'password')
                    ->press('Sign in')
                    ->assertPathIs('/company/dashboard');
        });
    }
}
