import { createSlice } from "@reduxjs/toolkit";

const ordersSlice = createSlice({
    name: "orders",
    initialState: {
        orders: null,
        order: null,
    },
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        setOrder: (state, action) => {
            state.order = action.payload;
        },
        clearOrder: (state) => {
            state.order = null;
        },
    },
});

export const { setOrders, setOrder, clearOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
