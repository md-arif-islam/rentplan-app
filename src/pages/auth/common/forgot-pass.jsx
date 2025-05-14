import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { useSendResetLinkMutation } from "@/store/api/auth/authApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup
    .object({
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is Required"),
    })
    .required();

const ForgotPass = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Get the RTK Query mutation hook for sending the reset link.
    const [sendResetLink, { isLoading }] = useSendResetLinkMutation();

    const onSubmit = async (data) => {
        try {
            // Calling the mutation with the email.
            const response = await sendResetLink({
                email: data.email,
            }).unwrap();
            toast.success(
                response.message || "Password reset link sent successfully"
            );
        } catch (error) {
            toast.error("Password reset link failed to send");
            console.error("Error sending password reset link:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <Textinput
                name="email"
                label="Email"
                type="email"
                register={register}
                error={errors.email}
                className="h-[48px]"
                placeholder="Enter your email"
            />
            <Button
                type="submit"
                text="Send Reset Link"
                className="btn btn-dark block w-full text-center "
                isLoading={isLoading}
            />
        </form>
    );
};

export default ForgotPass;
