import agents from "./api/agents/agentsSlice";
import auth from "./api/auth/authSlice";
import breeders from "./api/breeders/breedersSlice";
import customers from "./api/companies/companiesSlice";
import countries from "./api/countries/countriesSlice";
import holdersTaxes from "./api/holdersTaxes/holdersTaxesSlice";
import profile from "./api/profile/profileSlice";
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
};

export default rootReducer;
