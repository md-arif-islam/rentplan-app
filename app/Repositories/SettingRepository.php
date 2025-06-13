<?php

namespace App\Repositories;

use App\Models\Setting;

class SettingRepository
{
    /**
     * Get all settings
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAll()
    {
        return Setting::all();
    }

    /**
     * Find setting by key
     *
     * @param string $key
     * @return Setting|null
     */
    public function findByKey(string $key)
    {
        return Setting::where('key', $key)->first();
    }

    /**
     * Get setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getValue(string $key, $default = null)
    {
        $setting = $this->findByKey($key);
        return $setting ? $setting->value : $default;
    }

    /**
     * Create a new setting
     *
     * @param array $data
     * @return Setting
     */
    public function create(array $data)
    {
        return Setting::create($data);
    }

    /**
     * Update a setting
     *
     * @param Setting $setting
     * @param array $data
     * @return Setting
     */
    public function update(Setting $setting, array $data)
    {
        $setting->update($data);
        return $setting->refresh();
    }

    /**
     * Update or Create a setting
     *
     * @param string $key
     * @param mixed $value
     * @return Setting
     */
    public function updateOrCreate(string $key, $value)
    {
        return Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Delete a setting
     *
     * @param Setting $setting
     * @return bool
     */
    public function delete(Setting $setting)
    {
        return $setting->delete();
    }
}
