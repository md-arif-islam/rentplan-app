<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
        ];
    }
}
