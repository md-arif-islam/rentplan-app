<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{

    protected $fillable = ['name', 'scope'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
