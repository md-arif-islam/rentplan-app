import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import {
    useGetAdminProfileByUserIdQuery,
    useGetCompanyProfileByUserIdQuery,
} from "@/store/api/profile/profileApiSlice";
import { setProfile, setUserRole } from "@/store/api/profile/profileSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const storeProfile = useSelector((state) => state.profile.profile);

    // Determine which API endpoint to use based on user role
    const userRole = user?.role?.name || "";
    const isAdmin = userRole === "super_admin";
    const isCompanyAdmin = userRole === "company_admin";

    // Store the user role in the profile slice
    useEffect(() => {
        if (userRole) {
            dispatch(setUserRole(userRole));
        }
    }, [userRole, dispatch]);

    // Use the appropriate query based on user role
    const {
        data: adminData,
        isLoading: adminIsLoading,
        error: adminError,
        refetch: adminRefetch,
    } = useGetAdminProfileByUserIdQuery(user?.id, {
        skip: !isAdmin || !user?.id,
        refetchOnMountOrArgChange: true,
    });

    const {
        data: companyData,
        isLoading: companyIsLoading,
        error: companyError,
        refetch: companyRefetch,
    } = useGetCompanyProfileByUserIdQuery(user?.id, {
        skip: !isCompanyAdmin || !user?.id,
        refetchOnMountOrArgChange: true,
    });

    // Determine the actual data, loading and error states
    const data = isAdmin ? adminData : companyData;
    const isLoading = isAdmin ? adminIsLoading : companyIsLoading;
    const error = isAdmin ? adminError : companyError;
    const refetch = isAdmin ? adminRefetch : companyRefetch;

    // Force refetch when navigating back to profile page
    useEffect(() => {
        if (
            location.pathname.includes("/profile") &&
            !location.pathname.includes("/edit")
        ) {
            refetch();
        }
    }, [location, refetch]);

    useEffect(() => {
        if (data) {
            dispatch(setProfile(data));
        }
    }, [data, dispatch]);

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-5 profile-page">
                <div className="h-[150px] w-full rounded-t-lg bg-gray-200 animate-pulse"></div>
                <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800">
                    <div className="h-[186px] w-[186px] rounded-full mx-auto mb-4 bg-gray-200 animate-pulse"></div>
                    <div className="h-6 w-1/2 mx-auto mb-2 bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-1/3 mx-auto bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-5 profile-page">
                <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <h2 className="text-lg font-bold mb-2">
                        Error Loading Profile
                    </h2>
                    <p className="mb-4">
                        {error?.data?.message ||
                            "Could not load profile information"}
                    </p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const userAvatar = data?.avatar
        ? `${import.meta.env.VITE_API_URL}/${data.avatar}`
        : null;

    const fullName = data?.name || "N/A";
    const email = data?.user?.email || user?.email || "N/A";

    // Determine the correct route prefix for navigation based on user role
    const routePrefix = isAdmin ? "/admin" : "/company";

    return (
        <div>
            <div className="space-y-5 profile-page">
                <div className="profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]">
                    <div className="bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg"></div>
                    <div className="profile-box flex-none md:text-start text-center">
                        <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
                            <div className="flex-none">
                                <div className="md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 ring-slate-100 relative">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt="User profile"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                            <Icon
                                                icon="heroicons-outline:user"
                                                className="text-4xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]">
                                    {fullName}
                                </div>
                                <div className="text-sm font-light text-slate-600 dark:text-slate-400">
                                    {email}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-6">
                    <div className="lg:col-span-12 col-span-12">
                        <Card title="Personal Information">
                            <ul className="list space-y-8">
                                <li className="flex space-x-3 rtl:space-x-reverse">
                                    <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                                        <Icon icon="heroicons:envelope" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="uppercase text-sm text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                            EMAIL
                                        </div>
                                        <a
                                            href={`mailto:${email}`}
                                            className="text-base text-slate-600 dark:text-slate-50"
                                        >
                                            {email}
                                        </a>
                                    </div>
                                </li>

                                <li className="flex space-x-3 rtl:space-x-reverse">
                                    <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                                        <Icon icon="heroicons:phone-arrow-up-right" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="uppercase text-sm text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                            PHONE
                                        </div>
                                        <a
                                            href={`tel:${data?.phone || ""}`}
                                            className="text-base text-slate-600 dark:text-slate-50"
                                        >
                                            {data?.phone || "N/A"}
                                        </a>
                                    </div>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
                <div className="flex justify-between">
                    <Button
                        icon="heroicons:arrow-left"
                        text="Back to Dashboard"
                        className="btn-outline-dark"
                        onClick={() => navigate(`${routePrefix}/dashboard`)}
                    />
                    <Link to={`${routePrefix}/profile/${data?.id}/edit`}>
                        <Button
                            icon="heroicons:pencil-square"
                            text="Edit Profile"
                            className="btn-dark"
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
