import { apiSlice } from "../apiSlice";

export const holdersTaxesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getHoldersTaxes: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                is_deductible = null,
            } = {}) => {
                let url = `/api/admin/holders-taxes?page=${page}&perPage=${perPage}&search=${search}`;
                if (is_deductible !== null) {
                    url += `&is_deductible=${is_deductible}`;
                }
                return url;
            },
            providesTags: ["HoldersTaxes"],
        }),
        getHoldersTax: builder.query({
            query: (id) => `/api/admin/holders-taxes/${id}`,
            providesTags: (result, error, id) => [{ type: "HoldersTaxes", id }],
        }),
        // New endpoint for fetching edit data (tax record + extra options)
        getHoldersTaxEditData: builder.query({
            query: (id) => `/api/admin/holders-taxes/${id}/edit`,
            providesTags: (result, error, id) => [{ type: "HoldersTaxes", id }],
        }),
        createHoldersTax: builder.mutation({
            query: (data) => ({
                url: `/api/admin/holders-taxes`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["HoldersTaxes"],
        }),
        updateHoldersTax: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/holders-taxes/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "HoldersTaxes", id },
                "HoldersTaxes",
            ],
        }),
        deleteHoldersTax: builder.mutation({
            query: (id) => ({
                url: `/api/admin/holders-taxes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["HoldersTaxes"],
        }),
        getDeductibleTaxes: builder.query({
            query: ({ page = 1, perPage = 10 } = {}) =>
                `/api/admin/holders-taxes/deductible?page=${page}&perPage=${perPage}`,
            providesTags: ["HoldersTaxes"],
        }),
        getAbovePercentageTaxes: builder.query({
            query: ({ threshold, page = 1, perPage = 10 } = {}) =>
                `/api/admin/holders-taxes/above-percentage?threshold=${threshold}&page=${page}&perPage=${perPage}`,
            providesTags: ["HoldersTaxes"],
        }),
        getTaxByCountry: builder.query({
            query: (countryId) =>
                `/api/admin/holders-taxes/by-country/${countryId}`,
            providesTags: (result, error, countryId) => [
                { type: "HoldersTaxes", id: `country-${countryId}` },
            ],
        }),
    }),
});

export const {
    useGetHoldersTaxesQuery,
    useGetHoldersTaxQuery,
    useGetHoldersTaxEditDataQuery,
    useCreateHoldersTaxMutation,
    useUpdateHoldersTaxMutation,
    useDeleteHoldersTaxMutation,
    useGetDeductibleTaxesQuery,
    useGetAbovePercentageTaxesQuery,
    useGetTaxByCountryQuery,
} = holdersTaxesApiSlice;
