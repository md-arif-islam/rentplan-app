import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCompanyUserQuery } from "@/store/api/users/usersApiSlice";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

const UserShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);
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
                    User Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/users")}
                    />
                    <Link to={`/company/users/${id}/edit`}>
                        <Button
                            icon="heroicons:pencil-square"
                            text="Edit"
                            className="btn-dark"
                        />
                    </Link>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-40 h-40 rounded-full overflow-hidden border border-slate-200">
                            {user.userProfile?.avatar ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${
                                        user.userProfile.avatar
                                    }`}
                                    alt={user.userProfile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-slate-200">
                                    <Icon
                                        icon="heroicons-outline:user"
                                        className="text-5xl text-slate-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Details */}
                    <div>
                        <h2 className="text-2xl font-medium text-slate-900 mb-4">
                            {user.userProfile?.name || "No name provided"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="text-base font-medium">
                                    {user.email}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="text-base font-medium">
                                    {user.userProfile?.phone || "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Role</p>
                                <p className="text-base font-medium">
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                                        {user.role?.name
                                            ?.replace("_", " ")
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                            )}
                                    </span>
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Created At
                                </p>
                                <p className="text-base font-medium">
                                    {new Date(
                                        user.created_at
                                    ).toLocaleDateString()}
                                </p>
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
                {currentUser.id !== user.id && (
                    <div className="flex space-x-3">
                        <Link to={`/company/users/${id}/edit`}>
                            <Button
                                icon="heroicons:pencil-square"
                                text="Edit User"
                                className="btn-dark"
                            />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserShow;
