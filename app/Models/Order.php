<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'customer_id',
        'product_id',
        'company_id',
        'start_date',
        'end_date',
        'order_status',
        'woocommerce_order_id',
        'invoice_street',
        'invoice_postal_code',
        'invoice_house_number',
        'invoice_city',
        'invoice_country',
        'delivery_street',
        'delivery_postal_code',
        'delivery_house_number',
        'delivery_city',
        'delivery_country',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the customer that owns the order.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the product associated with the order.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the company associated with the order.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
