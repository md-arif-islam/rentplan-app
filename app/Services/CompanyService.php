<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Repositories\CompanyRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CompanyService
{
    protected $companyRepository;

    /**
     * Constructor
     *
     * @param CompanyRepository $companyRepository
     */
    public function __construct(CompanyRepository $companyRepository)
    {
        $this->companyRepository = $companyRepository;
    }

    /**
     * Get all companies with optional filtering
     *
     * @param array $params
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getCompanies(array $params)
    {
        $search = $params['search'] ?? null;
        $perPage = $params['perPage'] ?? 10;
        $status = $params['status'] ?? null;

        return $this->companyRepository->getAll($search, $perPage, $status);
    }

    /**
     * Get a company by ID
     *
     * @param int $id
     * @return Company
     * @throws \Exception
     */
    public function getCompany(int $id): Company
    {
        $company = $this->companyRepository->findById($id);

        if (!$company) {
            throw new \Exception('Company not found', 404);
        }

        return $company;
    }

    /**
     * Create a new company
     *
     * @param array $data
     * @return Company
     * @throws \Exception
     */
    public function createCompany(array $data): Company
    {
        DB::beginTransaction();

        try {
            $companyData = $data;

            // Handle logo upload if provided as base64
            if (isset($data['logo']) && $data['logo'] && preg_match('/^data:image\//', $data['logo'])) {
                $companyData['logo'] = $this->saveImage($data['logo']);
            }

            // Set default plan data if not provided
            if (!isset($companyData['plan'])) {
                $companyData['plan'] = [
                    'plan_name' => 'Basic',
                    'plan_price' => 0,
                    'plan_status' => 'active',
                    'plan_features' => ['basic_features'],
                    'plan_start_date' => now()->toDateString(),
                    'plan_expiry_date' => now()->addMonth()->toDateString(),
                ];
            }

            // Create company
            $company = $this->companyRepository->create($companyData);

            DB::commit();
            return $company;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a company
     *
     * @param int $id
     * @param array $data
     * @return Company
     * @throws \Exception
     */
    public function updateCompany(int $id, array $data): Company
    {
        $company = $this->getCompany($id);

        DB::beginTransaction();

        try {
            $companyData = $data;

            // Handle logo upload if provided as base64
            if (isset($data['logo']) && $data['logo'] && preg_match('/^data:image\//', $data['logo'])) {
                // Delete old logo if it exists
                if ($company->logo && File::exists(public_path($company->logo))) {
                    File::delete(public_path($company->logo));
                }

                $companyData['logo'] = $this->saveImage($data['logo']);
            }

            // Update plan data if provided
            if (isset($companyData['plan'])) {
                // Merge with existing plan data to preserve fields not included in the request
                $currentPlan = $company->plan ?? [];
                $companyData['plan'] = array_merge($currentPlan, $companyData['plan']);
            }

            // Update company
            $this->companyRepository->update($company, $companyData);

            DB::commit();
            return $company->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a company
     *
     * @param int $id
     * @return bool
     * @throws \Exception
     */
    public function deleteCompany(int $id): bool
    {
        $company = $this->getCompany($id);

        DB::beginTransaction();

        try {
            // Delete logo if exists
            if ($company->logo && File::exists(public_path($company->logo))) {
                File::delete(public_path($company->logo));
            }

            // Delete all users associated with this company
            User::where('company_id', $company->id)->delete();

            // Delete the company
            $result = $this->companyRepository->delete($company);

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update company plan information
     *
     * @param int $id
     * @param array $planData
     * @return Company
     * @throws \Exception
     */
    public function updateCompanyPlan(int $id, array $planData): Company
    {
        $company = $this->getCompany($id);

        DB::beginTransaction();

        try {
            $plan = [
                'plan_name' => $planData['plan_name'],
                'plan_price' => $planData['plan_price'],
                'plan_status' => $planData['plan_status'],
                'plan_features' => $planData['plan_features'] ?? [],
                'plan_start_date' => $planData['plan_start_date'],
                'plan_expiry_date' => $planData['plan_expiry_date'],
            ];

            $company->plan = $plan;
            $company->save();

            DB::commit();
            return $company->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Save Base64 image to storage.
     *
     * @param string $image
     * @return string
     * @throws \Exception
     */
    protected function saveImage(string $image): string
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

        $dir = 'images/companies/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents(public_path($relativePath), $image);

        return $relativePath;
    }
}
