<?php

namespace Tests\Unit\Services;

use App\Models\Company;
use App\Repositories\CompanyRepository;
use App\Services\CompanyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyServiceTest extends TestCase
{
    use RefreshDatabase;
    
    protected $companyService;
    protected $companyRepository;
    
    public function setUp(): void
    {
        parent::setUp();
        
        $this->companyRepository = new CompanyRepository();
        $this->companyService = new CompanyService($this->companyRepository);
    }
    
    /** @test */
    public function it_can_get_companies()
    {
        // Create 5 companies
        Company::factory()->count(5)->create();
        
        $params = [
            'perPage' => 10,
            'page' => 1,
        ];
        
        $result = $this->companyService->getCompanies($params);
        
        $this->assertEquals(5, $result->total());
        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);
    }
    
    /** @test */
    public function it_can_get_company_by_id()
    {
        $company = Company::factory()->create([
            'name' => 'Test Company',
            'email' => 'test@company.com',
        ]);
        
        $result = $this->companyService->getCompany($company->id);
        
        $this->assertEquals($company->id, $result->id);
        $this->assertEquals('Test Company', $result->name);
        $this->assertEquals('test@company.com', $result->email);
    }
    
    /** @test */
    public function it_can_create_company()
    {
        $data = [
            'name' => 'New Company',
            'email' => 'new@company.com',
            'phone' => '1234567890',
            'plan' => [
                'plan_name' => 'Basic Plan',
                'plan_price' => 99.99,
                'plan_status' => 'active',
                'plan_features' => ['feature1', 'feature2'],
                'plan_start_date' => now()->format('Y-m-d'),
                'plan_expiry_date' => now()->addMonths(12)->format('Y-m-d'),
            ],
        ];
        
        $company = $this->companyService->createCompany($data);
        
        $this->assertInstanceOf(Company::class, $company);
        $this->assertEquals('New Company', $company->name);
        $this->assertEquals('new@company.com', $company->email);
        $this->assertEquals('1234567890', $company->phone);
        $this->assertEquals('Basic Plan', $company->plan['plan_name']);
        $this->assertEquals(99.99, $company->plan['plan_price']);
        
        // Verify it was actually saved to the database
        $this->assertDatabaseHas('companies', [
            'name' => 'New Company',
            'email' => 'new@company.com',
            'phone' => '1234567890',
        ]);
    }
    
    /** @test */
    public function it_can_update_company()
    {
        $company = Company::factory()->create([
            'name' => 'Original Company',
            'email' => 'original@company.com',
        ]);
        
        $data = [
            'name' => 'Updated Company',
            'email' => 'updated@company.com',
        ];
        
        $updated = $this->companyService->updateCompany($company->id, $data);
        
        $this->assertEquals('Updated Company', $updated->name);
        $this->assertEquals('updated@company.com', $updated->email);
        
        // Verify changes were saved to the database
        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'name' => 'Updated Company',
            'email' => 'updated@company.com',
        ]);
    }
    
    /** @test */
    public function it_can_delete_company()
    {
        $company = Company::factory()->create();
        
        $this->companyService->deleteCompany($company->id);
        
        // Check if soft deleted
        $this->assertSoftDeleted($company);
    }
    
    /** @test */
    public function it_can_update_company_plan()
    {
        $company = Company::factory()->create([
            'plan' => [
                'plan_name' => 'Basic',
                'plan_price' => 29.99,
                'plan_status' => 'active',
            ]
        ]);
        
        $planData = [
            'plan_name' => 'Premium',
            'plan_price' => 99.99,
            'plan_status' => 'active',
            'plan_features' => ['premium1', 'premium2'],
            'plan_start_date' => now()->format('Y-m-d'),
            'plan_expiry_date' => now()->addYear()->format('Y-m-d'),
        ];
        
        $updated = $this->companyService->updateCompanyPlan($company->id, $planData);
        
        $this->assertEquals('Premium', $updated->plan['plan_name']);
        $this->assertEquals(99.99, $updated->plan['plan_price']);
        $this->assertEquals(['premium1', 'premium2'], $updated->plan['plan_features']);
    }
}
