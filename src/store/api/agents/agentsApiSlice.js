import { apiSlice } from "../apiSlice";

export const agentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAgents: builder.query({
            query: ({ page = 1, perPage = 10, search = "" } = {}) => {
                let url = `/api/admin/agents?page=${page}&perPage=${perPage}&search=${search}`;
                return url;
            },
            providesTags: ["Agents"],
            keepUnusedDataFor: 0, // added
        }),
        getAgent: builder.query({
            query: (id) => `/api/admin/agents/${id}`,
            providesTags: (result, error, id) => [{ type: "Agents", id }],
            keepUnusedDataFor: 0, // added
        }),
        getAgentEditData: builder.query({
            query: (id) => `/api/admin/agents/${id}/edit`,
            providesTags: (result, error, id) => [{ type: "Agents", id }],
            keepUnusedDataFor: 0, // added
        }),
        createAgent: builder.mutation({
            query: (data) => ({
                url: `/api/admin/agents`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Agents"],
        }),
        updateAgent: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/admin/agents/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Agents", id },
                "Agents",
            ],
        }),
        deleteAgent: builder.mutation({
            query: (id) => ({
                url: `/api/admin/agents/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Agents"],
        }),
    }),
});

export const {
    useGetAgentsQuery,
    useGetAgentQuery,
    useGetAgentEditDataQuery,
    useCreateAgentMutation,
    useUpdateAgentMutation,
    useDeleteAgentMutation,
} = agentsApiSlice;
