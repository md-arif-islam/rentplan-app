<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $productService;
    
    /**
     * Constructor
     * 
     * @param ProductService $productService
     */
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        $params = [
            'search' => $request->input('search'),
            'perPage' => $request->input('perPage', 10),
            'type' => $request->input('type'),
        ];
        
        $products = $this->productService->getProducts($companyId, $params);
        
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            // Add company ID to the validated data
            $data = $request->validated();
            $data['company_id'] = $companyId;
            
            // Create product through service
            $product = $this->productService->createProduct($data);
            
            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
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
        
        try {
            $product = $this->productService->getProduct($id, $companyId);
            
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            $data = $request->validated();
            
            // Update product through service
            $product = $this->productService->updateProduct($id, $data, $companyId);
            
            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        try {
            $this->productService->deleteProduct($id, $companyId);
            
            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }
}
