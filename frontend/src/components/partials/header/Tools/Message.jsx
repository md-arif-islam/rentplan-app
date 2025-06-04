import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";

const messagelabel = () => {
    return (
        <span className="relative lg:h-[32px] lg:w-[32px] lg:bg-slate-100 lg:dark:bg-slate-900 dark:text-white text-slate-900 cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center">
            <Icon icon="heroicons-outline:mail" />
            <span className="absolute lg:right-0 lg:top-0 -top-2 -right-2 h-4 w-4 bg-red-500 text-[8px] font-semibold flex flex-col items-center justify-center rounded-full text-white z-[99]">
                10
            </span>
        </span>
    );
};

const Message = () => {
    return (
        <Dropdown
            classMenuItems="md:w-[335px] w-min top-[58px]"
            label={messagelabel()}
        >
            <div className="flex justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-600">
                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-6">
                    Messages
                </div>
                <div className="text-slate-800 dark:text-slate-200 text-sm md:text-right">
                    <Link to="/chat" className="underline">
                        View all
                    </Link>
                </div>
            </div>
        </Dropdown>
    );
};

export default Message;
