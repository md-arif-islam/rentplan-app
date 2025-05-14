import useDarkMode from "@/hooks/useDarkMode";
import { useEffect } from "react";
import AuthLayout from "./AuthLayout";
import LoginForm from "./common/login-form";

const Login = () => {
    const [isDark] = useDarkMode();

    useEffect(() => {
        document.title = "Sign in | Rentplan";
    }, []);

    return (
        <AuthLayout title="Sign in" subtitle="Sign in to your account">
            <LoginForm />
        </AuthLayout>
    );
};

export default Login;
