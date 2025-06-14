import agents from "./api/agents/agentsSlice";
import auth from "./api/auth/authSlice";
import breeders from "./api/breeders/breedersSlice";
import countries from "./api/countries/countriesSlice";
import customers from "./api/customers/customersSlice";
import holdersTaxes from "./api/holdersTaxes/holdersTaxesSlice";
import orders from "./api/orders/ordersSlice";
import products from "./api/products/productsSlice";
import profile from "./api/profile/profileSlice";
import settings from "./api/settings/settingsSlice";
import users from "./api/users/usersSlice";
import layout from "./layout";

const rootReducer = {
    layout,
    auth,
    countries,
    holdersTaxes,
    agents,
    breeders,
    customers,
    profile,
    users,
    products,
    orders,
    settings,
};

export default rootReducer;
