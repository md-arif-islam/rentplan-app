import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

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

const Orders = lazy(() => import("./pages/orders/orders"));
const OrdersShow = lazy(() => import("./pages/orders/orders-show"));
const OrdersCreate = lazy(() => import("./pages/orders/orders-create"));
const OrdersEdit = lazy(() => import("./pages/orders/orders-edit"));

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

    // Wrap lazy-loaded components with ErrorBoundary
    const wrapWithErrorBoundary = (Component) => (
        <ErrorBoundary>
            <Suspense
                fallback={
                    <div className="flex justify-center items-center h-screen">
                        Loading...
                    </div>
                }
            >
                <Component />
            </Suspense>
        </ErrorBoundary>
    );

    return (
        <main className="App relative">
            <Routes>
                {/* Auth routes */}
                <Route path="/" element={<AuthLayout />}>
                    <Route index element={<Navigate to="/login" />} />
                    <Route
                        path="login"
                        element={wrapWithErrorBoundary(Login)}
                    />
                    <Route
                        path="forgot-password"
                        element={wrapWithErrorBoundary(ForgotPass)}
                    />
                    <Route
                        path="reset-password"
                        element={wrapWithErrorBoundary(ResetPassword)}
                    />
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
                    <Route
                        path="dashboard"
                        element={wrapWithErrorBoundary(AdminDashboard)}
                    />
                    <Route
                        path="profile"
                        element={wrapWithErrorBoundary(Profile)}
                    />
                    <Route
                        path="profile/:id/edit"
                        element={wrapWithErrorBoundary(ProfileEdit)}
                    />

                    <Route
                        path="companies"
                        element={wrapWithErrorBoundary(Companies)}
                    />
                    <Route
                        path="companies/create"
                        element={wrapWithErrorBoundary(CompaniesCreate)}
                    />
                    <Route
                        path="companies/:id"
                        element={wrapWithErrorBoundary(CompaniesShow)}
                    />
                    <Route
                        path="companies/:id/edit"
                        element={wrapWithErrorBoundary(CompaniesEdit)}
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
                    <Route
                        path="dashboard"
                        element={wrapWithErrorBoundary(CompanyDashboard)}
                    />
                    <Route
                        path="profile"
                        element={wrapWithErrorBoundary(Profile)}
                    />
                    <Route
                        path="profile/:id/edit"
                        element={wrapWithErrorBoundary(ProfileEdit)}
                    />

                    {/* User management routes */}
                    <Route
                        path="users"
                        element={wrapWithErrorBoundary(Users)}
                    />
                    <Route
                        path="users/create"
                        element={wrapWithErrorBoundary(UsersCreate)}
                    />
                    <Route
                        path="users/:id"
                        element={wrapWithErrorBoundary(UsersShow)}
                    />
                    <Route
                        path="users/:id/edit"
                        element={wrapWithErrorBoundary(UsersEdit)}
                    />

                    {/* Customer management routes */}
                    <Route
                        path="customers"
                        element={wrapWithErrorBoundary(Customers)}
                    />
                    <Route
                        path="customers/create"
                        element={wrapWithErrorBoundary(CustomersCreate)}
                    />
                    <Route
                        path="customers/:id"
                        element={wrapWithErrorBoundary(CustomersShow)}
                    />
                    <Route
                        path="customers/:id/edit"
                        element={wrapWithErrorBoundary(CustomersEdit)}
                    />

                    {/* Product management routes */}
                    <Route
                        path="products"
                        element={wrapWithErrorBoundary(Products)}
                    />
                    <Route
                        path="products/create"
                        element={wrapWithErrorBoundary(ProductsCreate)}
                    />
                    <Route
                        path="products/:id"
                        element={wrapWithErrorBoundary(ProductsShow)}
                    />
                    <Route
                        path="products/:id/edit"
                        element={wrapWithErrorBoundary(ProductsEdit)}
                    />

                    {/* Order management routes */}
                    <Route
                        path="orders"
                        element={wrapWithErrorBoundary(Orders)}
                    />
                    <Route
                        path="orders/create"
                        element={wrapWithErrorBoundary(OrdersCreate)}
                    />
                    <Route
                        path="orders/:id"
                        element={wrapWithErrorBoundary(OrdersShow)}
                    />
                    <Route
                        path="orders/:id/edit"
                        element={wrapWithErrorBoundary(OrdersEdit)}
                    />

                    <Route path="*" element={<Navigate to="/404" />} />
                </Route>

                <Route path="/404" element={wrapWithErrorBoundary(Error)} />
                <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
        </main>
    );
}

export default App;
