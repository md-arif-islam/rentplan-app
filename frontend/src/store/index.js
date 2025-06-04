import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import companiesReducer from "./api/companies/companiesSlice";
import rootReducer from "./rootReducer";

const store = configureStore({
    reducer: {
        ...rootReducer,
        companies: companiesReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    //devTools: false,
    middleware: (getDefaultMiddleware) => {
        const middleware = [...getDefaultMiddleware(), apiSlice.middleware];
        return middleware;
    },
});

export default store;
