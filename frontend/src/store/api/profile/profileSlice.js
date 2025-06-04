import { createSlice } from "@reduxjs/toolkit";

// Get profile from localStorage with error handling
const getStoredProfile = () => {
    try {
        const profileData = localStorage.getItem("profile");
        return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
        console.error("Error parsing profile from localStorage:", error);
        localStorage.removeItem("profile"); // Clear corrupted data
        return null;
    }
};

export const profileSlice = createSlice({
    name: "profile",
    initialState: {
        profile: getStoredProfile(),
    },
    reducers: {
        setProfile: (state, action) => {
            state.profile = action.payload;
            try {
                localStorage.setItem("profile", JSON.stringify(action.payload));
            } catch (error) {
                console.error("Error storing profile to localStorage:", error);
            }
        },
        updateProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload };
            try {
                localStorage.setItem("profile", JSON.stringify(state.profile));
            } catch (error) {
                console.error("Error updating profile in localStorage:", error);
            }
        },
        clearProfile: (state) => {
            state.profile = null;
            try {
                localStorage.removeItem("profile");
            } catch (error) {
                console.error(
                    "Error removing profile from localStorage:",
                    error
                );
            }
        },
    },
});

export const { setProfile, updateProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
