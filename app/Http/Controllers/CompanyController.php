<?php

namespace App\Http\Controllers;

use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyPlanRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Company;
use App\Services\CompanyService;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    protected $companyService;
    
    /**
     * Constructor
     * 
     * @param CompanyService $companyService
     */
    public function __construct(CompanyService $companyService)
    {
        $this->companyService = $companyService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $params = [
            'search' => $request->input('search'),
            'perPage' => $request->input('perPage', 10),
            'status' => $request->input('status'),
        ];

        $companies = $this->companyService->getCompanies($params);

        return response()->json($companies);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        try {
            $company = $this->companyService->createCompany($request->validated());

            return response()->json([
                'message' => 'Company created successfully',
                'data' => $company,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create company',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        try {
            $companyData = $this->companyService->getCompany($company->id);
            return response()->json($companyData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company)
    {
        try {
            $updatedCompany = $this->companyService->updateCompany($company->id, $request->validated());

            return response()->json([
                'message' => 'Company updated successfully',
                'data' => $updatedCompany,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update company',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        try {
            $this->companyService->deleteCompany($company->id);

            return response()->json([
                'message' => 'Company deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete company',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update company plan information
     */
    public function updatePlan(UpdateCompanyPlanRequest $request, Company $company)
    {
        try {
            $updatedCompany = $this->companyService->updateCompanyPlan($company->id, $request->validated());

            return response()->json([
                'message' => 'Company plan updated successfully',
                'data' => $updatedCompany,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update company plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
