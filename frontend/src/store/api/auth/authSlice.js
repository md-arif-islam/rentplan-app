import { createSlice } from "@reduxjs/toolkit";

// Initialize state from localStorage
const getInitialState = () => {
    try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("authToken");

        return {
            user: storedUser ? JSON.parse(storedUser) : null,
            token: storedToken || null,
            isAuth: !!storedToken,
            error: null,
            loading: false,
        };
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return {
            user: null,
            token: null,
            isAuth: false,
            error: null,
            loading: false,
        };
    }
};

export const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        setUser: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuth = true;
            state.error = null;
            state.loading = false;

            try {
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("authToken", token);
            } catch (error) {
                console.error("Failed to store auth data:", error);
            }
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.isAuth = false;
            state.error = null;
            state.loading = false;

            try {
                localStorage.removeItem("user");
                localStorage.removeItem("authToken");
            } catch (error) {
                console.error("Failed to clear auth data:", error);
            }
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setUser, logOut, setError, setLoading } = authSlice.actions;
export default authSlice.reducer;
