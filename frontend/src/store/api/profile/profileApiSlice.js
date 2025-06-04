import { apiSlice } from "../apiSlice";

export const profileApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Admin Profile Endpoints
        getAdminProfile: builder.query({
            query: (id) => `/api/admin/profile/${id}`,
            providesTags: (result, error, id) => [
                { type: "Profile", id },
                { type: "Profile", id: "LIST" },
            ],
            keepUnusedDataFor: 0,
        }),
        getAdminProfileByUserId: builder.query({
            query: (userId) => `/api/admin/profile/${userId}`,
            providesTags: (result, error, userId) => [
                { type: "Profile", id: userId },
                { type: "ProfileByUser", id: userId },
                { type: "Profile", id: "LIST" },
            ],
            keepUnusedDataFor: 0,
        }),
        updateAdminProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/profile/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Profile", id },
                { type: "ProfileByUser", id: result?.user_id },
                { type: "Profile", id: "LIST" },
            ],
        }),

        // Company Profile Endpoints
        getCompanyProfile: builder.query({
            query: (id) => `/api/company/profile/${id}`,
            providesTags: (result, error, id) => [
                { type: "CompanyProfile", id },
                { type: "CompanyProfile", id: "LIST" },
            ],
            keepUnusedDataFor: 0,
        }),
        getCompanyProfileByUserId: builder.query({
            query: (userId) => `/api/company/profile/${userId}`,
            providesTags: (result, error, userId) => [
                { type: "CompanyProfile", id: userId },
                { type: "CompanyProfileByUser", id: userId },
                { type: "CompanyProfile", id: "LIST" },
            ],
            keepUnusedDataFor: 0,
        }),
        updateCompanyProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/company/profile/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "CompanyProfile", id },
                { type: "CompanyProfileByUser", id: result?.user_id },
                { type: "CompanyProfile", id: "LIST" },
            ],
        }),

        // Generic endpoints based on user role (will be deprecated)
        getProfile: builder.query({
            query: (id) => `/api/admin/profile/${id}`,
            providesTags: (result, error, id) => [{ type: "Profile", id }],
            keepUnusedDataFor: 0,
        }),
        getProfileByUserId: builder.query({
            query: (userId) => `/api/admin/profile/${userId}`,
            providesTags: (result, error, userId) => [
                { type: "ProfileByUser", id: userId },
            ],
            keepUnusedDataFor: 0,
        }),
        updateProfile: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/profile/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Profile", id },
                { type: "ProfileByUser", id: result?.user_id },
            ],
        }),
    }),
});

export const {
    useGetAdminProfileQuery,
    useGetAdminProfileByUserIdQuery,
    useUpdateAdminProfileMutation,
    useGetCompanyProfileQuery,
    useGetCompanyProfileByUserIdQuery,
    useUpdateCompanyProfileMutation,
    // Legacy exports
    useGetProfileQuery,
    useGetProfileByUserIdQuery,
    useUpdateProfileMutation,
} = profileApiSlice;
