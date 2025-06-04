<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserProfile\UpdateProfileRequest;
use App\Models\UserProfile;
use App\Services\UserProfileService;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    protected $userProfileService;
    
    /**
     * Constructor
     * 
     * @param UserProfileService $userProfileService
     */
    public function __construct(UserProfileService $userProfileService)
    {
        $this->userProfileService = $userProfileService;
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $profile = $this->userProfileService->getProfile($id);
            return response()->json($profile);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 404);
        }
    }

    /**
     * Display the profile by user ID.
     */
    public function showByUserId($userId)
    {
        try {
            $profile = $this->userProfileService->getProfileByUserId($userId);
            return response()->json($profile);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserProfile $profile)
    {
        return response()->json($profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProfileRequest $request, $id)
    {
        try {
            $profile = $this->userProfileService->updateProfile($id, $request->validated());
            
            return response()->json([
                'message' => 'Profile updated successfully',
                'data' => $profile,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], $e->getCode() ?: 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserProfile $profile)
    {
        //
    }
}
