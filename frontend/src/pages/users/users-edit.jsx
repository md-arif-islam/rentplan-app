import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import {
    useGetCompanyUserQuery,
    useUpdateCompanyUserMutation,
} from "@/store/api/users/usersApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
        .nullable()
        .transform((value) => (value ? value : null))
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

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const {
        data: user,
        isLoading: userLoading,
        isError,
        error,
    } = useGetCompanyUserQuery(id);
    const [updateUser, { isLoading: isUpdating }] =
        useUpdateCompanyUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            name: "",
            phone: "",
            avatar: null,
        },
    });

    // Initialize form with user data when available
    useEffect(() => {
        if (user) {
            console.log("User data loaded:", user); // Debug log

            // Reset the form with values from the API
            reset({
                email: user.email || "",
                password: "", // Don't populate password for security
                name: user.user_profile?.name || "", // Check both possible paths
                phone: user.user_profile?.phone || "",
                avatar: user.user_profile?.avatar || null,
            });
        }
    }, [user, reset]);

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
            console.log("Submitting form with data:", formData); // Debug log

            // Keep the user's existing role_id
            const dataToSubmit = {
                ...formData,
                role_id: user.role_id,
                id,
            };

            await updateUser(dataToSubmit).unwrap();
            toast.success("User updated successfully");
            navigate("/company/users");
        } catch (error) {
            console.error("Update failed", error);

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
                toast.error(error?.data?.message || "Failed to update user");
            }
        }
    };

    // Determine avatar preview source
    const avatarValue = watch("avatar");
    const avatarPreview = avatarValue
        ? typeof avatarValue === "string" && avatarValue.startsWith("data:")
            ? avatarValue
            : `${import.meta.env.VITE_API_URL}/${avatarValue}`
        : null;

    // Get current form values for default values
    const currentValues = watch();

    if (userLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <Icon
                        icon="heroicons-outline:exclamation-circle"
                        className="text-danger-500 text-4xl mb-2"
                    />
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load user information"}
                    </p>
                    <Button
                        text="Back to Users"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/company/users")}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit User
                </h4>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/users")}
                    />
                    <Button
                        icon="heroicons-outline:eye"
                        text="View Details"
                        className="btn-outline-dark"
                        onClick={() => navigate(`/company/users/${id}`)}
                    />
                </div>
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
                            defaultValue={currentValues.name} // Add the defaultValue
                        />
                        <Textinput
                            label="Email *"
                            type="email"
                            placeholder="Enter email address"
                            register={register}
                            name="email"
                            error={errors.email}
                            defaultValue={currentValues.email} // Add the defaultValue
                        />
                        <Textinput
                            label="Password"
                            type="password"
                            placeholder="Leave blank to keep current password"
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
                            defaultValue={currentValues.phone} // Add the defaultValue
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
                                text="Change Picture"
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
                        icon="heroicons-outline:save"
                        text="Update User"
                        className="btn-dark"
                        isLoading={isUpdating || isSubmitting}
                        disabled={isUpdating || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default UserEdit;
