<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'plan',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }
}
