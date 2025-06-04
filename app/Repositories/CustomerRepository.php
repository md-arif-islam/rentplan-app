<?php

namespace App\Repositories;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerRepository
{
    /**
     * Get all customers for a company with optional filtering
     *
     * @param int $companyId
     * @param string|null $search
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(int $companyId, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Customer::where('company_id', $companyId);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Find customer by ID for specific company
     *
     * @param int $id
     * @param int $companyId
     * @return Customer|null
     */
    public function findById(int $id, int $companyId): ?Customer
    {
        return Customer::where('id', $id)
            ->where('company_id', $companyId)
            ->first();
    }

    /**
     * Find customer by email for specific company
     *
     * @param string $email
     * @param int $companyId
     * @return Customer|null
     */
    public function findByEmail(string $email, int $companyId): ?Customer
    {
        return Customer::where('email', $email)
            ->where('company_id', $companyId)
            ->first();
    }

    /**
     * Create a new customer
     *
     * @param array $data
     * @return Customer
     */
    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    /**
     * Update a customer
     *
     * @param Customer $customer
     * @param array $data
     * @return bool
     */
    public function update(Customer $customer, array $data): bool
    {
        return $customer->update($data);
    }

    /**
     * Delete a customer
     *
     * @param Customer $customer
     * @return bool|null
     */
    public function delete(Customer $customer): ?bool
    {
        return $customer->delete();
    }
}
