import { lazy, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const CompanyDashboard = lazy(() =>
    import("./pages/dashboard/CompanyDashboard")
);
const Login = lazy(() => import("./pages/auth/login"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const Profile = lazy(() => import("./pages/profile/profile"));
const ProfileEdit = lazy(() => import("./pages/profile/profile-edit"));

const Companies = lazy(() => import("./pages/companies/companies"));
const CompaniesShow = lazy(() => import("./pages/companies/companies-show"));
const CompaniesCreate = lazy(() =>
    import("./pages/companies/companies-create")
);
const CompaniesEdit = lazy(() => import("./pages/companies/companies-edit"));

const Users = lazy(() => import("./pages/users/users"));
const UsersShow = lazy(() => import("./pages/users/users-show"));
const UsersCreate = lazy(() => import("./pages/users/users-create"));
const UsersEdit = lazy(() => import("./pages/users/users-edit"));

const Customers = lazy(() => import("./pages/customers/customers"));
const CustomersShow = lazy(() => import("./pages/customers/customers-show"));
const CustomersCreate = lazy(() =>
    import("./pages/customers/customers-create")
);
const CustomersEdit = lazy(() => import("./pages/customers/customers-edit"));

const Products = lazy(() => import("./pages/products/products"));
const ProductsShow = lazy(() => import("./pages/products/products-show"));
const ProductsCreate = lazy(() => import("./pages/products/products-create"));
const ProductsEdit = lazy(() => import("./pages/products/products-edit"));

const Error = lazy(() => import("./pages/404"));

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import AuthLayout from "./layout/AuthLayout";
import CompanyLayout from "./layout/CompanyLayout";

function App() {
    const { isAuth, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect based on role if authenticated
        if (isAuth && user) {
            const role = user.role?.name;

            // If user is on homepage or just logged in
            if (
                window.location.pathname === "/" ||
                window.location.pathname === "/login"
            ) {
                if (role === "super_admin") {
                    navigate("/admin/dashboard");
                } else if (role === "company_admin") {
                    navigate("/company/dashboard");
                }
            }
        }
    }, [isAuth, user, navigate]);

    return (
        <main className="App relative">
            <Routes>
                {/* Auth routes */}
                <Route path="/" element={<AuthLayout />}>
                    <Route index element={<Navigate to="/login" />} />
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPass />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                {/* Super Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            isAllowed={
                                isAuth && user?.role?.name === "super_admin"
                            }
                            redirectPath="/login"
                        >
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/:id/edit" element={<ProfileEdit />} />

                    <Route path="companies" element={<Companies />} />
                    <Route
                        path="companies/create"
                        element={<CompaniesCreate />}
                    />
                    <Route path="companies/:id" element={<CompaniesShow />} />
                    <Route
                        path="companies/:id/edit"
                        element={<CompaniesEdit />}
                    />

                    <Route path="*" element={<Navigate to="/404" />} />
                </Route>

                {/* Company Admin routes */}
                <Route
                    path="/company"
                    element={
                        <ProtectedRoute
                            isAllowed={
                                isAuth && user?.role?.name === "company_admin"
                            }
                            redirectPath="/login"
                        >
                            <CompanyLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<CompanyDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/:id/edit" element={<ProfileEdit />} />

                    {/* User management routes */}
                    <Route path="users" element={<Users />} />
                    <Route path="users/create" element={<UsersCreate />} />
                    <Route path="users/:id" element={<UsersShow />} />
                    <Route path="users/:id/edit" element={<UsersEdit />} />

                    {/* Customer management routes */}
                    <Route path="customers" element={<Customers />} />
                    <Route
                        path="customers/create"
                        element={<CustomersCreate />}
                    />
                    <Route path="customers/:id" element={<CustomersShow />} />
                    <Route
                        path="customers/:id/edit"
                        element={<CustomersEdit />}
                    />

                    {/* Product management routes */}
                    <Route path="products" element={<Products />} />
                    <Route
                        path="products/create"
                        element={<ProductsCreate />}
                    />
                    <Route path="products/:id" element={<ProductsShow />} />
                    <Route
                        path="products/:id/edit"
                        element={<ProductsEdit />}
                    />

                    <Route path="*" element={<Navigate to="/404" />} />
                </Route>

                <Route path="/404" element={<Error />} />
                <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
        </main>
    );
}

export default App;
