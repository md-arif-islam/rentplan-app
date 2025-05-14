import { apiSlice } from "../apiSlice";

export const profileApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: (id) => `/api/admin/profile/${id}`,
            providesTags: (result, error, id) => [
                { type: "Profile", id },
                { type: "Profile", id: "LIST" },
            ],
            keepUnusedDataFor: 0, // added
        }),
        getProfileByUserId: builder.query({
            query: (userId) => `/api/admin/profile/user/${userId}`,
            providesTags: (result, error, userId) => [
                { type: "Profile", id: userId },
                { type: "ProfileByUser", id: userId },
                { type: "Profile", id: "LIST" },
            ],
            keepUnusedDataFor: 0, // added
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
                { type: "Profile", id: "LIST" },
            ],
            keepUnusedDataFor: 0, // added
        }),
    }),
});

export const {
    useGetProfileQuery,
    useGetProfileByUserIdQuery,
    useUpdateProfileMutation,
} = profileApiSlice;
