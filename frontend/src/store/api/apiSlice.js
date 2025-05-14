import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create the base query with error handling
const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        headers.set("Accept", "application/json");
        const token = getState().auth.token;
        if (token) {
            // Remove quotes if they were saved in the token
            const cleanToken = token.replace(/^"|"$/g, "");
            headers.set("authorization", `Bearer ${cleanToken}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) => ({}),
});
