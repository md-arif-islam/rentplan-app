import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        dashboard: null,
    },
    reducers: {
        setDashboard: (state, action) => {
            state.dashboard = action.payload;
        },
    },
});

export const { setDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
