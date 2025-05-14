import { createSlice } from "@reduxjs/toolkit";

const holdersTaxesSlice = createSlice({
    name: "holdersTaxes",
    initialState: {
        holdersTaxes: null,
        selectedTax: null,
        filters: {
            isDeductible: null,
            percentageThreshold: null,
            countryId: null,
        },
        loading: false,
        error: null,
    },
    reducers: {
        setHoldersTaxes: (state, action) => {
            state.holdersTaxes = action.payload;
        },
        setSelectedTax: (state, action) => {
            state.selectedTax = action.payload;
        },
        setDeductibleFilter: (state, action) => {
            state.filters.isDeductible = action.payload;
        },
        setPercentageThreshold: (state, action) => {
            state.filters.percentageThreshold = action.payload;
        },
        setCountryFilter: (state, action) => {
            state.filters.countryId = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                isDeductible: null,
                percentageThreshold: null,
                countryId: null,
            };
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setHoldersTaxes,
    setSelectedTax,
    setDeductibleFilter,
    setPercentageThreshold,
    setCountryFilter,
    clearFilters,
    setLoading,
    setError,
} = holdersTaxesSlice.actions;
export default holdersTaxesSlice.reducer;
