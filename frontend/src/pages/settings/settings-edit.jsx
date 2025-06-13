import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import {
    useGetSettingQuery,
    useUpdateSettingMutation,
} from "@/store/api/settings/settingsApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

// Schema for the edit setting form
const schema = yup.object().shape({
    value: yup.string().nullable(),
});

// Static data for select options
const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
];

const timeFormats = [
    { value: "12h", label: "12-hour (1:30 PM)" },
    { value: "24h", label: "24-hour (13:30)" },
];

const dateFormats = [
    { value: "Y-m-d", label: "YYYY-MM-DD (e.g., 2023-12-31)" },
    { value: "m/d/Y", label: "MM/DD/YYYY (e.g., 12/31/2023)" },
    { value: "d/m/Y", label: "DD/MM/YYYY (e.g., 31/12/2023)" },
    { value: "d-m-Y", label: "DD-MM-YYYY (e.g., 31-12-2023)" },
    { value: "d.m.Y", label: "DD.MM.YYYY (e.g., 31.12.2023)" },
    { value: "F j, Y", label: "Month D, YYYY (e.g., December 31, 2023)" },
    { value: "j F, Y", label: "D Month, YYYY (e.g., 31 December, 2023)" },
];

const timezones = [
    { value: "UTC", label: "UTC - Coordinated Universal Time" },
    {
        value: "America/New_York",
        label: "EST - Eastern Standard Time (New York)",
    },
    { value: "Europe/London", label: "GMT - Greenwich Mean Time (London)" },
    { value: "Asia/Tokyo", label: "JST - Japan Standard Time (Tokyo)" },
    {
        value: "Australia/Sydney",
        label: "AEST - Australian Eastern Standard Time (Sydney)",
    },
];

// Define special input types based on key
const getInputTypeForKey = (key) => {
    const keyMap = {
        starting_week_day: "weekday",
        time_format: "timeformat",
        date_format: "dateformat",
        timezone: "timezone",
    };
    return keyMap[key] || "text";
};

const SettingsEdit = () => {
    const { key } = useParams();
    const navigate = useNavigate();

    const {
        data: setting,
        isLoading,
        isError,
        error,
    } = useGetSettingQuery(key);
    const [updateSetting, { isLoading: isUpdating }] =
        useUpdateSettingMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            value: "",
        },
    });

    // Initialize form with setting data when available
    useEffect(() => {
        if (setting) {
            reset({
                value: setting.value || "",
            });
        }
    }, [setting, reset]);

    const onSubmit = async (data) => {
        try {
            await updateSetting({ key, data }).unwrap();
            toast.success("Setting updated successfully");
            navigate("/admin/settings");
        } catch (error) {
            console.error("Failed to update setting:", error);
            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to update setting");
            }
        }
    };

    // Render appropriate input based on setting key
    const renderSettingInput = () => {
        if (!setting) return null;

        const inputType = getInputTypeForKey(key);
        const currentValue = watch("value");

        switch (inputType) {
            case "weekday":
                return (
                    <Select
                        label="Starting Week Day"
                        options={weekDays}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a starting week day"
                        error={errors.value}
                    />
                );
            case "timeformat":
                return (
                    <Select
                        label="Time Format"
                        options={timeFormats}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a time format"
                        error={errors.value}
                    />
                );
            case "dateformat":
                return (
                    <Select
                        label="Date Format"
                        options={dateFormats}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a date format"
                        error={errors.value}
                    />
                );
            case "timezone":
                return (
                    <Select
                        label="Timezone"
                        options={timezones}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a timezone"
                        error={errors.value}
                    />
                );
            default:
                return (
                    <Textarea
                        label="Value"
                        name="value"
                        placeholder="Enter setting value"
                        register={register}
                        error={errors.value}
                        rows={5}
                    />
                );
        }
    };

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <Icon
                        icon="heroicons-outline:exclamation-circle"
                        className="text-danger-500 text-4xl mb-2"
                    />
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Setting
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load setting information"}
                    </p>
                    <Button
                        text="Back to Settings"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/admin/settings")}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Setting: {setting.key}
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/admin/settings")}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="Edit Setting">
                    <div className="grid lg:grid-cols-1 md:grid-cols-1 grid-cols-1 gap-5 mb-5">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="text-base text-slate-500 font-medium">
                                Key
                            </div>
                            <div className="text-lg text-slate-900 font-medium py-2 px-4 bg-slate-50 dark:bg-slate-700 rounded">
                                {setting.key}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-1 md:grid-cols-1 grid-cols-1 gap-5">
                        {renderSettingInput()}
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/settings")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Save Changes"
                        className="btn-dark"
                        isLoading={isUpdating}
                    />
                </div>
            </form>
        </div>
    );
};

export default SettingsEdit;
