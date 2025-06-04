<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
        $rules = [
            'email' => 'required|email|max:255|unique:users,email,' . $this->route('id'),
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ];

        // Add password validation rules only if password is being updated
        if ($this->filled('password')) {
            $rules['password'] = 'min:8|confirmed';
            $rules['password_confirmation'] = 'required';
        }

        return $rules;
    }
}
