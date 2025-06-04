<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Services\CustomerService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    protected $customerService;
    
    /**
     * Constructor
     * 
     * @param CustomerService $customerService
     */
    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        $params = [
            'search' => $request->input('search'),
            'perPage' => $request->input('perPage', 10),
        ];
        
        $customers = $this->customerService->getCustomers($companyId, $params);
        
        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            // Add company ID to the validated data
            $data = $request->validated();
            $data['company_id'] = $companyId;
            
            // Create customer through service
            $customer = $this->customerService->createCustomer($data);
            
            return response()->json([
                'message' => 'Customer created successfully',
                'data' => $customer,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            $customer = $this->customerService->getCustomer($id, $companyId);
            
            return response()->json($customer);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            $data = $request->validated();
            
            // Update customer through service
            $customer = $this->customerService->updateCustomer($id, $data, $companyId);
            
            return response()->json([
                'message' => 'Customer updated successfully',
                'data' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            $this->customerService->deleteCustomer($id, $companyId);
            
            return response()->json([
                'message' => 'Customer deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }
}
