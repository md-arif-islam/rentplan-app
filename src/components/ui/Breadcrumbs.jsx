import Icon from "@/components/ui/Icon";
import { menuItems } from "@/constant/data";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
    const location = useLocation();
    // Split the pathname into segments and filter out empty strings.
    const segments = location.pathname.split("/").filter(Boolean);
    // Remove "admin" if it exists as the first segment.
    if (segments[0] === "admin") {
        segments.shift();
    }
    // Create a readable breadcrumb string (you may customize the join character)
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
    }, [location, locationName]);

    return (
        <>
            {!isHide ? (
                <div className="md:mb-6 mb-4 flex space-x-3 rtl:space-x-reverse">
                    <ul className="breadcrumbs">
                        <li className="text-primary-500">
                            <NavLink to="/admin/dashboard" className="text-lg">
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
