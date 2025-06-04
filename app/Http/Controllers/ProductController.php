<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);
        $type = $request->input('type');

        $query = Product::where('company_id', $companyId)
            ->with('variations');

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('specifications', 'like', "%{$search}%");
            });
        }

        // Filter by type if provided
        if ($type !== null && $type !== '') {
            $query->where('type', $type);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Validate product data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'type' => 'required|integer|in:0,1', // 0 = simple, 1 = variable
                'price' => 'required_if:type,0|nullable|numeric|min:0',
                'stock' => 'nullable|integer|min:0',
                'specifications' => 'nullable|string',
                'image_url' => 'nullable|string',
                'woocommerce_product_id' => 'nullable|integer|unique:products',
                'variations' => 'required_if:type,1|array',
                'variations.*.variant_name' => 'required_if:type,1|string|max:255',
                'variations.*.sku' => 'nullable|string|max:100|unique:product_variations,sku',
                'variations.*.price' => 'required_if:type,1|numeric|min:0',
                'variations.*.stock' => 'nullable|integer|min:0',
                'variations.*.specifications' => 'nullable|string',
                'variations.*.attributes' => 'nullable|string',
                'variations.*.image_url' => 'nullable|string',
                'variations.*.woocommerce_variation_id' => 'nullable|integer|unique:product_variations,woocommerce_variation_id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $productData = $request->except(['variations', 'image_url']);
            $productData['company_id'] = $companyId;

            // Handle image upload if provided as base64
            if ($request->has('image_url') && $request->image_url) {
                try {
                    $productData['image_url'] = $this->saveImage($request->image_url, 'products');
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Create product
            $product = Product::create($productData);

            // Create variations if product type is variable
            if ($request->input('type') == 1 && $request->has('variations')) {
                foreach ($request->variations as $variationData) {
                    $variation = new ProductVariation(collect($variationData)->except(['image_url'])->toArray());

                    // Handle image upload for variation if provided
                    if (isset($variationData['image_url']) && $variationData['image_url'] && preg_match('/^data:image\//', $variationData['image_url'])) {
                        try {
                            $variation->image_url = $this->saveImage($variationData['image_url'], 'variations');
                        } catch (\Exception $e) {
                            return response()->json(['error' => $e->getMessage()], 422);
                        }
                    }

                    $product->variations()->save($variation);
                }
            }

            DB::commit();

            // Reload the product with variations
            $product = Product::with('variations')->find($product->id);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $product = Product::where('id', $id)
            ->where('company_id', $companyId)
            ->with('variations')
            ->firstOrFail();

        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $product = Product::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Validate product data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'type' => 'required|integer|in:0,1', // 0 = simple, 1 = variable
                'price' => 'required_if:type,0|nullable|numeric|min:0',
                'stock' => 'nullable|integer|min:0',
                'specifications' => 'nullable|string',
                'image_url' => 'nullable|string',
                'woocommerce_product_id' => 'nullable|integer|unique:products,woocommerce_product_id,' . $id,
                'variations' => 'required_if:type,1|array',
                'variations.*.id' => 'nullable|integer|exists:product_variations,id',
                'variations.*.variant_name' => 'required_if:type,1|string|max:255',
                'variations.*.sku' => 'nullable|string|max:100',
                'variations.*.price' => 'required_if:type,1|numeric|min:0',
                'variations.*.stock' => 'nullable|integer|min:0',
                'variations.*.specifications' => 'nullable|string',
                'variations.*.attributes' => 'nullable|string',
                'variations.*.image_url' => 'nullable|string',
                'variations.*.woocommerce_variation_id' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $productData = $request->except(['variations', 'image_url']);

            // Handle image upload if provided as base64
            if ($request->has('image_url') && $request->image_url && preg_match('/^data:image\//', $request->image_url)) {
                try {
                    // Delete old image if exists
                    if ($product->image_url && file_exists(public_path($product->image_url))) {
                        unlink(public_path($product->image_url));
                    }

                    $productData['image_url'] = $this->saveImage($request->image_url, 'products');
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 422);
                }
            }

            // Update product
            $product->update($productData);

            // Handle variations
            if ($request->input('type') == 1 && $request->has('variations')) {
                // Get existing variation IDs
                $existingVariationIds = $product->variations()->pluck('id')->toArray();
                $updatedVariationIds = [];

                foreach ($request->variations as $variationData) {
                    if (isset($variationData['id'])) {
                        // Update existing variation
                        $variation = ProductVariation::find($variationData['id']);

                        if ($variation) {
                            $varData = collect($variationData)->except(['id', 'image_url'])->toArray();

                            // Handle image upload for variation if provided
                            if (isset($variationData['image_url']) && $variationData['image_url'] && preg_match('/^data:image\//', $variationData['image_url'])) {
                                try {
                                    // Delete old image if exists
                                    if ($variation->image_url && file_exists(public_path($variation->image_url))) {
                                        unlink(public_path($variation->image_url));
                                    }

                                    $varData['image_url'] = $this->saveImage($variationData['image_url'], 'variations');
                                } catch (\Exception $e) {
                                    return response()->json(['error' => $e->getMessage()], 422);
                                }
                            }

                            $variation->update($varData);
                            $updatedVariationIds[] = $variation->id;
                        }
                    } else {
                        // Create new variation
                        $variation = new ProductVariation(collect($variationData)->except(['image_url'])->toArray());

                        // Handle image upload for new variation if provided
                        if (isset($variationData['image_url']) && $variationData['image_url'] && preg_match('/^data:image\//', $variationData['image_url'])) {
                            try {
                                $variation->image_url = $this->saveImage($variationData['image_url'], 'variations');
                            } catch (\Exception $e) {
                                return response()->json(['error' => $e->getMessage()], 422);
                            }
                        }

                        $product->variations()->save($variation);
                        $updatedVariationIds[] = $variation->id;
                    }
                }

                // Delete variations not in the request
                $variationsToDelete = array_diff($existingVariationIds, $updatedVariationIds);

                foreach ($variationsToDelete as $varId) {
                    $variation = ProductVariation::find($varId);

                    if ($variation && $variation->image_url && file_exists(public_path($variation->image_url))) {
                        unlink(public_path($variation->image_url));
                    }
                }

                ProductVariation::destroy($variationsToDelete);
            } else {
                // If product is simple, remove all variations
                foreach ($product->variations as $variation) {
                    if ($variation->image_url && file_exists(public_path($variation->image_url))) {
                        unlink(public_path($variation->image_url));
                    }
                }

                $product->variations()->delete();
            }

            DB::commit();

            // Reload the product with variations
            $product = Product::with('variations')->find($product->id);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;

        $product = Product::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        try {
            // Delete product image if exists
            if ($product->image_url && file_exists(public_path($product->image_url))) {
                unlink(public_path($product->image_url));
            }

            // Delete variation images
            foreach ($product->variations as $variation) {
                if ($variation->image_url && file_exists(public_path($variation->image_url))) {
                    unlink(public_path($variation->image_url));
                }
            }

            // Delete variations (will be cascaded via foreign key, but explicitly delete for image cleanup)
            $product->variations()->delete();

            // Delete product
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save Base64 image to storage.
     */
    private function saveImage($image, $type = 'products')
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('Invalid image type');
            }

            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('Base64 decode failed');
            }
        } else {
            throw new \Exception('Did not match data URI with image data');
        }

        $dir = "images/{$type}/";
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!\File::exists($absolutePath)) {
            \File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents(public_path($relativePath), $image);

        return $relativePath;
    }
}
