import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import useDarkMode from "@/hooks/useDarkMode";
import { useResetPasswordMutation } from "@/store/api/auth/authApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import LeftImage from "./common/left-image";

const schema = yup
    .object({
        password: yup
            .string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
        password_confirmation: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match")
            .required("Confirm password is required"),
    })
    .required();

const ResetPassword = () => {
    const [isDark] = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get("token");
        const emailParam = queryParams.get("email");

        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(decodeURIComponent(emailParam));

        if (!tokenParam || !emailParam) {
            toast.error("Invalid reset password link");
            navigate("/forgot-password");
        }
    }, [location, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const onSubmit = async (data) => {
        try {
            const resetData = {
                token: token,
                email: email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            };

            const response = await resetPassword(resetData).unwrap();
            toast.success(
                response.message || "Password has been reset successfully"
            );
            navigate("/login");
        } catch (error) {
            toast.error(
                error?.data?.error ||
                    "Failed to reset password. Please try again."
            );
        }
    };

    useEffect(() => {
        document.title = "Reset Password | Rentplan";
    }, []);

    return (
        <div className="loginwrapper flex items-center justify-center min-h-screen">
            <div className="lg-inner-column w-[95%] md:w-[80%] max-h-[600px] h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-[16px]">
                <LeftImage />
                <div className="right-column relative">
                    <div className="inner-content h-full flex flex-col">
                        <div className="auth-box h-full flex flex-col justify-center">
                            <div className="mobile-logo text-center mb-6 lg:hidden block">
                                <Link to="/">
                                    <h1 className="text-3xl font-bold italic flex items-center justify-center h-full">
                                        Rentplan
                                        <span className="text-[#FF4847]">
                                            .
                                        </span>
                                    </h1>
                                </Link>
                            </div>
                            <div className="text-center 2xl:mb-10 mb-4">
                                <h4 className="font-medium">
                                    Reset Your Password
                                </h4>
                                <div className="text-slate-500 text-base">
                                    Enter your new password below
                                </div>
                            </div>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <Textinput
                                    name="password"
                                    label="New Password"
                                    type="password"
                                    placeholder="Enter your new password"
                                    register={register}
                                    error={errors.password}
                                    className="h-[48px]"
                                    hasicon={true}
                                />
                                <Textinput
                                    name="password_confirmation"
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    register={register}
                                    error={errors.password_confirmation}
                                    className="h-[48px]"
                                    hasicon={true}
                                />
                                <Button
                                    type="submit"
                                    text="Reset Password"
                                    className="btn btn-dark block w-full text-center"
                                    isLoading={isLoading}
                                />
                            </form>
                            <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-12 mt-8 uppercase text-sm">
                                <Link
                                    to="/"
                                    className="text-slate-900 dark:text-white font-medium hover:underline"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                        <div className="auth-footer text-center">
                            &copy; Rentplan {new Date().getFullYear()}, All
                            Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
