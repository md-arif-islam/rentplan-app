<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Repositories\CustomerRepository;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    protected $orderRepository;
    protected $customerRepository;
    protected $productRepository;

    /**
     * Constructor
     *
     * @param OrderRepository $orderRepository
     * @param CustomerRepository $customerRepository
     * @param ProductRepository $productRepository
     */
    public function __construct(
        OrderRepository $orderRepository,
        CustomerRepository $customerRepository,
        ProductRepository $productRepository
    ) {
        $this->orderRepository = $orderRepository;
        $this->customerRepository = $customerRepository;
        $this->productRepository = $productRepository;
    }

    /**
     * Get all orders for a company with filtering
     *
     * @param int $companyId
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getOrders(int $companyId, array $params = []): LengthAwarePaginator
    {
        return $this->orderRepository->getAll($companyId, $params);
    }

    /**
     * Get an order by ID
     *
     * @param int $id
     * @param int $companyId
     * @return Order
     * @throws \Exception
     */
    public function getOrder(int $id, int $companyId): Order
    {
        $order = $this->orderRepository->findById($id, $companyId);

        if (!$order) {
            throw new \Exception('Order not found', 404);
        }

        return $order;
    }

    /**
     * Create a new order
     *
     * @param array $data
     * @param int $companyId
     * @return Order
     * @throws \Exception
     */
    public function createOrder(array $data, int $companyId): Order
    {
        // Verify the customer belongs to the company
        $customer = $this->customerRepository->findById($data['customer_id'], $companyId);
        if (!$customer) {
            throw new \Exception('Customer not found or does not belong to your company', 404);
        }

        // Verify the product belongs to the company
        $product = $this->productRepository->findById($data['product_id'], $companyId);
        if (!$product) {
            throw new \Exception('Product not found or does not belong to your company', 404);
        }

        // Set default status if not provided
        if (!isset($data['order_status'])) {
            $data['order_status'] = 'pending';
        }

        // Create the order
        $order = $this->orderRepository->create($data);

        return $order->fresh(['customer', 'product']);
    }

    /**
     * Update an order
     *
     * @param int $id
     * @param array $data
     * @param int $companyId
     * @return Order
     * @throws \Exception
     */
    public function updateOrder(int $id, array $data, int $companyId): Order
    {
        $order = $this->getOrder($id, $companyId);

        // If customer_id is being changed, verify the new customer belongs to the company
        if (isset($data['customer_id']) && $data['customer_id'] != $order->customer_id) {
            $customer = $this->customerRepository->findById($data['customer_id'], $companyId);
            if (!$customer) {
                throw new \Exception('Customer not found or does not belong to your company', 404);
            }
        }

        // If product_id is being changed, verify the new product belongs to the company
        if (isset($data['product_id']) && $data['product_id'] != $order->product_id) {
            $product = $this->productRepository->findById($data['product_id'], $companyId);
            if (!$product) {
                throw new \Exception('Product not found or does not belong to your company', 404);
            }
        }

        // Update the order
        $this->orderRepository->update($order, $data);

        return $order->fresh(['customer', 'product']);
    }

    /**
     * Delete an order
     *
     * @param int $id
     * @param int $companyId
     * @return bool
     * @throws \Exception
     */
    public function deleteOrder(int $id, int $companyId): bool
    {
        $order = $this->getOrder($id, $companyId);

        return $this->orderRepository->delete($order);
    }
}
