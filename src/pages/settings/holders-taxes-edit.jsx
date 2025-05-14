import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import {
    useGetHoldersTaxEditDataQuery,
    useUpdateHoldersTaxMutation,
} from "@/store/api/holdersTaxes/holdersTaxesApiSlice";
import { setSelectedTax } from "@/store/api/holdersTaxes/holdersTaxesSlice";
import { useEffect } from "react";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const HoldersTaxesEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get the selected tax record from redux (or an empty object)
    const selectedTax =
        useSelector((state) => state.holdersTaxes.selectedTax) || {};

    // Fetch edit data (which includes the tax record plus extra options)
    const { data, isLoading, error } = useGetHoldersTaxEditDataQuery(id);
    const [updateHoldersTax, { isLoading: isUpdating }] =
        useUpdateHoldersTaxMutation();

    // When API data is available, update redux state using setSelectedTax.
    // Here, we also transform the incoming time into a 12-hour formatted string.
    useEffect(() => {
        if (data && data.holdersTax) {
            const dt = new Date(data.holdersTax.time);
            const timeString = dt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
            const updatedTax = {
                country_id: data.holdersTax.country_id,
                percentage: data.holdersTax.percentage,
                is_deductible: data.holdersTax.is_deductible,
                time: timeString, // e.g. "09:45:27 AM"
                countries:
                    data.countries?.map((c) => ({
                        value: c.id,
                        label: c.name,
                    })) || [],
            };
            dispatch(setSelectedTax(updatedTax));
        }
    }, [data, dispatch]);

    // Helper function to convert 12-hour time (e.g., "09:45:27 AM") to 24-hour format ("09:45:27")
    const convertTimeTo24 = (time12h) => {
        // Split the time and modifier parts
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes, seconds] = time.split(":");
        if (modifier === "PM" && hours !== "12") {
            hours = String(parseInt(hours, 10) + 12);
        }
        if (modifier === "AM" && hours === "12") {
            hours = "00";
        }
        // Ensure two digits for hours
        hours = hours.padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };

    // Submit form handler - now update the record.
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Convert the 12-hour formatted time into 24-hour format.
        const time24 = convertTimeTo24(selectedTax.time);
        const payload = {
            country_id: selectedTax.country_id,
            percentage: Number(selectedTax.percentage),
            is_deductible: selectedTax.is_deductible,
            time: time24, // Now sent in 24-hour format
        };
        try {
            await updateHoldersTax({ id, ...payload }).unwrap();
            toast.success("Holders Tax updated successfully");
            navigate("/admin/holders-taxes");
        } catch (err) {
            toast.error(err.data.message);
            console.error("Update failed", err);
        }
    };

    // Handlers to update redux state with user input
    const handleCountryChange = (e) => {
        dispatch(
            setSelectedTax({ ...selectedTax, country_id: e.target.value })
        );
    };

    const handlePercentageChange = (e) => {
        dispatch(
            setSelectedTax({ ...selectedTax, percentage: e.target.value })
        );
    };

    const handleDeductibleChange = (e) => {
        dispatch(
            setSelectedTax({ ...selectedTax, is_deductible: e.target.checked })
        );
    };

    // For 12-hour time, we use Flatpickr with time_24hr set to false.
    // The handleTimeChange function will update redux state with a 12-hour formatted string.
    const handleTimeChange = (date) => {
        if (date && date[0]) {
            const dt = date[0];
            const formattedTime = dt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
            dispatch(setSelectedTax({ ...selectedTax, time: formattedTime }));
        }
    };

    return (
        <div>
            {isLoading ? (
                <div className="p-4 border rounded shadow bg-white dark:bg-slate-800">
                    {/* Title Skeleton */}
                    <div className="h-8 w-48 bg-gray-300 dark:bg-slate-600 rounded mb-6 animate-pulse" />
                    <div className="space-y-6">
                        {/* Country Select Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        {/* Percentage Input Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        {/* Checkbox Skeleton */}
                        <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        </div>
                        {/* Time Picker Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                    {/* Save Button Skeleton */}
                    <div className="mt-8">
                        <div className="h-10 w-32 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                </div>
            ) : error ? (
                <div>Error loading data</div>
            ) : (
                <Card title="Edit Holders Tax">
                    <form onSubmit={handleSubmit}>
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                            <Select
                                label="Country"
                                options={selectedTax.countries || []}
                                value={selectedTax.country_id || ""}
                                onChange={handleCountryChange}
                                placeholder="Select a country"
                            />

                            <Textinput
                                label="Percentage"
                                type="number"
                                placeholder="Enter percentage"
                                defaultValue={selectedTax.percentage || ""}
                                onChange={handlePercentageChange}
                            />

                            <Checkbox
                                label="Is Deductible?"
                                value={selectedTax.is_deductible || false}
                                activeClass="ring-primary-500 bg-primary-500"
                                onChange={handleDeductibleChange}
                            />

                            <div>
                                <label
                                    htmlFor="time-picker"
                                    className="form-label block mb-1"
                                >
                                    Time
                                </label>
                                <Flatpickr
                                    id="time-picker"
                                    options={{
                                        enableTime: true,
                                        noCalendar: true,
                                        // Use a 12-hour format with AM/PM
                                        dateFormat: "h:i:S K",
                                        time_24hr: false,
                                    }}
                                    value={selectedTax.time || "12:00:00 AM"}
                                    onChange={handleTimeChange}
                                    className="form-control py-2"
                                />
                            </div>
                        </div>
                        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse mt-4">
                            <Button
                                type="submit"
                                text="Save"
                                className="btn-dark"
                                isLoading={isUpdating}
                            />
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default HoldersTaxesEditPage;
