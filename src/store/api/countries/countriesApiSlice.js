import { apiSlice } from "../apiSlice";

export const countriesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCountries: builder.query({
            query: ({ page = 1, perPage = 10, search = "" } = {}) =>
                `/api/admin/countries?page=${page}&perPage=${perPage}&search=${search}`,
            providesTags: ["Countries"],
            keepUnusedDataFor: 0, // added
        }),
        deleteCountry: builder.mutation({
            query: (id) => ({
                url: `/api/admin/countries/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Countries"],
        }),
        refreshCountries: builder.mutation({
            query: () => ({
                url: `/api/admin/countries/refresh`,
                method: "GET",
            }),
            invalidatesTags: ["Countries"],
        }),
    }),
});

export const {
    useGetCountriesQuery,
    useDeleteCountryMutation,
    useRefreshCountriesMutation,
} = countriesApiSlice;
