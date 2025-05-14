import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";

import {
    useGetProfileQuery,
    useUpdateProfileMutation,
} from "@/store/api/profile/profileApiSlice";
import { setProfile } from "@/store/api/profile/profileSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: profile, isLoading, error } = useGetProfileQuery(id);
    const [updateProfile, { isLoading: isUpdating }] =
        useUpdateProfileMutation();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        city: "",
        post_code: "",
        county: "",
        avatar: null,
    });

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
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                phone: profile.phone || "",
                address: profile.address || "",
                city: profile.city || "",
                post_code: profile.post_code || "",
                county: profile.county || "",
                avatar: profile.avatar || null,
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedProfile = await updateProfile({
                id,
                ...formData,
            }).unwrap();
            dispatch(setProfile(updatedProfile));
            toast.success("Profile updated successfully");
            navigate("/admin/profile");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update profile");
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
                        onClick={() => navigate("/admin/profile")}
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
                    onClick={() => navigate("/admin/profile")}
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
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })
                            }
                        />
                        <Textinput
                            label="Last Name"
                            type="text"
                            placeholder="Enter last name"
                            defaultValue={formData.last_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    last_name: e.target.value,
                                })
                            }
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone"
                            defaultValue={formData.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                        />
                    </div>
                </Card>

                <Card title="Address Information" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Address"
                            type="text"
                            placeholder="Enter address"
                            defaultValue={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                        />
                        <Textinput
                            label="City"
                            type="text"
                            placeholder="Enter city"
                            defaultValue={formData.city}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    city: e.target.value,
                                })
                            }
                        />
                        <Textinput
                            label="Post Code"
                            type="text"
                            placeholder="Enter post code"
                            defaultValue={formData.post_code}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    post_code: e.target.value,
                                })
                            }
                        />
                        <Textinput
                            label="County"
                            type="text"
                            placeholder="Enter county"
                            defaultValue={formData.county}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    county: e.target.value,
                                })
                            }
                        />
                    </div>
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
                        onClick={() => navigate("/admin/profile")}
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
