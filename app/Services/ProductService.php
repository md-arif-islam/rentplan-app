<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariation;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductService
{
    protected $productRepository;
    
    /**
     * Constructor
     * 
     * @param ProductRepository $productRepository
     */
    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }
    
    /**
     * Get all products for a company with filtering
     * 
     * @param int $companyId
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getProducts(int $companyId, array $params = []): LengthAwarePaginator
    {
        $search = $params['search'] ?? null;
        $perPage = $params['perPage'] ?? 10;
        $type = $params['type'] ?? null;
        
        return $this->productRepository->getAll($companyId, $search, $perPage, $type);
    }
    
    /**
     * Get a product by ID
     * 
     * @param int $id
     * @param int $companyId
     * @return Product|null
     * @throws \Exception
     */
    public function getProduct(int $id, int $companyId): ?Product
    {
        $product = $this->productRepository->findById($id, $companyId);
        
        if (!$product) {
            throw new \Exception('Product not found', 404);
        }
        
        return $product;
    }
    
    /**
     * Create a new product
     * 
     * @param array $data
     * @return Product
     */
    public function createProduct(array $data): Product
    {
        DB::beginTransaction();
        
        try {
            // Handle image if provided
            if (isset($data['image_url']) && strpos($data['image_url'], 'data:image/') === 0) {
                $data['image_url'] = $this->saveImage($data['image_url'], 'products');
            }
            
            // Create the product
            $product = $this->productRepository->create($data);
            
            // If variable product, create variations
            if ($product->type == 1 && isset($data['variations']) && is_array($data['variations'])) {
                $this->createProductVariations($product->id, $data['variations']);
            }
            
            DB::commit();
            return $product->fresh(['variations']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Update a product
     * 
     * @param int $id
     * @param array $data
     * @param int $companyId
     * @return Product
     * @throws \Exception
     */
    public function updateProduct(int $id, array $data, int $companyId): Product
    {
        DB::beginTransaction();
        
        try {
            $product = $this->getProduct($id, $companyId);
            
            // Handle image if provided
            if (isset($data['image_url']) && strpos($data['image_url'], 'data:image/') === 0) {
                // Delete old image if exists
                if ($product->image_url && file_exists(public_path($product->image_url))) {
                    unlink(public_path($product->image_url));
                }
                
                $data['image_url'] = $this->saveImage($data['image_url'], 'products');
            }
            
            // Update the product
            $this->productRepository->update($product, $data);
            
            // If variable product, handle variations
            if ($product->type == 1 && isset($data['variations']) && is_array($data['variations'])) {
                $this->updateProductVariations($product->id, $data['variations']);
            }
            
            DB::commit();
            return $product->fresh(['variations']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Delete a product
     * 
     * @param int $id
     * @param int $companyId
     * @return bool
     * @throws \Exception
     */
    public function deleteProduct(int $id, int $companyId): bool
    {
        DB::beginTransaction();
        
        try {
            $product = $this->getProduct($id, $companyId);
            
            // Delete image if exists
            if ($product->image_url && file_exists(public_path($product->image_url))) {
                unlink(public_path($product->image_url));
            }
            
            // Delete variations if exist
            $variations = $this->productRepository->getVariations($product->id);
            foreach ($variations as $variation) {
                if ($variation->image_url && file_exists(public_path($variation->image_url))) {
                    unlink(public_path($variation->image_url));
                }
                $this->productRepository->deleteVariation($variation);
            }
            
            // Delete the product
            $result = $this->productRepository->delete($product);
            
            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Create variations for a product
     * 
     * @param int $productId
     * @param array $variations
     * @return Collection
     */
    protected function createProductVariations(int $productId, array $variations): Collection
    {
        $createdVariations = collect();
        
        foreach ($variations as $variationData) {
            $variationData['product_id'] = $productId;
            
            // Handle image if provided
            if (isset($variationData['image_url']) && strpos($variationData['image_url'], 'data:image/') === 0) {
                $variationData['image_url'] = $this->saveImage($variationData['image_url'], 'variations');
            }
            
            $variation = $this->productRepository->createVariation($variationData);
            $createdVariations->push($variation);
        }
        
        return $createdVariations;
    }
    
    /**
     * Update variations for a product
     * 
     * @param int $productId
     * @param array $variations
     * @return Collection
     */
    protected function updateProductVariations(int $productId, array $variations): Collection
    {
        $existingVariations = $this->productRepository->getVariations($productId);
        $updatedVariations = collect();
        $processedIds = [];
        
        // Update or create variations
        foreach ($variations as $variationData) {
            // If ID exists, update existing variation
            if (!empty($variationData['id'])) {
                $variation = $this->productRepository->findVariationById($variationData['id']);
                
                if ($variation && $variation->product_id == $productId) {
                    // Handle image if provided
                    if (isset($variationData['image_url']) && strpos($variationData['image_url'], 'data:image/') === 0) {
                        // Delete old image if exists
                        if ($variation->image_url && file_exists(public_path($variation->image_url))) {
                            unlink(public_path($variation->image_url));
                        }
                        
                        $variationData['image_url'] = $this->saveImage($variationData['image_url'], 'variations');
                    }
                    
                    $this->productRepository->updateVariation($variation, $variationData);
                    $updatedVariations->push($variation->fresh());
                    $processedIds[] = $variation->id;
                }
            } else {
                // Create new variation
                $variationData['product_id'] = $productId;
                
                // Handle image if provided
                if (isset($variationData['image_url']) && strpos($variationData['image_url'], 'data:image/') === 0) {
                    $variationData['image_url'] = $this->saveImage($variationData['image_url'], 'variations');
                }
                
                $variation = $this->productRepository->createVariation($variationData);
                $updatedVariations->push($variation);
                $processedIds[] = $variation->id;
            }
        }
        
        // Delete variations that weren't in the update list
        foreach ($existingVariations as $existingVariation) {
            if (!in_array($existingVariation->id, $processedIds)) {
                // Delete image if exists
                if ($existingVariation->image_url && file_exists(public_path($existingVariation->image_url))) {
                    unlink(public_path($existingVariation->image_url));
                }
                
                $this->productRepository->deleteVariation($existingVariation);
            }
        }
        
        return $updatedVariations;
    }
    
    /**
     * Save image to storage and return path
     * 
     * @param string $image
     * @param string $folder
     * @return string
     */
    protected function saveImage(string $image, string $folder): string
    {
        $image = preg_replace('/^data:image\/\w+;base64,/', '', $image);
        $image = str_replace(' ', '+', $image);
        $imageName = uniqid() . '.png';
        $path = 'images/' . $folder . '/' . $imageName;
        
        $dirPath = public_path('images/' . $folder);
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0755, true);
        }
        
        file_put_contents(public_path($path), base64_decode($image));
        
        return $path;
    }
}
