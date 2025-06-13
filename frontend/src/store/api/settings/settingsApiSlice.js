import { apiSlice } from "../apiSlice";

export const settingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => `/api/admin/settings`,
            providesTags: ["Settings"],
            keepUnusedDataFor: 0,
        }),
        getSettingsMap: builder.query({
            query: () => `/api/admin/settings/map`,
            providesTags: ["Settings"],
            keepUnusedDataFor: 0,
        }),
        getSetting: builder.query({
            query: (key) => `/api/admin/settings/${key}`,
            providesTags: (result, error, key) => [
                { type: "Settings", id: key },
            ],
            keepUnusedDataFor: 0,
        }),
        createSetting: builder.mutation({
            query: (data) => ({
                url: `/api/admin/settings`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Settings"],
        }),
        updateSetting: builder.mutation({
            query: ({ key, data }) => ({
                url: `/api/admin/settings/${key}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { key }) => [
                { type: "Settings", id: key },
                "Settings",
            ],
        }),
        deleteSetting: builder.mutation({
            query: (key) => ({
                url: `/api/admin/settings/${key}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Settings"],
        }),
        // For company users (read-only)
        getCompanySettingsMap: builder.query({
            query: () => `/api/company/settings`,
            providesTags: ["Settings"],
            keepUnusedDataFor: 0,
        }),
        getCompanySetting: builder.query({
            query: (key) => `/api/company/settings/${key}`,
            providesTags: (result, error, key) => [
                { type: "Settings", id: key },
            ],
            keepUnusedDataFor: 0,
        }),
    }),
});

export const {
    useGetSettingsQuery,
    useGetSettingsMapQuery,
    useGetSettingQuery,
    useCreateSettingMutation,
    useUpdateSettingMutation,
    useDeleteSettingMutation,
    useGetCompanySettingsMapQuery,
    useGetCompanySettingQuery,
} = settingsApiSlice;
