<?php

namespace App\Http\Controllers;

use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    protected $settingService;

    /**
     * Constructor
     *
     * @param SettingService $settingService
     */
    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $settings = $this->settingService->getAllSettings();
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get settings as key-value map
     */
    public function getMap()
    {
        try {
            $settingsMap = $this->settingService->getSettingsMap();
            return response()->json($settingsMap);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve settings map',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|max:255|unique:settings',
            'value' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = $this->settingService->createSetting($validator->validated());
            return response()->json([
                'message' => 'Setting created successfully',
                'data' => $setting
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $key)
    {
        try {
            $setting = $this->settingService->getSetting($key);
            return response()->json($setting);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() === 404 ? 404 : 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $key)
    {
        $validator = Validator::make($request->all(), [
            'value' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = $this->settingService->updateSetting($key, $validator->validated());
            return response()->json([
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], $e->getCode() === 404 ? 404 : 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $key)
    {
        try {
            $this->settingService->deleteSetting($key);
            return response()->json([
                'message' => 'Setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], $e->getCode() === 404 ? 404 : 500);
        }
    }
}
