<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
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
        $status = $request->input('status');
        
        // Query orders through customers that belong to the company
        $query = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->with(['customer', 'product']);
        
        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('product', function ($productQuery) use ($search) {
                    $productQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhere('woocommerce_order_id', 'like', "%{$search}%")
                ->orWhere('invoice_city', 'like', "%{$search}%")
                ->orWhere('delivery_city', 'like', "%{$search}%");
            });
        }
        
        // Filter by status if provided
        if ($status) {
            $query->where('order_status', $status);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json($orders);
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
            // Validate order data
            $validator = Validator::make($request->all(), [
                'customer_id' => 'required|exists:customers,id',
                'product_id' => 'required|exists:products,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'order_status' => 'nullable|string|max:50',
                'woocommerce_order_id' => 'nullable|integer|unique:orders',
                'invoice_street' => 'nullable|string|max:255',
                'invoice_postal_code' => 'nullable|string|max:20',
                'invoice_house_number' => 'nullable|string|max:50',
                'invoice_city' => 'nullable|string|max:100',
                'invoice_country' => 'nullable|string|max:100',
                'delivery_street' => 'nullable|string|max:255',
                'delivery_postal_code' => 'nullable|string|max:20',
                'delivery_house_number' => 'nullable|string|max:50',
                'delivery_city' => 'nullable|string|max:100',
                'delivery_country' => 'nullable|string|max:100',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            // Verify the customer belongs to the company
            $customer = Customer::find($request->customer_id);
            if (!$customer || $customer->company_id !== $companyId) {
                return response()->json([
                    'message' => 'Customer not found or does not belong to your company',
                ], 404);
            }
            
            // Verify the product belongs to the company
            $product = Product::find($request->product_id);
            if (!$product || $product->company_id !== $companyId) {
                return response()->json([
                    'message' => 'Product not found or does not belong to your company',
                ], 404);
            }
            
            // Create the order
            $orderData = $request->all();
            if (!isset($orderData['order_status'])) {
                $orderData['order_status'] = 'pending';
            }
            
            $order = Order::create($orderData);
            
            DB::commit();
            
            // Load relationships
            $order->load(['customer', 'product']);
            
            return response()->json([
                'message' => 'Order created successfully',
                'data' => $order,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create order',
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
        
        $order = Order::with(['customer', 'product'])
            ->whereHas('customer', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->findOrFail($id);
        
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $currentUser = auth()->user();
        $companyId = $currentUser->company_id;
        
        // Find the order and ensure it belongs to the company
        $order = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->findOrFail($id);
        
        // Start a database transaction
        DB::beginTransaction();
        
        try {
            // Validate order data
            $validator = Validator::make($request->all(), [
                'customer_id' => 'sometimes|exists:customers,id',
                'product_id' => 'sometimes|exists:products,id',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'order_status' => 'nullable|string|max:50',
                'woocommerce_order_id' => 'nullable|integer|unique:orders,woocommerce_order_id,' . $id,
                'invoice_street' => 'nullable|string|max:255',
                'invoice_postal_code' => 'nullable|string|max:20',
                'invoice_house_number' => 'nullable|string|max:50',
                'invoice_city' => 'nullable|string|max:100',
                'invoice_country' => 'nullable|string|max:100',
                'delivery_street' => 'nullable|string|max:255',
                'delivery_postal_code' => 'nullable|string|max:20',
                'delivery_house_number' => 'nullable|string|max:50',
                'delivery_city' => 'nullable|string|max:100',
                'delivery_country' => 'nullable|string|max:100',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            // If customer_id is being changed, verify the new customer belongs to the company
            if ($request->has('customer_id') && $request->customer_id !== $order->customer_id) {
                $customer = Customer::find($request->customer_id);
                if (!$customer || $customer->company_id !== $companyId) {
                    return response()->json([
                        'message' => 'Customer not found or does not belong to your company',
                    ], 404);
                }
            }
            
            // If product_id is being changed, verify the new product belongs to the company
            if ($request->has('product_id') && $request->product_id !== $order->product_id) {
                $product = Product::find($request->product_id);
                if (!$product || $product->company_id !== $companyId) {
                    return response()->json([
                        'message' => 'Product not found or does not belong to your company',
                    ], 404);
                }
            }
            
            // Update the order
            $order->update($request->all());
            
            DB::commit();
            
            // Load relationships
            $order->load(['customer', 'product']);
            
            return response()->json([
                'message' => 'Order updated successfully',
                'data' => $order,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update order',
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
        
        // Find the order and ensure it belongs to the company
        $order = Order::whereHas('customer', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->findOrFail($id);
        
        try {
            $order->delete();
            
            return response()->json([
                'message' => 'Order deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
