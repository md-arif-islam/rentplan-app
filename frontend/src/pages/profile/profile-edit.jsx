import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";

import {
    useGetAdminProfileQuery,
    useGetCompanyProfileQuery,
    useUpdateAdminProfileMutation,
    useUpdateCompanyProfileMutation,
} from "@/store/api/profile/profileApiSlice";
import { setProfile } from "@/store/api/profile/profileSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get user role to determine which API to use
    const user = useSelector((state) => state.auth.user);
    const userRole = user?.role?.name || "";
    const isAdmin = userRole === "super_admin";
    const isCompanyAdmin = userRole === "company_admin";

    // Use the appropriate query and mutation based on user role
    const {
        data: adminProfile,
        isLoading: adminIsLoading,
        error: adminError,
    } = useGetAdminProfileQuery(id, {
        skip: !isAdmin || !id,
    });

    const {
        data: companyProfile,
        isLoading: companyIsLoading,
        error: companyError,
    } = useGetCompanyProfileQuery(id, {
        skip: !isCompanyAdmin || !id,
    });

    const [updateAdminProfile, { isLoading: isAdminUpdating }] =
        useUpdateAdminProfileMutation();
    const [updateCompanyProfile, { isLoading: isCompanyUpdating }] =
        useUpdateCompanyProfileMutation();

    // Determine the actual profile data, loading and error states
    const profile = isAdmin ? adminProfile : companyProfile;
    const isLoading = isAdmin ? adminIsLoading : companyIsLoading;
    const error = isAdmin ? adminError : companyError;
    const isUpdating = isAdmin ? isAdminUpdating : isCompanyUpdating;

    // Determine route prefix for navigation
    const routePrefix = isAdmin ? "/admin" : "/company";

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        avatar: null,
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        password: "",
        password_confirmation: "",
    });

    // Password validation state
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        if (profile) {
            let first_name = "";
            let last_name = "";
            if (profile.name) {
                const nameParts = profile.name.split(" ");
                first_name = nameParts[0] || "";
                last_name = nameParts.slice(1).join(" ") || "";
            }
            setFormData({
                first_name,
                last_name,
                phone: profile.phone || "",
                avatar: profile.avatar || null,
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });

        // Clear errors when typing
        if (name === "password") setPasswordError(null);
        if (name === "password_confirmation") setConfirmPasswordError(null);
    };

    const validatePassword = () => {
        let isValid = true;

        if (passwordForm.password && passwordForm.password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            isValid = false;
        }

        if (passwordForm.password !== passwordForm.password_confirmation) {
            setConfirmPasswordError("Passwords do not match");
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const name = `${formData.first_name} ${formData.last_name}`.trim();
            const updateData = {
                id,
                name,
                phone: formData.phone,
                avatar: formData.avatar,
            };

            // Add password to update data if provided and valid
            if (passwordForm.password) {
                if (!validatePassword()) {
                    return; // Stop submission if passwords are invalid
                }
                updateData.password = passwordForm.password;
                updateData.password_confirmation =
                    passwordForm.password_confirmation;
            }

            let updatedProfile;

            // Use the appropriate update mutation based on user role
            if (isAdmin) {
                updatedProfile = await updateAdminProfile(updateData).unwrap();
            } else if (isCompanyAdmin) {
                updatedProfile = await updateCompanyProfile(
                    updateData
                ).unwrap();
            }

            dispatch(setProfile(updatedProfile.data || updatedProfile));
            toast.success("Profile updated successfully");
            navigate(`${routePrefix}/profile`);
        } catch (error) {
            console.error("Profile update error:", error);

            if (error?.data?.errors) {
                // Handle validation errors from the API
                const errors = error.data.errors;

                if (errors.password) {
                    setPasswordError(errors.password[0]);
                }
                if (errors.password_confirmation) {
                    setConfirmPasswordError(errors.password_confirmation[0]);
                }
            } else {
                toast.error(error?.data?.message || "Failed to update profile");
            }
        }
    };

    const userAvatar = formData.avatar
        ? typeof formData.avatar === "string"
            ? formData.avatar.startsWith("data:")
                ? formData.avatar // It's a data URL from FileReader
                : `${import.meta.env.VITE_API_URL}/${formData.avatar}` // It's a server path
            : URL.createObjectURL(formData.avatar) // It's a File object
        : null;

    if (isLoading) {
        return (
            <Card>
                <LoadingContent />
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load profile information"}
                    </p>
                    <Button
                        text="Back to Profile"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate(`${routePrefix}/profile`)}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Profile
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate(`${routePrefix}/profile`)}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <Card title="Personal Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="First Name"
                            type="text"
                            placeholder="Enter first name"
                            defaultValue={formData.first_name}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Last Name"
                            type="text"
                            placeholder="Enter last name"
                            defaultValue={formData.last_name}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone"
                            defaultValue={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                </Card>

                <Card title="Change Password" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            defaultValue={passwordForm.password}
                            onChange={handlePasswordChange}
                            error={passwordError}
                        />
                        <Textinput
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm new password"
                            defaultValue={passwordForm.password_confirmation}
                            onChange={handlePasswordChange}
                            error={confirmPasswordError}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Leave blank if you don't want to change your password.
                        Password must be at least 8 characters.
                    </p>
                </Card>

                <Card title="Profile Picture" className="mt-5">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="Profile Preview"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                                <Icon
                                    icon="heroicons-outline:user"
                                    className="text-4xl text-slate-500"
                                />
                            </div>
                        )}
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
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:arrow-left"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate(`${routePrefix}/profile`)}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Save Changes"
                        className="btn-dark"
                        isLoading={isUpdating}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;
