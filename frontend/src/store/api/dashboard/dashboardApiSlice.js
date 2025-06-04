import { apiSlice } from "../apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboardStats: builder.query({
            query: () => `/api/admin/dashboard`,
            providesTags: ["Dashboard"],
            keepUnusedDataFor: 60, // Cache for 1 minute
        }),
        getCompanyDashboardStats: builder.query({
            query: () => `/api/company/dashboard`,
            providesTags: ["CompanyDashboard"],
            keepUnusedDataFor: 60, // Cache for 1 minute
        }),
    }),
});

export const {
    useGetAdminDashboardStatsQuery,
    useGetCompanyDashboardStatsQuery,
} = dashboardApiSlice;
