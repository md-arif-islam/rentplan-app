import { apiSlice } from "../apiSlice";

export const breedersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBreeders: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                is_active = null,
                agent = null,
                sector = null,
            } = {}) => {
                let url = `/api/admin/breeders?page=${page}&perPage=${perPage}&search=${search}`;
                if (is_active !== null) url += `&is_active=${is_active}`;
                if (agent !== null) url += `&agent=${agent}`;
                if (sector) url += `&sector=${sector}`;
                return url;
            },
            providesTags: ["Breeders"],
            keepUnusedDataFor: 0, // added
        }),
        getBreeder: builder.query({
            query: (id) => `/api/admin/breeders/${id}`,
            providesTags: (result, error, id) => [{ type: "Breeders", id }],
            keepUnusedDataFor: 0, // added
        }),
        getBreederEditData: builder.query({
            query: (id) => `/api/admin/breeders/${id}/edit`,
            providesTags: (result, error, id) => [{ type: "Breeders", id }],
            keepUnusedDataFor: 0, // added
        }),
        createBreeder: builder.mutation({
            query: (data) => ({
                url: `/api/admin/breeders`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Breeders"],
        }),
        updateBreeder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/breeders/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Breeders", id },
                "Breeders",
            ],
        }),
        deleteBreeder: builder.mutation({
            query: (id) => ({
                url: `/api/admin/breeders/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Breeders", "Dashboard"],
        }),
        getCreateData: builder.query({
            query: () => `/api/admin/breeders/create`,
            providesTags: ["BreederOptions"],
            keepUnusedDataFor: 0, // added
        }),
    }),
});

export const {
    useGetBreedersQuery,
    useGetBreederQuery,
    useGetBreederEditDataQuery,
    useCreateBreederMutation,
    useUpdateBreederMutation,
    useDeleteBreederMutation,
    useGetCreateDataQuery,
} = breedersApiSlice;
