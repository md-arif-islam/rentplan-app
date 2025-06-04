import { apiSlice } from "../apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                type = "",
            } = {}) => {
                let url = `/api/company/products?page=${page}&perPage=${perPage}&search=${search}`;
                if (type !== "") url += `&type=${type}`;
                return url;
            },
            providesTags: ["Products"],
            keepUnusedDataFor: 0,
        }),
        getProduct: builder.query({
            query: (id) => `/api/company/products/${id}`,
            providesTags: (result, error, id) => [{ type: "Products", id }],
            keepUnusedDataFor: 0,
        }),
        createProduct: builder.mutation({
            query: (data) => ({
                url: `/api/company/products`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Products"],
        }),
        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/company/products/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Products", id },
                "Products",
            ],
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/api/company/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Products"],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productsApiSlice;
