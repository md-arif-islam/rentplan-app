<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_id',
        'variant_name',
        'sku',
        'price',
        'stock',
        'specifications',
        'attributes',
        'image_url',
        'woocommerce_variation_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',
        'stock' => 'integer',
        'attributes' => 'json',
    ];

    /**
     * Get the product that owns the variation.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
