import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCompanyUserQuery } from "@/store/api/users/usersApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const UserShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        data: user,
        isLoading,
        isError,
        error,
    } = useGetCompanyUserQuery(id);

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        toast.error(error?.data?.message || "Failed to load user details");
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

    const userName = user.user_profile?.name || "No Name";
    const userEmail = user.email || "No Email";
    const userRole = user.role?.name?.replace("_", " ") || "No Role";
    const userPhone = user.user_profile?.phone || "Not provided";

    // Format dates without date-fns
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-5">
            {/* Header and action buttons */}
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    User Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/users")}
                    />
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit"
                        className="btn-dark"
                        onClick={() => navigate(`/company/users/${id}/edit`)}
                    />
                </div>
            </div>

            {/* User Profile Card */}
            <Card title="Account Information">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Avatar Column */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {user.user_profile?.avatar ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${
                                        user.user_profile.avatar
                                    }`}
                                    alt={`${userName} Avatar`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Icon
                                    icon="heroicons-outline:user"
                                    className="text-4xl text-slate-400"
                                />
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="col-span-4">
                        <h3 className="text-xl font-medium text-slate-900 mb-4">
                            {userName}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="text-base">{userEmail}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Role</p>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                                    {userRole}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="text-base">{userPhone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Users"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/users")}
                />
                <Button
                    icon="heroicons:pencil-square"
                    text="Edit User"
                    className="btn-dark"
                    onClick={() => navigate(`/company/users/${id}/edit`)}
                />
            </div>
        </div>
    );
};

export default UserShow;
