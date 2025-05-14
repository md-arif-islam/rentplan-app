import { Link } from "react-router-dom";
import LeftImage from "./common/left-image";

const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="loginwrapper flex items-center justify-center min-h-screen">
            <div className="lg-inner-column w-[95%] md:w-[80%] max-h-[600px] h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-[16px]">
                <LeftImage />
                <div className="right-column relative">
                    <div className="inner-content h-full flex flex-col">
                        <div className="auth-box h-full flex flex-col justify-center">
                            <div className="mobile-logo text-center mb-6 lg:hidden block">
                                <Link to="/">
                                    <h1 className="text-3xl font-bold italic flex items-center justify-center h-full">
                                        Rentplan
                                        <span className="text-[#FF4847]">
                                            .
                                        </span>
                                    </h1>
                                </Link>
                            </div>
                            <div className="text-center 2xl:mb-10 mb-4">
                                <h4 className="font-medium">{title}</h4>
                                <div className="text-slate-500 text-base">
                                    {subtitle}
                                </div>
                            </div>
                            {children}
                        </div>
                        <div className="auth-footer text-center">
                            &copy; Rentplan {new Date().getFullYear()}, All
                            Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
