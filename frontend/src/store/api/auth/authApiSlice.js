import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            async queryFn(credentials, queryApi, extraOptions, baseQuery) {
                try {
                    // Get CSRF token
                    const csrfResponse = await baseQuery({
                        url: "/sanctum/csrf-cookie",
                        method: "GET",
                    });

                    if (csrfResponse.error) {
                        return { error: csrfResponse.error };
                    }

                    // Perform login
                    const loginResponse = await baseQuery({
                        url: "/api/login",
                        method: "POST",
                        body: credentials,
                    });

                    return loginResponse;
                } catch (error) {
                    return {
                        error: { status: "CUSTOM_ERROR", error: error.message },
                    };
                }
            },
            invalidatesTags: ["Auth", "User", "Profile"],
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
            invalidatesTags: ["Auth", "User", "Profile"],
            async onQueryStarted(_, { dispatch }) {
                // Optimistically update the state
                dispatch({ type: "auth/logOut" });
            },
        }),
        getUser: builder.query({
            query: () => "/api/user",
            providesTags: ["User"],
            keepUnusedDataFor: 0,
            // Add error handling
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    if (error.error.status === 401) {
                        dispatch({ type: "auth/logOut" });
                    }
                }
            },
        }),
        resetPassword: builder.mutation({
            query: (resetData) => ({
                url: "/api/reset-password",
                method: "POST",
                body: resetData,
            }),
            invalidatesTags: ["Auth"],
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
