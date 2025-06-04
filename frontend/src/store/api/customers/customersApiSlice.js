import { apiSlice } from "../apiSlice";

export const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: ({ page = 1, perPage = 10, search = "" } = {}) => {
                let url = `/api/company/customers?page=${page}&perPage=${perPage}&search=${search}`;
                return url;
            },
            providesTags: ["Customers"],
            keepUnusedDataFor: 0,
        }),
        getCustomer: builder.query({
            query: (id) => `/api/company/customers/${id}`,
            providesTags: (result, error, id) => [{ type: "Customers", id }],
            keepUnusedDataFor: 0,
        }),
        createCustomer: builder.mutation({
            query: (data) => ({
                url: `/api/company/customers`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Customers"],
        }),
        updateCustomer: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/company/customers/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Customers", id },
                "Customers",
            ],
        }),
        deleteCustomer: builder.mutation({
            query: (id) => ({
                url: `/api/company/customers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Customers", "Dashboard"],
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetCustomerQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customersApiSlice;
