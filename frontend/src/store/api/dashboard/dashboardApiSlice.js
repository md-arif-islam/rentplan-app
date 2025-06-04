import { apiSlice } from "../apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboardStats: builder.query({
            query: () => `/api/admin/dashboard`,
            providesTags: ["Dashboard"],
            keepUnusedDataFor: 0,
        }),
        getCompanyDashboardStats: builder.query({
            query: () => `/api/company/dashboard`,
            providesTags: ["CompanyDashboard"],
            keepUnusedDataFor: 0,
        }),
    }),
});

export const {
    useGetAdminDashboardStatsQuery,
    useGetCompanyDashboardStatsQuery,
} = dashboardApiSlice;
