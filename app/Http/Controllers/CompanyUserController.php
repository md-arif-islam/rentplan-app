<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Role;
use App\Services\UserService;
use Illuminate\Http\Request;

class CompanyUserController extends Controller
{
    protected $userService;
    
    /**
     * Constructor
     * 
     * @param UserService $userService
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the users for the current company.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $params = [
            'search' => $request->input('search'),
            'perPage' => $request->input('perPage', 10),
            'role' => $request->input('role'),
        ];

        $users = $this->userService->getCompanyUsers($companyId, $params);

        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        try {
            // Get company_admin role automatically
            $role = Role::where('name', 'company_admin')
                ->where('scope', 'company')
                ->first();

            if (!$role) {
                return response()->json([
                    'message' => 'Company admin role not found',
                ], 422);
            }

            $user = $this->userService->createCompanyUser($request->validated(), $companyId, $role->id);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        try {
            $user = $this->userService->getCompanyUser($id, $companyId);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        try {
            $user = $this->userService->updateCompanyUser($id, $request->validated(), $companyId);

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        try {
            $this->userService->deleteCompanyUser($id, $companyId, $currentUser->id);

            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get available roles for company users.
     */
    public function getRoles()
    {
        $roles = Role::where('scope', 'company')->get();

        return response()->json($roles);
    }
}
