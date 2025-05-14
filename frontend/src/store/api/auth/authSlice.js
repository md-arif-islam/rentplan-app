import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user"));
const storedToken = localStorage.getItem("authToken"); // Fixed JSON.parse for token

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: storedUser || null,
        token: storedToken || null,
        isAuth: !!storedToken,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuth = true;
            localStorage.setItem("user", JSON.stringify(action.payload.user)); // Added missing localStorage update
            localStorage.setItem("authToken", action.payload.token); // Added missing localStorage update
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.isAuth = false;
            // Clear localStorage tokens on logout
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
        },
    },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
