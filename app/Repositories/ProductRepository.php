<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository
{
    /**
     * Get all products for a company with optional filtering
     * 
     * @param int $companyId
     * @param string|null $search
     * @param int $perPage
     * @param int|null $type
     * @return LengthAwarePaginator
     */
    public function getAll(int $companyId, ?string $search = null, int $perPage = 10, ?int $type = null): LengthAwarePaginator
    {
        $query = Product::where('company_id', $companyId)->with('variations');
        
        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('specifications', 'like', "%{$search}%");
            });
        }
        
        // Filter by type if provided
        if ($type !== null) {
            $query->where('type', $type);
        }
        
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
    
    /**
     * Find product by ID for specific company
     * 
     * @param int $id
     * @param int $companyId
     * @return Product|null
     */
    public function findById(int $id, int $companyId): ?Product
    {
        return Product::where('id', $id)
            ->where('company_id', $companyId)
            ->with('variations')
            ->first();
    }
    
    /**
     * Create a new product
     * 
     * @param array $data
     * @return Product
     */
    public function create(array $data): Product
    {
        return Product::create($data);
    }
    
    /**
     * Update a product
     * 
     * @param Product $product
     * @param array $data
     * @return bool
     */
    public function update(Product $product, array $data): bool
    {
        return $product->update($data);
    }
    
    /**
     * Delete a product
     * 
     * @param Product $product
     * @return bool|null
     */
    public function delete(Product $product): ?bool
    {
        return $product->delete();
    }
    
    /**
     * Create a product variation
     * 
     * @param array $data
     * @return ProductVariation
     */
    public function createVariation(array $data): ProductVariation
    {
        return ProductVariation::create($data);
    }
    
    /**
     * Update a product variation
     * 
     * @param ProductVariation $variation
     * @param array $data
     * @return bool
     */
    public function updateVariation(ProductVariation $variation, array $data): bool
    {
        return $variation->update($data);
    }
    
    /**
     * Delete a product variation
     * 
     * @param ProductVariation $variation
     * @return bool|null
     */
    public function deleteVariation(ProductVariation $variation): ?bool
    {
        return $variation->delete();
    }
    
    /**
     * Get all variations for a product
     * 
     * @param int $productId
     * @return Collection
     */
    public function getVariations(int $productId): Collection
    {
        return ProductVariation::where('product_id', $productId)->get();
    }
    
    /**
     * Find a variation by ID
     * 
     * @param int $id
     * @return ProductVariation|null
     */
    public function findVariationById(int $id): ?ProductVariation
    {
        return ProductVariation::find($id);
    }
}
