import { apiSlice } from "../apiSlice";

export const companiesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCompanies: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                status = null,
            } = {}) => {
                let url = `/api/admin/companies?page=${page}&perPage=${perPage}&search=${search}`;
                if (status !== null) url += `&status=${status}`;
                return url;
            },
            providesTags: ["Companies"],
            keepUnusedDataFor: 0,
        }),
        getCompany: builder.query({
            query: (id) => `/api/admin/companies/${id}`,
            providesTags: (result, error, id) => [{ type: "Companies", id }],
            keepUnusedDataFor: 0,
        }),
        createCompany: builder.mutation({
            query: (data) => ({
                url: `/api/admin/companies`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Companies"],
        }),
        updateCompany: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/companies/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Companies", id },
                "Companies",
            ],
        }),
        deleteCompany: builder.mutation({
            query: (id) => ({
                url: `/api/admin/companies/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Companies", "Dashboard"],
        }),
    }),
});

export const {
    useGetCompaniesQuery,
    useGetCompanyQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companiesApiSlice;
