<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'plan_name' => 'required|string|max:100',
            'plan_price' => 'required|numeric|min:0',
            'plan_status' => 'required|in:active,inactive,trial,expired',
            'plan_features' => 'nullable|array',
            'plan_start_date' => 'required|date',
            'plan_expiry_date' => 'required|date|after:plan_start_date',
        ];
    }
}
