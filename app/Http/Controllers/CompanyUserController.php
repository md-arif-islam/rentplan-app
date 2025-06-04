<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CompanyUserController extends Controller
{
    /**
     * Display a listing of the users for the current company.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        $query = User::where('company_id', $companyId)
            ->with(['role', 'userProfile']);

        // Apply search filter if provided
        if ($search) {
            $query->whereHas('userProfile', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('email', 'like', "%{$search}%");
        }

        // Filter by role if provided
        if ($request->has('role')) {
            $roleId = $request->input('role');
            $query->where('role_id', $roleId);
        }

        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Validate user data
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email|max:255',
                'password' => 'required|min:8',
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'avatar' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get company_admin role automatically
            $role = Role::where('name', 'company_admin')
                ->where('scope', 'company')
                ->first();

            if (!$role) {
                return response()->json([
                    'message' => 'Company admin role not found',
                ], 422);
            }

            // Create user with company_admin role
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $role->id,
                'company_id' => $companyId,
            ]);

            // Create profile separately
            $profileData = [
                'name' => $request->name,
                'phone' => $request->phone,
            ];

            // Handle avatar upload if provided
            if ($request->has('avatar') && $request->avatar) {
                try {
                    $profileData['avatar'] = $this->saveImage($request->avatar);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Create the profile using the helper method on the UserProfile model
            UserProfile::createOrUpdateProfile($user->id, $profileData);

            DB::commit();

            // Load the role and profile
            $user->load(['role', 'userProfile']);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

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

        $user = User::where('id', $id)
            ->where('company_id', $companyId)
            ->with(['role', 'userProfile'])
            ->firstOrFail();

        return response()->json($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $user = User::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Validate user data
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|max:255|unique:users,email,' . $id,
                'password' => 'nullable|min:8',
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'avatar' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get company_admin role if role_id needs to be updated
            if ($request->has('role_id') && $request->role_id === 'company_admin') {
                $role = Role::where('name', 'company_admin')
                    ->where('scope', 'company')
                    ->first();

                if ($role) {
                    $user->role_id = $role->id;
                }
            }

            // Update user basic information
            $user->email = $request->email;

            // Update password if provided
            if ($request->has('password') && $request->password) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            // Prepare profile data
            $profileData = [
                'name' => $request->name,
                'phone' => $request->phone ?? null,
            ];

            // Handle avatar upload if provided
            if ($request->has('avatar') && $request->avatar && preg_match('/^data:image\//', $request->avatar)) {
                try {
                    // If profile exists and has avatar, delete the old one
                    if ($user->userProfile && $user->userProfile->avatar && file_exists(public_path($user->userProfile->avatar))) {
                        unlink(public_path($user->userProfile->avatar));
                    }

                    $profileData['avatar'] = $this->saveImage($request->avatar);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Update or create the profile
            UserProfile::createOrUpdateProfile($user->id, $profileData);

            DB::commit();

            // Reload the user with the updated profile
            $user = User::with(['role', 'userProfile'])->find($id);

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

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

        // Prevent deleting yourself
        if ($currentUser->id == $id) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 422);
        }

        $user = User::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        try {
            // Delete profile avatar if exists
            if ($user->userProfile && $user->userProfile->avatar) {
                $avatarPath = public_path($user->userProfile->avatar);
                if (file_exists($avatarPath)) {
                    unlink($avatarPath);
                }
            }

            // Delete profile first (it has a foreign key constraint)
            if ($user->userProfile) {
                $user->userProfile->delete();
            }

            // Delete user
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
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

        $dir = 'images/profiles/';
        $file = \Illuminate\Support\Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!\Illuminate\Support\Facades\File::exists($absolutePath)) {
            \Illuminate\Support\Facades\File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents(public_path($relativePath), $image);

        return $relativePath;
    }
}
