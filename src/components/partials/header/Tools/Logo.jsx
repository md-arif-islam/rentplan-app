import useDarkMode from "@/hooks/useDarkMode";
import useWidth from "@/hooks/useWidth";
import { Link } from "react-router-dom";

import MobileLogoWhite from "@/assets/images/logo/logo-c-white.svg";
import MobileLogo from "@/assets/images/logo/logo-c.svg";
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import MainLogo from "@/assets/images/logo/logo.svg";
const Logo = () => {
    const [isDark] = useDarkMode();
    const { width, breakpoints } = useWidth();

    return (
        <div>
            <Link to="/admin/dashboard">
                {width >= breakpoints.xl ? (
                    <img src={isDark ? LogoWhite : MainLogo} alt="" />
                ) : (
                    <img src={isDark ? MobileLogoWhite : MobileLogo} alt="" />
                )}
            </Link>
        </div>
    );
};

export default Logo;
