import { apiSlice } from "../apiSlice";

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                status = "",
            } = {}) => {
                let url = `/api/company/orders?page=${page}&perPage=${perPage}`;
                if (search) url += `&search=${search}`;
                if (status) url += `&status=${status}`;
                return url;
            },
            providesTags: ["Orders"],
            keepUnusedDataFor: 0,
        }),
        getOrder: builder.query({
            query: (id) => `/api/company/orders/${id}`,
            providesTags: (result, error, id) => [{ type: "Orders", id }],
            keepUnusedDataFor: 0,
        }),
        createOrder: builder.mutation({
            query: (data) => ({
                url: `/api/company/orders`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Orders"],
        }),
        updateOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/company/orders/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Orders", id },
                "Orders",
            ],
        }),
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/api/company/orders/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Orders"],
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} = ordersApiSlice;
