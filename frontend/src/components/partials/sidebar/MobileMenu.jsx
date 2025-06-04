import { useEffect, useRef, useState } from "react";

import Icon from "@/components/ui/Icon";
import useDarkMode from "@/hooks/useDarkMode";
import useMobileMenu from "@/hooks/useMobileMenu";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import { getMenuItems } from "@/utils/menuSelector";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import Navmenu from "./Navmenu";

// import images
import MobileLogoWhite from "@/assets/images/logo/logo-c-white.svg";
import MobileLogo from "@/assets/images/logo/logo-c.svg";

const MobileMenu = ({ className = "custom-class" }) => {
    const scrollableNodeRef = useRef();
    const [scroll, setScroll] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const userRole = user?.role?.name || "";

    // Get menu items based on user role
    const menuItems = getMenuItems(userRole);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    const [isSemiDark] = useSemiDark();
    // skin
    const [skin] = useSkin();
    const [isDark] = useDarkMode();
    const [mobileMenu, setMobileMenu] = useMobileMenu();

    return (
        <div
            className={`${className} fixed  top-0 bg-white dark:bg-slate-800 shadow-lg  h-full   w-[248px]`}
        >
            <div className="logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] h-[85px]  px-4 ">
                <Link to="/admin/dashboard">
                    <div className="flex items-center space-x-4">
                        <div className="logo-icon">
                            {!isDark && !isSemiDark ? (
                                <img src={MobileLogo} alt="" />
                            ) : (
                                <img src={MobileLogoWhite} alt="" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold italic flex items-center justify-center h-full text-sla dark:text-white">
                                Rentplan
                                <span className="text-[#FF4847]">.</span>
                            </h1>
                        </div>
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={() => setMobileMenu(!mobileMenu)}
                    className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                >
                    <Icon icon="heroicons:x-mark" />
                </button>
            </div>

            <div
                className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
                    scroll ? " opacity-100" : " opacity-0"
                }`}
            ></div>
            <SimpleBar
                className="sidebar-menu px-4 h-[calc(100%-80px)]"
                scrollableNodeProps={{ ref: scrollableNodeRef }}
            >
                <Navmenu menus={menuItems} />
            </SimpleBar>
        </div>
    );
};

export default MobileMenu;
