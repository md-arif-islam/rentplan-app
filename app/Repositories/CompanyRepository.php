<?php

namespace App\Repositories;

use App\Models\Company;
use Illuminate\Pagination\LengthAwarePaginator;

class CompanyRepository
{
    /**
     * Get all companies with optional filtering
     *
     * @param string|null $search
     * @param int $perPage
     * @param string|null $status
     * @return LengthAwarePaginator
     */
    public function getAll(?string $search = null, int $perPage = 10, ?string $status = null): LengthAwarePaginator
    {
        $query = Company::query();

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('website', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Filter by status if provided in plan data
        if ($status) {
            $query->whereJsonContains('plan->plan_status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Find company by ID
     *
     * @param int $id
     * @return Company|null
     */
    public function findById(int $id): ?Company
    {
        return Company::with(['users' => function ($query) {
            $query->with('role');
        }])->find($id);
    }

    /**
     * Create a new company
     *
     * @param array $data
     * @return Company
     */
    public function create(array $data): Company
    {
        return Company::create($data);
    }

    /**
     * Update a company
     *
     * @param Company $company
     * @param array $data
     * @return bool
     */
    public function update(Company $company, array $data): bool
    {
        return $company->update($data);
    }

    /**
     * Delete a company
     *
     * @param Company $company
     * @return bool|null
     */
    public function delete(Company $company): ?bool
    {
        return $company->delete();
    }
}
