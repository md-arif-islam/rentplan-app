import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Login = lazy(() => import("./pages/auth/login"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const Profile = lazy(() => import("./pages/profile/profile"));
const ProfileEdit = lazy(() => import("./pages/profile/profile-edit"));
const HoldersTaxes = lazy(() => import("./pages/settings/holders-taxes"));
const HoldersTaxesCreate = lazy(() =>
    import("./pages/settings/holders-taxes-create")
);
const HoldersTaxesEdit = lazy(() =>
    import("./pages/settings/holders-taxes-edit")
);
const Agents = lazy(() => import("./pages/settings/agents"));
const AgentsCreate = lazy(() => import("./pages/settings/agents-create"));
const AgentsEdit = lazy(() => import("./pages/settings/agents-edit"));

const Breeders = lazy(() => import("./pages/breeders/breeders"));
const BreedersCreate = lazy(() => import("./pages/breeders/breeders-create"));
const BreedersEdit = lazy(() => import("./pages/breeders/breeders-edit"));
const BreederShow = lazy(() => import("./pages/breeders/breeders-show"));

const Customers = lazy(() => import("./pages/customers/customers"));
const CustomersCreate = lazy(() =>
    import("./pages/customers/customers-create")
);
const CustomersEdit = lazy(() => import("./pages/customers/customers-edit"));
const CustomerShow = lazy(() => import("./pages/customers/customers-show"));

const Error = lazy(() => import("./pages/404"));

import AuthLayout from "./layout/AuthLayout";
import Layout from "./layout/Layout";

function App() {
    return (
        <main className="App  relative">
            <Routes>
                <Route path="/" element={<AuthLayout />}>
                    <Route index element={<Navigate to="/login" />} />
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPass />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                </Route>
                <Route path="/admin" element={<Layout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/:id/edit" element={<ProfileEdit />} />

                    <Route path="holders-taxes" element={<HoldersTaxes />} />
                    <Route
                        path="holders-taxes/create"
                        element={<HoldersTaxesCreate />}
                    />

                    <Route
                        path="holders-taxes/:id/edit"
                        element={<HoldersTaxesEdit />}
                    />
                    {/* Agents */}
                    <Route path="agents" element={<Agents />} />
                    <Route path="agents/create" element={<AgentsCreate />} />
                    <Route path="agents/:id/edit" element={<AgentsEdit />} />
                    {/* Breeders */}
                    <Route path="breeders" element={<Breeders />} />
                    <Route
                        path="breeders/create"
                        element={<BreedersCreate />}
                    />
                    <Route path="breeders/:id" element={<BreederShow />} />
                    <Route
                        path="breeders/:id/edit"
                        element={<BreedersEdit />}
                    />

                    {/* Customers */}
                    <Route path="customers" element={<Customers />} />
                    <Route
                        path="customers/create"
                        element={<CustomersCreate />}
                    />
                    <Route path="customers/:id" element={<CustomerShow />} />
                    <Route
                        path="customers/:id/edit"
                        element={<CustomersEdit />}
                    />

                    <Route path="*" element={<Navigate to="/404" />} />
                    {/* 404 */}
                </Route>
                <Route path="/404" element={<Error />} />
            </Routes>
        </main>
    );
}

export default App;
