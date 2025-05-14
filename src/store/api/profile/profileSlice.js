import { createSlice } from "@reduxjs/toolkit";

const storedProfile = JSON.parse(localStorage.getItem("profile"));

export const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: storedProfile || null,
    },
    reducers: {
        setProfile: (state, action) => {
            state.profile = action.payload;
            localStorage.setItem("profile", JSON.stringify(action.payload));
        },
        clearProfile: (state) => {
            state.profile = null;
            localStorage.removeItem("profile");
        },
    },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
