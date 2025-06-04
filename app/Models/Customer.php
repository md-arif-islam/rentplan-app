<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'company_id',
        'woocommerce_customer_id',
        'street',
        'postal_code',
        'house_number',
        'city',
        'country',
        'phone',
        'email',
        'date_of_birth',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Get the company that owns the customer.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the full name of the customer.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
