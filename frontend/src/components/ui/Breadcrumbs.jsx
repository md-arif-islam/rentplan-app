import Icon from "@/components/ui/Icon";
import { getMenuItems } from "@/utils/menuSelector";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const userRole = user?.role?.name || "";

    // Get menu items based on user role
    const menuItems = getMenuItems(userRole);

    // Split the pathname into segments and filter out empty strings.
    const segments = location.pathname.split("/").filter(Boolean);
    // Remove "admin" or "company" if they exist as the first segment.
    if (segments[0] === "admin" || segments[0] === "company") {
        segments.shift();
    }
    // Create a readable breadcrumb string
    const locationName = segments.join(" / ");

    const [isHide, setIsHide] = useState(null);
    const [groupTitle, setGroupTitle] = useState("");

    useEffect(() => {
        // Try to find a matching menu item based on the whole locationName
        const currentMenuItem = menuItems.find(
            (item) => item.link === locationName
        );

        // Look for a child item matching one of the segments if not found directly.
        const currentChild = menuItems.find((item) =>
            item.child?.find((child) => child.childlink === locationName)
        );

        if (currentMenuItem) {
            setIsHide(currentMenuItem.isHide);
        } else if (currentChild) {
            setIsHide(currentChild?.isHide || false);
            setGroupTitle(currentChild?.title);
        }
    }, [location, locationName, menuItems]);

    // Determine the base route for navigation based on user role
    const baseRoute = userRole === "super_admin" ? "/admin" : "/company";

    return (
        <>
            {!isHide ? (
                <div className="md:mb-6 mb-4 flex space-x-3 rtl:space-x-reverse">
                    <ul className="breadcrumbs">
                        <li className="text-primary-500">
                            <NavLink
                                to={`${baseRoute}/dashboard`}
                                className="text-lg"
                            >
                                <Icon icon="heroicons-outline:home" />
                            </NavLink>
                            <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                                <Icon icon="heroicons:chevron-right" />
                            </span>
                        </li>
                        {groupTitle && (
                            <li className="text-primary-500">
                                <button type="button" className="capitalize">
                                    {groupTitle}
                                </button>
                                <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                                    <Icon icon="heroicons:chevron-right" />
                                </span>
                            </li>
                        )}
                        <li className="capitalize text-slate-500 dark:text-slate-400">
                            {locationName}
                        </li>
                    </ul>
                </div>
            ) : null}
        </>
    );
};

export default Breadcrumbs;
