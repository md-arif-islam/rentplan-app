<?php

namespace Tests\Unit\Services;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $userService;
    protected $userRepository;

    public function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);

        $this->userRepository = new UserRepository();
        $this->userService = new UserService($this->userRepository);
    }

    /** @test */
    public function it_can_get_company_users()
    {
        $company = Company::factory()->create();
        $companyAdminRole = Role::where('name', 'company_admin')->first();

        // Create 5 users for this company
        User::factory()->count(5)->create([
            'company_id' => $company->id,
            'role_id' => $companyAdminRole->id,
        ]);

        // Create 3 users for another company (should be filtered out)
        $anotherCompany = Company::factory()->create();
        User::factory()->count(3)->create([
            'company_id' => $anotherCompany->id,
            'role_id' => $companyAdminRole->id,
        ]);

        $params = [
            'perPage' => 10,
            'page' => 1,
        ];

        $result = $this->userService->getCompanyUsers($company->id, $params);

        $this->assertEquals(5, $result->total());
        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);

        // Verify all users belong to the specified company
        foreach ($result as $user) {
            $this->assertEquals($company->id, $user->company_id);
        }
    }

    /** @test */
    public function it_can_get_company_user_by_id()
    {
        $company = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => $role->id,
            'email' => 'test@example.com',
        ]);

        // Create a profile for this user
        $user->userProfile()->create([
            'name' => 'Test User',
            'phone' => '1234567890',
        ]);

        $result = $this->userService->getCompanyUser($user->id, $company->id);

        $this->assertEquals($user->id, $result->id);
        $this->assertEquals('test@example.com', $result->email);
        $this->assertEquals('Test User', $result->userProfile->name);
        $this->assertEquals('1234567890', $result->userProfile->phone);
    }

    /** @test */
    public function it_throws_exception_when_getting_user_from_different_company()
    {
        $company1 = Company::factory()->create();
        $company2 = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $user = User::factory()->create([
            'company_id' => $company1->id,
            'role_id' => $role->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('User not found or not authorized');
        $this->expectExceptionCode(404);

        // Try to access user from company2
        $this->userService->getCompanyUser($user->id, $company2->id);
    }

    /** @test */
    public function it_can_create_company_user()
    {
        $company = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $userData = [
            'email' => 'new@example.com',
            'password' => 'password123',
            'name' => 'New User',
            'phone' => '9876543210',
        ];

        $user = $this->userService->createCompanyUser($userData, $company->id, $role->id);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('new@example.com', $user->email);
        $this->assertEquals($company->id, $user->company_id);
        $this->assertEquals($role->id, $user->role_id);

        // Verify profile was created
        $this->assertNotNull($user->userProfile);
        $this->assertEquals('New User', $user->userProfile->name);
        $this->assertEquals('9876543210', $user->userProfile->phone);

        // Verify it was actually saved to the database
        $this->assertDatabaseHas('users', [
            'email' => 'new@example.com',
            'company_id' => $company->id,
            'role_id' => $role->id,
        ]);
    }

    /** @test */
    public function it_can_update_company_user()
    {
        $company = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => $role->id,
            'email' => 'original@example.com',
        ]);

        $user->userProfile()->create([
            'name' => 'Original Name',
            'phone' => '1234567890',
        ]);

        $updateData = [
            'email' => 'updated@example.com',
            'name' => 'Updated Name',
            'phone' => '0987654321',
        ];

        $updated = $this->userService->updateCompanyUser($user->id, $updateData, $company->id);

        $this->assertEquals('updated@example.com', $updated->email);
        $this->assertEquals('Updated Name', $updated->userProfile->name);
        $this->assertEquals('0987654321', $updated->userProfile->phone);

        // Verify changes were saved to the database
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'updated@example.com',
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'name' => 'Updated Name',
            'phone' => '0987654321',
        ]);
    }

    /** @test */
    public function it_can_delete_company_user()
    {
        $company = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => $role->id,
        ]);

        $this->userService->deleteCompanyUser($user->id, $company->id);

        // Check if soft deleted
        $this->assertSoftDeleted($user);
    }

    /** @test */
    public function it_prevents_self_deletion()
    {
        $company = Company::factory()->create();
        $role = Role::where('name', 'company_admin')->first();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => $role->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('You cannot delete your own account');
        $this->expectExceptionCode(400);

        $this->userService->deleteCompanyUser($user->id, $company->id, $user->id);
    }
}
