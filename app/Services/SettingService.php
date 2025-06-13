<?php

namespace App\Services;

use App\Models\Setting;
use App\Repositories\SettingRepository;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    protected $settingRepository;
    protected $cachePrefix = 'settings:';
    protected $cacheTtl = 86400; // 24 hours

    /**
     * Constructor
     *
     * @param SettingRepository $settingRepository
     */
    public function __construct(SettingRepository $settingRepository)
    {
        $this->settingRepository = $settingRepository;
    }

    /**
     * Get all settings
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllSettings()
    {
        return $this->settingRepository->getAll();
    }

    /**
     * Get settings as key-value map
     *
     * @return array
     */
    public function getSettingsMap()
    {
        return Cache::remember('settings_map', $this->cacheTtl, function () {
            $settings = $this->getAllSettings();
            $map = [];

            foreach ($settings as $setting) {
                $map[$setting->key] = $setting->value;
            }

            return $map;
        });
    }

    /**
     * Get setting by key
     *
     * @param string $key
     * @return Setting|null
     * @throws \Exception
     */
    public function getSetting(string $key)
    {
        $setting = $this->settingRepository->findByKey($key);

        if (!$setting) {
            throw new \Exception("Setting '{$key}' not found", 404);
        }

        return $setting;
    }

    /**
     * Get setting value
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getValue(string $key, $default = null)
    {
        return Cache::remember($this->cachePrefix . $key, $this->cacheTtl, function () use ($key, $default) {
            return $this->settingRepository->getValue($key, $default);
        });
    }

    /**
     * Create a new setting
     *
     * @param array $data
     * @return Setting
     */
    public function createSetting(array $data)
    {
        $setting = $this->settingRepository->create($data);
        $this->clearCache($setting->key);
        return $setting;
    }

    /**
     * Update setting
     *
     * @param string $key
     * @param array $data
     * @return Setting
     * @throws \Exception
     */
    public function updateSetting(string $key, array $data)
    {
        $setting = $this->getSetting($key);
        $updatedSetting = $this->settingRepository->update($setting, $data);
        $this->clearCache($key);
        return $updatedSetting;
    }

    /**
     * Update or create setting
     *
     * @param string $key
     * @param mixed $value
     * @return Setting
     */
    public function setSettingValue(string $key, $value)
    {
        $setting = $this->settingRepository->updateOrCreate($key, $value);
        $this->clearCache($key);
        return $setting;
    }

    /**
     * Delete a setting
     *
     * @param string $key
     * @return bool
     * @throws \Exception
     */
    public function deleteSetting(string $key)
    {
        $setting = $this->getSetting($key);
        $result = $this->settingRepository->delete($setting);
        $this->clearCache($key);
        return $result;
    }

    /**
     * Clear cache for a specific setting key
     *
     * @param string $key
     * @return void
     */
    protected function clearCache(string $key)
    {
        Cache::forget($this->cachePrefix . $key);
        Cache::forget('settings_map');
    }
}
