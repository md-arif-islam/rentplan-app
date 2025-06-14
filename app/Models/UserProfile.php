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
     * Get the user that owns this profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
