import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        setting: null,
        settingsMap: {},
    },
    reducers: {
        setSetting: (state, action) => {
            state.setting = action.payload;
        },
        setSettingsMap: (state, action) => {
            state.settingsMap = action.payload;
        },
        resetSettings: (state) => {
            state.setting = null;
            state.settingsMap = {};
        },
    },
});

export const { setSetting, setSettingsMap, resetSettings } =
    settingsSlice.actions;
export default settingsSlice.reducer;
