<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'avatar',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];

    /**
     * Create a new profile or update if exists
     */
    public static function createOrUpdateProfile($userId, $data)
    {
        $profile = self::where('user_id', $userId)->first();

        if (!$profile) {
            $data['user_id'] = $userId;
            return self::create($data);
        }

        $profile->update($data);
        return $profile;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
