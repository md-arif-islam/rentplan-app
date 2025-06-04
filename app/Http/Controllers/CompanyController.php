<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        $query = Company::query();

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('website', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Filter by status if provided in plan data
        if ($request->has('status')) {
            $status = $request->input('status');
            $query->whereJsonContains('plan->status', $status);
        }

        $companies = $query->paginate($perPage);

        return response()->json($companies);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Start a database transaction
        DB::beginTransaction();

        try {
            // Validate company data (removed admin user fields)
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:companies,email|max:255',
                'logo' => 'nullable|string',
                'phone' => 'nullable|string|max:20',
                'website' => 'nullable|url|max:255',
                'address_line_1' => 'nullable|string|max:255',
                'address_line_2' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'state' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $companyData = $request->except(['logo']);

            // Handle logo upload if provided as base64
            if ($request->has('logo') && $request->logo) {
                try {
                    $companyData['logo'] = $this->saveImage($request->logo);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Set default plan data if not provided
            if (!isset($companyData['plan'])) {
                $companyData['plan'] = [
                    'plan_name' => 'Basic',
                    'plan_price' => 0,
                    'plan_status' => 'active',
                    'plan_features' => ['basic_features'],
                    'plan_start_date' => now()->toDateString(),
                    'plan_expiry_date' => now()->addMonth()->toDateString(),
                ];
            }

            // Create company
            $company = Company::create($companyData);

            DB::commit();

            return response()->json([
                'message' => 'Company created successfully',
                'data' => $company,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

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
        // Load related users with their roles
        $company->load(['users' => function ($query) {
            $query->with('role');
        }]);

        return response()->json($company);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:companies,email,' . $company->id,
            'logo' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'plan' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Start a database transaction
        DB::beginTransaction();

        try {
            $companyData = $request->except(['logo', '_method']);

            // Handle logo upload if provided as base64
            if ($request->has('logo') && $request->logo && preg_match('/^data:image\//', $request->logo)) {
                try {
                    // Delete old logo if it exists
                    if ($company->logo && File::exists(public_path($company->logo))) {
                        File::delete(public_path($company->logo));
                    }

                    $companyData['logo'] = $this->saveImage($request->logo);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Update plan data if provided
            if (isset($companyData['plan'])) {
                // Merge with existing plan data to preserve fields not included in the request
                $currentPlan = $company->plan ?? [];
                $companyData['plan'] = array_merge($currentPlan, $companyData['plan']);
            }

            // Update company
            $company->update($companyData);

            DB::commit();

            return response()->json([
                'message' => 'Company updated successfully',
                'data' => $company->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

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
            // Delete logo if exists
            if ($company->logo && File::exists(public_path($company->logo))) {
                File::delete(public_path($company->logo));
            }

            // Delete all users associated with this company
            User::where('company_id', $company->id)->delete();

            // Delete the company
            $company->delete();

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
    public function updatePlan(Request $request, Company $company)
    {
        $validator = Validator::make($request->all(), [
            'plan_name' => 'required|string|max:100',
            'plan_price' => 'required|numeric|min:0',
            'plan_status' => 'required|in:active,inactive,trial,expired',
            'plan_features' => 'nullable|array',
            'plan_start_date' => 'required|date',
            'plan_expiry_date' => 'required|date|after:plan_start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $plan = [
                'plan_name' => $request->input('plan_name'),
                'plan_price' => $request->input('plan_price'),
                'plan_status' => $request->input('plan_status'),
                'plan_features' => $request->input('plan_features', []),
                'plan_start_date' => $request->input('plan_start_date'),
                'plan_expiry_date' => $request->input('plan_expiry_date'),
            ];

            $company->plan = $plan;
            $company->save();

            return response()->json([
                'message' => 'Company plan updated successfully',
                'data' => $company->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update company plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save Base64 image to storage.
     */
    private function saveImage($image)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('Invalid image type');
            }

            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('Base64 decode failed');
            }
        } else {
            throw new \Exception('Did not match data URI with image data');
        }

        $dir = 'images/companies/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents(public_path($relativePath), $image);

        return $relativePath;
    }
}
