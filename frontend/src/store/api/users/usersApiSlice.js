import { apiSlice } from "../apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCompanyUsers: builder.query({
            query: ({
                page = 1,
                perPage = 10,
                search = "",
                role = null,
            } = {}) => {
                let url = `/api/company/users?page=${page}&perPage=${perPage}&search=${search}`;
                if (role !== null) url += `&role=${role}`;
                return url;
            },
            providesTags: ["CompanyUsers"],
            keepUnusedDataFor: 0,
        }),
        getCompanyUser: builder.query({
            query: (id) => `/api/company/users/${id}`,
            providesTags: (result, error, id) => [{ type: "CompanyUsers", id }],
            keepUnusedDataFor: 0,
        }),
        createCompanyUser: builder.mutation({
            query: (data) => ({
                url: `/api/company/users`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CompanyUsers"],
        }),
        updateCompanyUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/company/users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "CompanyUsers", id },
                "CompanyUsers",
            ],
        }),
        deleteCompanyUser: builder.mutation({
            query: (id) => ({
                url: `/api/company/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["CompanyUsers"],
        }),
        getCompanyRoles: builder.query({
            query: () => "/api/company/roles",
            providesTags: ["Roles"],
        }),
    }),
});

export const {
    useGetCompanyUsersQuery,
    useGetCompanyUserQuery,
    useCreateCompanyUserMutation,
    useUpdateCompanyUserMutation,
    useDeleteCompanyUserMutation,
    useGetCompanyRolesQuery,
} = usersApiSlice;
