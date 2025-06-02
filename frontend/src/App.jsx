import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Login = lazy(() => import("./pages/auth/login"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const Profile = lazy(() => import("./pages/profile/profile"));
const ProfileEdit = lazy(() => import("./pages/profile/profile-edit"));
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

                    <Route path="*" element={<Navigate to="/404" />} />
                    {/* 404 */}
                </Route>
                <Route path="/404" element={<Error />} />
            </Routes>
        </main>
    );
}

export default App;
