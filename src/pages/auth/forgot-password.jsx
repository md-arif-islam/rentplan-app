import useDarkMode from "@/hooks/useDarkMode";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import ForgotPass from "./common/forgot-pass";

const ForgotPassword = () => {
    const [isDark] = useDarkMode();

    useEffect(() => {
        document.title = "Forgot Password | Rentplan";
    }, []);

    return (
        <AuthLayout
            title="Forgot Your Password?"
            subtitle="Reset your Password"
        >
            <div className="font-normal text-base text-slate-500 dark:text-slate-400 text-center px-2 bg-slate-100 dark:bg-slate-600 rounded py-3 mb-4 mt-10">
                Enter your Email and an email will be sent to your inbox
            </div>
            <ForgotPass />
            <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-12 mt-8 uppercase text-sm">
                <Link
                    to="/"
                    className="text-slate-900 dark:text-white font-medium hover:underline"
                >
                    Back to Sign In
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
