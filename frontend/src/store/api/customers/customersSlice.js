import { createSlice } from "@reduxjs/toolkit";

const customersSlice = createSlice({
    name: "customers",
    initialState: {
        customers: null,
        customer: null,
    },
    reducers: {
        setCustomers: (state, action) => {
            state.customers = action.payload;
        },
        setCustomer: (state, action) => {
            state.customer = action.payload;
        },
        clearCustomer: (state) => {
            state.customer = null;
        },
    },
});

export const { setCustomers, setCustomer, clearCustomer } =
    customersSlice.actions;
export default customersSlice.reducer;
