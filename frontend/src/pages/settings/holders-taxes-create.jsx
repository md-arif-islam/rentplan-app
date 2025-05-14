import Grid from "@/components/skeleton/Grid";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import { useState } from "react";
import Flatpickr from "react-flatpickr";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Use the countries query to retrieve the list of countries
import { useGetCountriesQuery } from "@/store/api/countries/countriesApiSlice";
// Use the create mutation from your holders-taxes API slice
import { useCreateHoldersTaxMutation } from "@/store/api/holdersTaxes/holdersTaxesApiSlice";

const HoldersTaxesCreatePage = () => {
    const navigate = useNavigate();

    // Local state for new tax record
    const [newTax, setNewTax] = useState({
        country_id: "",
        percentage: "",
        is_deductible: false,
        // Default time in 12-hour format
        time: "12:00:00 AM",
    });

    // Fetch the list of countries
    const {
        data: countriesData,
        isLoading: isCountriesLoading,
        error: countriesError,
    } = useGetCountriesQuery({ perPage: 1000 });

    // Mutation hook for creating a new tax record
    const [createHoldersTax, { isLoading: isCreating }] =
        useCreateHoldersTaxMutation();

    // Map countries for the Select dropdown
    const countryOptions =
        countriesData && countriesData.data
            ? countriesData.data.map((country) => ({
                  value: country.id,
                  label: country.name,
              }))
            : [];

    // Handlers to update local state
    const handleCountryChange = (e) =>
        setNewTax({ ...newTax, country_id: e.target.value });
    const handlePercentageChange = (e) =>
        setNewTax({ ...newTax, percentage: e.target.value });
    const handleDeductibleChange = (e) =>
        setNewTax({ ...newTax, is_deductible: e.target.checked });

    // For time selection, use Flatpickr in 12-hour mode. Update state as a 12-hour formatted string.
    const handleTimeChange = (date) => {
        if (date && date[0]) {
            const dt = date[0];
            const formattedTime = dt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
            setNewTax({ ...newTax, time: formattedTime });
        }
    };

    // Helper function: convert a 12-hour string (e.g., "09:45:27 AM") to 24-hour format (e.g., "09:45:27")
    const convertTimeTo24 = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes, seconds] = time.split(":");
        if (modifier === "PM" && hours !== "12") {
            hours = String(parseInt(hours, 10) + 12);
        }
        if (modifier === "AM" && hours === "12") {
            hours = "00";
        }
        hours = hours.padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };

    // Submit handler: converts time and calls the create mutation.
    const handleSubmit = async (e) => {
        e.preventDefault();
        const time24 = convertTimeTo24(newTax.time);
        const payload = {
            country_id: newTax.country_id,
            percentage: Number(newTax.percentage),
            is_deductible: newTax.is_deductible,
            time: time24,
        };
        try {
            await createHoldersTax(payload).unwrap();
            toast.success("Holders Tax created successfully");
            navigate("/admin/holders-taxes");
        } catch (err) {
            toast.error(err.data.message);
            console.error("Create failed", err);
        }
    };

    // While the countries are loading, show the skeleton.
    if (isCountriesLoading) {
        return <Grid count={1} />;
    }
    if (countriesError) {
        return <div>Error loading countries</div>;
    }

    return (
        <div>
            <Card title="Create Holders Tax">
                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                        <Select
                            label="Country"
                            options={countryOptions}
                            value={newTax.country_id}
                            onChange={handleCountryChange}
                            placeholder="Select a country"
                        />
                        <Textinput
                            label="Percentage"
                            type="number"
                            placeholder="Enter percentage"
                            value={newTax.percentage}
                            onChange={handlePercentageChange}
                        />
                        <Checkbox
                            label="Is Deductible?"
                            value={newTax.is_deductible}
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
                                    dateFormat: "h:i:S K", // 12-hour format with AM/PM
                                    time_24hr: false,
                                }}
                                value={newTax.time}
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
                            isLoading={isCreating}
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default HoldersTaxesCreatePage;
