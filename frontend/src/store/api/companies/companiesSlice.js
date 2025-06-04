import { createSlice } from "@reduxjs/toolkit";

const companiesSlice = createSlice({
    name: "companies",
    initialState: {
        companies: null,
        company: null,
    },
    reducers: {
        setCompanies: (state, action) => {
            state.companies = action.payload;
        },
        setCompany: (state, action) => {
            state.company = action.payload;
        },
        clearCompany: (state) => {
            state.company = null;
        },
    },
});

export const { setCompanies, setCompany, clearCompany } =
    companiesSlice.actions;
export default companiesSlice.reducer;
