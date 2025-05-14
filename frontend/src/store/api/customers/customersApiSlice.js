import { apiSlice } from "../apiSlice";

export const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                is_active = null,
                agent = null,
                sector = null,
            } = {}) => {
                let url = `/api/admin/customers?page=${page}&perPage=${perPage}&search=${search}`;
                if (is_active !== null) url += `&is_active=${is_active}`;
                if (agent !== null) url += `&agent=${agent}`;
                if (sector) url += `&sector=${sector}`;
                return url;
            },
            providesTags: ["Customers"],
            keepUnusedDataFor: 0, // added
        }),
        getCustomer: builder.query({
            query: (id) => `/api/admin/customers/${id}`,
            providesTags: (result, error, id) => [{ type: "Customers", id }],
            keepUnusedDataFor: 0, // added
        }),
        getCustomerEditData: builder.query({
            query: (id) => `/api/admin/customers/${id}/edit`,
            providesTags: (result, error, id) => [{ type: "Customers", id }],
            keepUnusedDataFor: 0, // added
        }),
        createCustomer: builder.mutation({
            query: (data) => ({
                url: `/api/admin/customers`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Customers"],
        }),
        updateCustomer: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/customers/${id}`,
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
                url: `/api/admin/customers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Customers", "Dashboard"],
        }),
        getCreateData: builder.query({
            query: () => `/api/admin/customers/create`,
            providesTags: ["CustomerOptions"],
            keepUnusedDataFor: 0, // added
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetCustomerQuery,
    useGetCustomerEditDataQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetCreateDataQuery,
} = customersApiSlice;
