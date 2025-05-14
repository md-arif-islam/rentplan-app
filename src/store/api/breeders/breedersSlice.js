import { createSlice } from "@reduxjs/toolkit";

const breedersSlice = createSlice({
    name: "breeders",
    initialState: {
        breeders: null,
        breeder: null,
    },
    reducers: {
        setBreeders: (state, action) => {
            state.breeders = action.payload;
        },
        setBreeder: (state, action) => {
            state.breeder = action.payload;
        },
    },
});

export const { setBreeders, setBreeder } = breedersSlice.actions;
export default breedersSlice.reducer;
