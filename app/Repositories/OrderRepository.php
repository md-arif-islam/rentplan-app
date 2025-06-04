<?php

namespace App\Repositories;

use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderRepository
{
    /**
     * Get all orders for a company with optional filtering
     * 
     * @param int $companyId
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getAll(int $companyId, array $params = []): LengthAwarePaginator
    {
        $search = $params['search'] ?? null;
        $perPage = $params['perPage'] ?? 10;
        $status = $params['status'] ?? null;
        
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
        
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
    
    /**
     * Find order by ID for specific company
     * 
     * @param int $id
     * @param int $companyId
     * @return Order|null
     */
    public function findById(int $id, int $companyId): ?Order
    {
        return Order::whereHas('customer', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->with(['customer', 'product'])
            ->where('id', $id)
            ->first();
    }
    
    /**
     * Create a new order
     * 
     * @param array $data
     * @return Order
     */
    public function create(array $data): Order
    {
        return Order::create($data);
    }
    
    /**
     * Update an order
     * 
     * @param Order $order
     * @param array $data
     * @return bool
     */
    public function update(Order $order, array $data): bool
    {
        return $order->update($data);
    }
    
    /**
     * Delete an order
     * 
     * @param Order $order
     * @return bool|null
     */
    public function delete(Order $order): ?bool
    {
        return $order->delete();
    }
}
