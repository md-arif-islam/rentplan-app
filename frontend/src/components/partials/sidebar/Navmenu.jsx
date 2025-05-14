import Icon from "@/components/ui/Icon";
import useMobileMenu from "@/hooks/useMobileMenu";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import Submenu from "./Submenu";

const Navmenu = ({ menus }) => {
    const [activeSubmenu, setActiveSubmenu] = useState(null);

    const toggleSubmenu = (i) => {
        if (activeSubmenu === i) {
            setActiveSubmenu(null);
        } else {
            setActiveSubmenu(i);
        }
    };

    const location = useLocation();
    const locationName_temp = location.pathname.replace(/\/admin|\//g, "");
    const locationName = locationName_temp
        .replace("/", "")
        .split("-")
        .join(" ");

    const [mobileMenu, setMobileMenu] = useMobileMenu();
    const [activeMultiMenu, setMultiMenu] = useState(null);
    const dispatch = useDispatch();

    const toggleMultiMenu = (j) => {
        if (activeMultiMenu === j) {
            setMultiMenu(null);
        } else {
            setMultiMenu(j);
        }
    };

    const isLocationMatch = (targetLocation) => {
        return (
            locationName === targetLocation ||
            locationName.startsWith(`${targetLocation}/`)
        );
    };

    // Enhanced function to get a clean title from the URL path
    const getPageTitle = () => {
        // Extract the main route part (first segment after /admin/)
        const pathParts = location.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2 && pathParts[0] === "admin") {
            // Get the main resource name (like "holders-taxes")
            const mainResource = pathParts[1];

            // Check if there's an action part (like "edit", "create", "show")
            const actionPart =
                pathParts.length > 3 ? pathParts[pathParts.length - 1] : null;
            const hasAction =
                actionPart && ["edit", "create", "show"].includes(actionPart);

            // Convert kebab-case to Title Case for the resource
            const resourceTitle = mainResource
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            // Add the action to the title if available
            if (hasAction) {
                return `${resourceTitle} ${
                    actionPart.charAt(0).toUpperCase() + actionPart.slice(1)
                }`;
            }

            return resourceTitle;
        }

        // Fallback to the original logic for simple paths
        return locationName
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    useEffect(() => {
        let submenuIndex = null;
        let multiMenuIndex = null;
        menus.forEach((item, i) => {
            if (isLocationMatch(item.link)) {
                submenuIndex = i;
            }

            if (item.child) {
                item.child.forEach((childItem, j) => {
                    if (isLocationMatch(childItem.childlink)) {
                        submenuIndex = i;
                    }

                    if (childItem.multi_menu) {
                        childItem.multi_menu.forEach((nestedItem) => {
                            if (isLocationMatch(nestedItem.multiLink)) {
                                submenuIndex = i;
                                multiMenuIndex = j;
                            }
                        });
                    }
                });
            }
        });

        document.title = `${getPageTitle()} | Rentplan`;

        setActiveSubmenu(submenuIndex);
        setMultiMenu(multiMenuIndex);

        if (mobileMenu) {
            setMobileMenu(false);
        }
    }, [location]);

    return (
        <>
            <ul>
                {menus.map((item, i) => (
                    <li
                        key={i}
                        className={` single-sidebar-menu
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
              ${
                  locationName_temp.includes(item.link)
                      ? "menu-item-active"
                      : ""
              }`}
                    >
                        {/* single menu with no childred*/}
                        {!item.child && !item.isHeadr && (
                            <NavLink className="menu-link" to={item.link}>
                                <span className="menu-icon flex-grow-0">
                                    <Icon icon={item.icon} />
                                </span>
                                <div className="text-box flex-grow">
                                    {item.title}
                                </div>
                                {item.badge && (
                                    <span className="menu-badge">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        )}
                        {/* only for menulabel */}
                        {item.isHeadr && !item.child && (
                            <div className="menulabel">{item.title}</div>
                        )}
                        {/*    !!sub menu parent   */}
                        {item.child && (
                            <div
                                className={`menu-link ${
                                    activeSubmenu === i
                                        ? "parent_active not-collapsed"
                                        : "collapsed"
                                }`}
                                onClick={() => toggleSubmenu(i)}
                            >
                                <div className="flex-1 flex items-start">
                                    <span className="menu-icon">
                                        <Icon icon={item.icon} />
                                    </span>
                                    <div className="text-box">{item.title}</div>
                                </div>
                                <div className="flex-0">
                                    <div
                                        className={`menu-arrow transform transition-all duration-300 ${
                                            activeSubmenu === i
                                                ? " rotate-90"
                                                : ""
                                        }`}
                                    >
                                        <Icon icon="heroicons-outline:chevron-right" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Submenu
                            activeSubmenu={activeSubmenu}
                            item={item}
                            i={i}
                            toggleMultiMenu={toggleMultiMenu}
                            activeMultiMenu={activeMultiMenu}
                        />
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Navmenu;
