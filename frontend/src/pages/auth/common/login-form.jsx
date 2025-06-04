import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Textinput from "@/components/ui/Textinput";
import { useLoginMutation } from "@/store/api/auth/authApiSlice";
import { setUser } from "@/store/api/auth/authSlice";
import { setProfile } from "@/store/api/profile/profileSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
const schema = yup
    .object({
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is Required"),
        password: yup.string().required("Password is Required"),
    })
    .required();
const LoginForm = () => {
    const [login, { isLoading, isError, error, isSuccess }] =
        useLoginMutation();

    const dispatch = useDispatch();

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),

        mode: "all",
    });
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        try {
            const response = await login(data);

            if (response?.error) {
                console.log("Login error response:", response.error);
                // Use the message from the API response
                throw new Error(response.error.data?.message || "Login failed");
            }

            const userData = response.data.user;

            // Save user data to auth slice
            dispatch(
                setUser({
                    user: userData,
                    token: response.data.token,
                })
            );

            // Save profile data separately
            if (userData.userProfile) {
                dispatch(setProfile(userData.userProfile));
            }

            toast.success("Login Successful");

            // Navigate based on user role
            if (userData.role?.name === "super_admin") {
                navigate("/admin/dashboard");
            } else if (userData.role?.name === "company_admin") {
                navigate("/company/dashboard");
            } else {
                // Default fallback
                navigate("/");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const [checked, setChecked] = useState(true);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <Textinput
                name="email"
                label="email"
                type="email"
                register={register}
                error={errors.email}
                className="h-[48px]"
                placeholder="Enter your email"
            />
            <Textinput
                name="password"
                label="passwrod"
                type="password"
                register={register}
                error={errors.password}
                className="h-[48px]"
                placeholder="Enter your password"
                hasicon={true}
            />
            <div className="flex justify-between">
                <Checkbox
                    value={checked}
                    onChange={() => setChecked(!checked)}
                    label="Keep me signed in"
                />
                <Link
                    to="/forgot-password"
                    className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
                >
                    Forgot Password?{" "}
                </Link>
            </div>

            <Button
                type="submit"
                text="Sign in"
                className="btn btn-dark block w-full text-center "
                isLoading={isLoading}
            />
        </form>
    );
};

export default LoginForm;
