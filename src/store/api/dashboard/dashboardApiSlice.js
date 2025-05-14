import { apiSlice } from "../apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboard: builder.query({
            query: () => `/api/admin/dashboard`,
            providesTags: ["Dashboard"],
            keepUnusedDataFor: 0, // added
        }),
    }),
});

export const { useGetDashboardQuery } = dashboardApiSlice;
