import Loading from "@/components/Loading";
import { Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const AuthLayout = () => {
    const navigate = useNavigate();
    const { isAuth, token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuth && token) {
            navigate("/admin/dashboard");
        }
    }, [isAuth, token, navigate]);

    return (
        <>
            <Suspense fallback={<Loading />}>
                <ToastContainer />
                <Outlet />
            </Suspense>
        </>
    );
};

export default AuthLayout;
