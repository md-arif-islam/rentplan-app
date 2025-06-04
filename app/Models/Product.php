<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'price',
        'stock',
        'specifications',
        'image_url',
        'woocommerce_product_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',
        'stock' => 'integer',
        'type' => 'integer',
    ];

    /**
     * Get the company that owns the product.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    
    /**
     * Get the variations for the product.
     */
    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }
    
    /**
     * Get the orders for the product.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    
    /**
     * Scope a query to only include products of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    /**
     * Scope a query to only include simple products.
     */
    public function scopeSimple($query)
    {
        return $query->where('type', 0);
    }
    
    /**
     * Scope a query to only include variable products.
     */
    public function scopeVariable($query)
    {
        return $query->where('type', 1);
    }
}
