<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default settings for time/date formats
        $defaultSettings = [
            'starting_week_day' => 'monday',
            'time_format' => '24h',
            'date_format' => 'd-m-Y',
            'timezone' => 'Europe/Amsterdam'
        ];

        foreach ($defaultSettings as $key => $value) {
            Setting::create([
                'key' => $key,
                'value' => $value,
            ]);
        }
    }
}
