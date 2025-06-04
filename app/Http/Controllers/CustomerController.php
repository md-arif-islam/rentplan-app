<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        $query = Customer::where('company_id', $companyId);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->paginate($perPage);

        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:255',
            'house_number' => 'nullable|string|max:50',
            'postal_code' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'woocommerce_customer_id' => 'nullable|integer|unique:customers,woocommerce_customer_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $customerData = $request->all();
            $customerData['company_id'] = $companyId;

            $customer = Customer::create($customerData);

            return response()->json([
                'message' => 'Customer created successfully',
                'data' => $customer,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create customer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $customer = Customer::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $customer = Customer::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:255',
            'house_number' => 'nullable|string|max:50',
            'postal_code' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'woocommerce_customer_id' => 'nullable|integer|unique:customers,woocommerce_customer_id,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $customer->update($request->all());

            return response()->json([
                'message' => 'Customer updated successfully',
                'data' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update customer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $customer = Customer::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        try {
            $customer->delete();

            return response()->json([
                'message' => 'Customer deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete customer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
