<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'type' => 'required|integer|in:0,1', // 0 = simple, 1 = variable
            'price' => 'required_if:type,0|nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'specifications' => 'nullable|string',
            'image_url' => 'nullable|string',
            'woocommerce_product_id' => 'nullable|integer|unique:products',
            'variations' => 'required_if:type,1|array',
            'variations.*.id' => 'nullable|integer',
            'variations.*.variant_name' => 'required_if:type,1|string|max:255',
            'variations.*.sku' => 'nullable|string|max:100|unique:product_variations,sku',
            'variations.*.price' => 'required_if:type,1|numeric|min:0',
            'variations.*.stock' => 'nullable|integer|min:0',
            'variations.*.specifications' => 'nullable|string',
            'variations.*.attributes' => 'nullable|string',
            'variations.*.image_url' => 'nullable|string',
            'variations.*.woocommerce_variation_id' => 'nullable|integer|unique:product_variations,woocommerce_variation_id',
        ];
    }
}
