import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            // Use a custom queryFn to chain the CSRF call and then the login call.
            async queryFn(credentials, queryApi, extraOptions, baseQuery) {
                // Call the CSRF endpoint first.
                const csrfResponse = await baseQuery({
                    url: "/sanctum/csrf-cookie",
                    method: "GET",
                });
                if (csrfResponse.error) {
                    return { error: csrfResponse.error };
                }
                // Then perform the login request.
                const loginResponse = await baseQuery({
                    url: "/api/login",
                    method: "POST",
                    body: credentials,
                });

                return loginResponse;
            },
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: "/admin/register",
                method: "POST",
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/api/logout",
                method: "POST",
            }),
        }),
        getUser: builder.query({
            // This query is used to verify the authentication status.
            // A 401 error indicates the token is expired.
            query: () => "/api/user",
            keepUnusedDataFor: 0, // force fresh data on mount
        }),
        resetPassword: builder.mutation({
            query: (resetData) => ({
                url: "/api/reset-password",
                method: "POST",
                body: resetData,
            }),
        }),
        sendResetLink: builder.mutation({
            query: (email) => ({
                url: "/api/send-reset-link-email",
                method: "POST",
                body: email,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetUserQuery,
    useResetPasswordMutation,
    useSendResetLinkMutation,
} = authApiSlice;
