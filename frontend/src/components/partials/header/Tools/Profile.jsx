import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { useLogoutMutation } from "@/store/api/auth/authApiSlice";
import { logOut } from "@/store/api/auth/authSlice";
import { Menu } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApi] = useLogoutMutation();
    const user = useSelector((state) => state.auth.user);
    const profileData = useSelector((state) => state.profile.profile);

    let userRole =
        user?.role?.name == "super_admin"
            ? "Super Admin"
            : user?.role?.name == "company_admin"
            ? "Admin"
            : null;

    const profileInfo = profileData || user?.user_profile;

    const UserAvatar = profileInfo?.avatar
        ? `${import.meta.env.VITE_API_URL}/${profileInfo.avatar}`
        : null;

    const fullName = profileInfo?.name
        ? `${profileInfo?.name || ""}`.trim()
        : userRole;

    const profileLabel = () => {
        return (
            <div className="flex items-center">
                <div className="flex-1 ltr:mr-[10px] rtl:ml-[10px]">
                    <div className="lg:h-8 lg:w-8 h-7 w-7 rounded-full border border-slate-500">
                        {UserAvatar ? (
                            <img
                                src={UserAvatar}
                                alt=""
                                className="block w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                <Icon icon="heroicons-outline:user" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-none text-slate-600 dark:text-white text-sm font-semibold items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap block">
                        {fullName}
                    </span>
                    <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
                        <Icon icon="heroicons-outline:chevron-down"></Icon>
                    </span>
                </div>
            </div>
        );
    };

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            dispatch(logOut());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if API call fails, clean up local state
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            dispatch(logOut());
            navigate("/login");
        }
    };

    const ProfileMenu = [
        {
            label: "Profile",
            icon: "heroicons-outline:user",
            action: () => {
                if (user?.role?.name === "super_admin") {
                    navigate("/admin/profile");
                } else if (user?.role?.name === "company_admin") {
                    navigate("/company/profile");
                } else {
                    navigate("/admin/profile");
                }
            },
        },
        {
            label: "Logout",
            icon: "heroicons-outline:login",
            action: () => {
                handleLogout();
            },
        },
    ];

    return (
        <Dropdown label={profileLabel()} classMenuItems="w-[180px] top-[58px]">
            {ProfileMenu.map((item, index) => (
                <Menu.Item key={index}>
                    {({ active }) => (
                        <div
                            onClick={() => item.action()}
                            className={`${
                                active
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                                    : "text-slate-600 dark:text-slate-300"
                            } block     ${
                                item.hasDivider
                                    ? "border-t border-slate-100 dark:border-slate-700"
                                    : ""
                            }`}
                        >
                            <div className={`block cursor-pointer px-4 py-2`}>
                                <div className="flex items-center">
                                    <span className="block text-xl ltr:mr-3 rtl:ml-3">
                                        <Icon icon={item.icon} />
                                    </span>
                                    <span className="block text-sm">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </Menu.Item>
            ))}
        </Dropdown>
    );
};

export default Profile;
