import React, { useEffect, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Loading from "@/components/Loading";
import { useSelector } from "react-redux";
const AuthLayout = () => {
    const navigate = useNavigate();
    const { isAuth, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuth || user) {
            navigate("/admin/dashboard");
        }
    }, [isAuth, navigate, user]);

    return (
        <>
            <Suspense fallback={<Loading />}>
                <ToastContainer />
                {<Outlet />}
            </Suspense>
        </>
    );
};

export default AuthLayout;
