<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    protected $fillable = ['name', 'scope'];

    /**
     * Get all users with this role.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get super admin role
     *
     * @return self|null
     */
    public static function superAdmin()
    {
        return static::where('name', 'super_admin')
            ->where('scope', 'platform')
            ->first();
    }

    /**
     * Get company admin role
     *
     * @return self|null
     */
    public static function companyAdmin()
    {
        return static::where('name', 'company_admin')
            ->where('scope', 'company')
            ->first();
    }
}
