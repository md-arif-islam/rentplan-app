import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import { useCreateCompanyUserMutation } from "@/store/api/users/usersApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    email: yup
        .string()
        .required("Email is required")
        .email("Please enter a valid email address")
        .max(255, "Email cannot exceed 255 characters"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    name: yup
        .string()
        .required("Name is required")
        .max(255, "Name cannot exceed 255 characters"),
    phone: yup
        .string()
        .nullable()
        .max(20, "Phone number cannot exceed 20 characters"),
});

const UserCreate = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [createUser, { isLoading }] = useCreateCompanyUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            name: "",
            phone: "",
            avatar: null,
            // Role ID will be automatically assigned in the backend
        },
    });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue("avatar", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const onSubmit = async (formData) => {
        try {
            // Add role_id automatically - assuming the backend knows the company_admin role ID
            const dataToSubmit = {
                ...formData,
                role_id: "company_admin", // Backend will resolve this to the actual role ID
            };

            await createUser(dataToSubmit).unwrap();
            toast.success("User created successfully");
            navigate("/company/users");
        } catch (error) {
            console.error("Create failed", error);

            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        setError(field, {
                            type: "manual",
                            message: messages[0],
                        });
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to create user");
            }
        }
    };

    const avatarPreview = watch("avatar");

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Create New User
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/users")}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="User Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Full Name *"
                            type="text"
                            placeholder="Enter full name"
                            register={register}
                            name="name"
                            error={errors.name}
                        />
                        <Textinput
                            label="Email *"
                            type="email"
                            placeholder="Enter email address"
                            register={register}
                            name="email"
                            error={errors.email}
                        />
                        <Textinput
                            label="Password *"
                            type="password"
                            placeholder="Enter password"
                            register={register}
                            name="password"
                            error={errors.password}
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone number"
                            register={register}
                            name="phone"
                            error={errors.phone}
                        />
                    </div>
                </Card>

                <Card title="Profile Picture" className="mt-5">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div>
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                                    <Icon
                                        icon="heroicons-outline:user"
                                        className="text-3xl text-slate-400"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <Button
                                text="Upload Picture"
                                icon="heroicons-outline:upload"
                                className="btn-outline-dark"
                                onClick={handleFileUploadClick}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Supported formats: JPG, PNG, GIF (Max size: 2MB)
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/users")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:plus"
                        text="Create User"
                        className="btn-dark"
                        isLoading={isLoading || isSubmitting}
                        disabled={isLoading || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default UserCreate;
