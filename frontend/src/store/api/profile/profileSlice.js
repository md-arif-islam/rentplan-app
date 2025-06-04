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
        userRole: null, // Add user role to determine which endpoint to use
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
            // Only update if profile exists
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };

                // Also update the user_profile or userProfile property if it exists
                if (state.profile.user_profile) {
                    state.profile.user_profile = {
                        ...state.profile.user_profile,
                        ...action.payload,
                    };
                }
                if (state.profile.userProfile) {
                    state.profile.userProfile = {
                        ...state.profile.userProfile,
                        ...action.payload,
                    };
                }

                try {
                    localStorage.setItem(
                        "profile",
                        JSON.stringify(state.profile)
                    );
                } catch (error) {
                    console.error(
                        "Error updating profile in localStorage:",
                        error
                    );
                }
            }
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
        clearProfile: (state) => {
            state.profile = null;
            state.userRole = null;
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

export const { setProfile, updateProfile, clearProfile, setUserRole } =
    profileSlice.actions;
export default profileSlice.reducer;
