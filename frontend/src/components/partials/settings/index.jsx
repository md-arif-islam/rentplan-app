import { handleCustomizer } from "@/store/layout";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";

const Setings = () => {
    const isOpen = useSelector((state) => state.layout.customizer);
    const dispatch = useDispatch();
    // ** Toggles  Customizer Open
    const setCustomizer = (val) => dispatch(handleCustomizer(val));

    return (
        <div>
            <Transition as={Fragment} show={isOpen}>
                <div
                    className="overlay bg-white bg-opacity-0 fixed inset-0 z-[999]"
                    onClick={() => setCustomizer(false)}
                ></div>
            </Transition>
        </div>
    );
};

export default Setings;
