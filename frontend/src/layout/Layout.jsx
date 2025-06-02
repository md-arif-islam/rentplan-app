import Loading from "@/components/Loading";
import Footer from "@/components/partials/footer";
import MobileFooter from "@/components/partials/footer/MobileFooter";
import Header from "@/components/partials/header";
import Settings from "@/components/partials/settings";
import Sidebar from "@/components/partials/sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import useContentWidth from "@/hooks/useContentWidth";
import useMenuHidden from "@/hooks/useMenuHidden";
import useMenulayout from "@/hooks/useMenulayout";
import useMobileMenu from "@/hooks/useMobileMenu";
import useSidebar from "@/hooks/useSidebar";
import useWidth from "@/hooks/useWidth";
import { useGetUserQuery } from "@/store/api/auth/authApiSlice";
import { logOut } from "@/store/api/auth/authSlice";
import { useGetProfileByUserIdQuery } from "@/store/api/profile/profileApiSlice";
import { setProfile } from "@/store/api/profile/profileSlice";
import { motion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MobileMenu from "../components/partials/sidebar/MobileMenu";

const Layout = () => {
    const { width, breakpoints } = useWidth();
    const [collapsed] = useSidebar();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuth, token } = useSelector((state) => state.auth);

    const {
        data: user,
        isLoading,
        isError,
        error,
    } = useGetUserQuery(undefined, {
        skip: !token, // Skip the query if there's no token
    });

    const { data: profile, refetch: refetchProfile } =
        useGetProfileByUserIdQuery(user?.id, { skip: !user });

    // Handle auth state
    useEffect(() => {
        if (!isAuth || !token) {
            navigate("/login");
            return;
        }

        if (isError) {
            if (error?.status === 401) {
                dispatch(logOut());
                navigate("/login");
            }
        }
    }, [isAuth, token, isError, error, navigate, dispatch]);

    // Handle profile data
    useEffect(() => {
        if (profile) {
            dispatch(setProfile(profile));
        }
    }, [profile, dispatch]);

    const switchHeaderClass = () => {
        if (menuType === "horizontal" || menuHidden) {
            return "ltr:ml-0 rtl:mr-0";
        } else if (collapsed) {
            return "ltr:ml-[72px] rtl:mr-[72px]";
        } else {
            return "ltr:ml-[248px] rtl:mr-[248px]";
        }
    };

    // content width
    const [contentWidth] = useContentWidth();
    const [menuType] = useMenulayout();
    const [menuHidden] = useMenuHidden();
    // mobile menu
    const [mobileMenu, setMobileMenu] = useMobileMenu();

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <ToastContainer />
            <Header
                className={width > breakpoints.xl ? switchHeaderClass() : ""}
            />
            {menuType === "vertical" &&
                width > breakpoints.xl &&
                !menuHidden && <Sidebar />}
            <MobileMenu
                className={`${
                    width < breakpoints.xl && mobileMenu
                        ? "left-0 visible opacity-100  z-[9999]"
                        : "left-[-300px] invisible opacity-0  z-[-999] "
                }`}
            />
            {/* mobile menu overlay*/}
            {width < breakpoints.xl && mobileMenu && (
                <div
                    className="overlay bg-slate-900/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
                    onClick={() => setMobileMenu(false)}
                ></div>
            )}
            <Settings />
            <div
                className={`content-wrapper transition-all duration-150 ${
                    width > 1280 ? switchHeaderClass() : ""
                }`}
            >
                <div className="page-content page-min-height">
                    <div
                        className={
                            contentWidth === "boxed"
                                ? "container mx-auto"
                                : "container-fluid"
                        }
                    >
                        <Suspense fallback={<Loading />}>
                            <motion.div
                                key={location.pathname}
                                initial="pageInitial"
                                animate="pageAnimate"
                                exit="pageExit"
                                variants={{
                                    pageInitial: {
                                        opacity: 0,
                                        y: 50,
                                    },
                                    pageAnimate: {
                                        opacity: 1,
                                        y: 0,
                                    },
                                    pageExit: {
                                        opacity: 0,
                                        y: -50,
                                    },
                                }}
                                transition={{
                                    type: "tween",
                                    ease: "easeInOut",
                                    duration: 0.5,
                                }}
                            >
                                <Breadcrumbs />
                                {<Outlet />}
                            </motion.div>
                        </Suspense>
                    </div>
                </div>
            </div>
            {width < breakpoints.md && <MobileFooter />}
            {width > breakpoints.md && (
                <Footer
                    className={
                        width > breakpoints.xl ? switchHeaderClass() : ""
                    }
                />
            )}
        </>
    );
};

export default Layout;
