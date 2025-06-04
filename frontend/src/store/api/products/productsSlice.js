import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: null,
        product: null,
    },
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setProduct: (state, action) => {
            state.product = action.payload;
        },
        clearProduct: (state) => {
            state.product = null;
        },
    },
});

export const { setProducts, setProduct, clearProduct } = productsSlice.actions;
export default productsSlice.reducer;
