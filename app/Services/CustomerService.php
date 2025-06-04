<?php

namespace App\Services;

use App\Models\Customer;
use App\Repositories\CustomerRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService
{
    protected $customerRepository;

    /**
     * Constructor
     *
     * @param CustomerRepository $customerRepository
     */
    public function __construct(CustomerRepository $customerRepository)
    {
        $this->customerRepository = $customerRepository;
    }

    /**
     * Get all customers for a company with filtering
     *
     * @param int $companyId
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getCustomers(int $companyId, array $params = []): LengthAwarePaginator
    {
        $search = $params['search'] ?? null;
        $perPage = $params['perPage'] ?? 10;

        return $this->customerRepository->getAll($companyId, $search, $perPage);
    }

    /**
     * Get a customer by ID
     *
     * @param int $id
     * @param int $companyId
     * @return Customer|null
     * @throws \Exception
     */
    public function getCustomer(int $id, int $companyId): ?Customer
    {
        $customer = $this->customerRepository->findById($id, $companyId);

        if (!$customer) {
            throw new \Exception('Customer not found', 404);
        }

        return $customer;
    }

    /**
     * Create a new customer
     *
     * @param array $data
     * @return Customer
     * @throws \Exception
     */
    public function createCustomer(array $data): Customer
    {
        // Check if customer with same email already exists for this company
        if (isset($data['email']) && $data['email']) {
            $existingCustomer = $this->customerRepository->findByEmail($data['email'], $data['company_id']);

            if ($existingCustomer) {
                throw new \Exception('Customer with this email already exists', 422);
            }
        }

        return $this->customerRepository->create($data);
    }

    /**
     * Update a customer
     *
     * @param int $id
     * @param array $data
     * @param int $companyId
     * @return Customer
     * @throws \Exception
     */
    public function updateCustomer(int $id, array $data, int $companyId): Customer
    {
        $customer = $this->getCustomer($id, $companyId);

        // Check if customer with same email already exists for this company (excluding current customer)
        if (isset($data['email']) && $data['email'] && $data['email'] !== $customer->email) {
            $existingCustomer = $this->customerRepository->findByEmail($data['email'], $companyId);

            if ($existingCustomer && $existingCustomer->id !== $id) {
                throw new \Exception('Customer with this email already exists', 422);
            }
        }

        $this->customerRepository->update($customer, $data);

        return $customer->fresh();
    }

    /**
     * Delete a customer
     *
     * @param int $id
     * @param int $companyId
     * @return bool
     * @throws \Exception
     */
    public function deleteCustomer(int $id, int $companyId): bool
    {
        $customer = $this->getCustomer($id, $companyId);

        return $this->customerRepository->delete($customer);
    }
}
