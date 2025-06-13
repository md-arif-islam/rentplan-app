import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom error handling
const customBaseQuery = async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
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
    })(args, api, extraOptions);

    // Handle specific error cases
    if (result.error) {
        // Log the error for debugging
        console.error("API Error:", {
            status: result.error.status,
            data: result.error.data,
            endpoint: args.url,
        });

        if (result.error.status === 401) {
            // Handle unauthorized access
            api.dispatch({ type: "auth/logOut" });
            return {
                error: {
                    status: 401,
                    data: {
                        message:
                            "Your session has expired. Please log in again.",
                    },
                },
            };
        }

        if (result.error.status === 403) {
            // Handle forbidden access
            return {
                error: {
                    status: 403,
                    data: {
                        message:
                            "You do not have permission to perform this action.",
                    },
                },
            };
        }

        if (result.error.status === 404) {
            return {
                error: {
                    status: 404,
                    data: { message: "The requested resource was not found." },
                },
            };
        }

        if (result.error.status === 422) {
            // Handle validation errors
            return {
                error: {
                    status: 422,
                    data: result.error.data,
                },
            };
        }

        if (result.error.status === 500) {
            return {
                error: {
                    status: 500,
                    data: {
                        message:
                            "An unexpected error occurred. Please try again later.",
                    },
                },
            };
        }

        // Handle network errors
        if (result.error.status === "FETCH_ERROR") {
            return {
                error: {
                    status: "FETCH_ERROR",
                    data: {
                        message:
                            "Network error. Please check your connection and try again.",
                    },
                },
            };
        }

        // Handle parsing errors
        if (result.error.status === "PARSING_ERROR") {
            return {
                error: {
                    status: "PARSING_ERROR",
                    data: {
                        message:
                            "Error parsing server response. Please try again.",
                    },
                },
            };
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: customBaseQuery,
    tagTypes: [
        "User",
        "Profile",
        "Auth",
        "BreederPlants",
        "PlantBreeders",
        "Settings",
        "Products",
    ],
    endpoints: () => ({}),
    // Add global configuration
    keepUnusedDataFor: 300, // 5 minutes
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
});
