<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'role_id',
        'company_id',
        'email_verified_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The relationships that should always be loaded.
     *
     * @var list<string>
     */
    protected $with = ['role'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function userProfile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Save related profile data
     */
    public function saveProfile($profileData)
    {
        // If no profile exists yet, create one
        if (!$this->userProfile) {
            return $this->userProfile()->create($profileData);
        }

        // Update existing profile
        return $this->userProfile->update($profileData);
    }
}
