import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: null,
        user: null,
    },
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export const { setUsers, setUser, clearUser } = usersSlice.actions;
export default usersSlice.reducer;
