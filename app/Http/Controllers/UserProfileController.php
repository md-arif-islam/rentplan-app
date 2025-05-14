<?php

namespace App\Http\Controllers;


use App\Models\UserProfile;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
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
        $profile = UserProfile::with('user')->findOrFail($id);
        return response()->json($profile);
    }

    /**
     * Display the profile by user ID.
     */
    public function showByUserId($userId)
    {
        $profile = UserProfile::where('user_id', $userId)->with('user')->firstOrFail();
        return response()->json($profile);
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
    public function update(Request $request, $id)
    {
        $profile = UserProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        if (isset($validated['avatar']) && preg_match('/^data:image\//', $validated['avatar'])) {
            try {
                $validated['avatar'] = $this->saveImage($validated['avatar']);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 422);
            }
        }

        $profile->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserProfile $profile)
    {
        //
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
        $file = \Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!\File::exists($absolutePath)) {
            \File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents($relativePath, $image);

        return $relativePath;
    }
}
