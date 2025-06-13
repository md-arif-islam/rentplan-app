import SkeletionTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import Tooltip from "@/components/ui/Tooltip";
import {
    useCreateSettingMutation,
    useDeleteSettingMutation,
    useGetSettingsQuery,
} from "@/store/api/settings/settingsApiSlice";
import { setSetting } from "@/store/api/settings/settingsSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

// Static data for select options
const settingTypes = [
    { value: "general", label: "General (Text Input)" },
    { value: "starting_week_day", label: "Starting Week Day" },
    { value: "time_format", label: "Time Format" },
    { value: "date_format", label: "Date Format" },
    { value: "timezone", label: "Timezone" },
];

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

// Schema for the add setting form
const schema = yup.object().shape({
    key: yup
        .string()
        .required("Key is required")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "Key can only contain letters, numbers, and underscores"
        )
        .max(255, "Key cannot exceed 255 characters"),
    value: yup.string().nullable(),
    settingType: yup.string().required("Setting type is required"),
});

const Settings = ({ title = "System Settings" }) => {
    const [searchValue, setSearchValue] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [selectedSettingType, setSelectedSettingType] = useState("general");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: settings, isLoading, isError, error } = useGetSettingsQuery();

    const [deleteSetting, { isLoading: isDeleting }] =
        useDeleteSettingMutation();
    const [createSetting, { isLoading: isCreating }] =
        useCreateSettingMutation();

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    // Delete modal handlers
    const handleDeleteClick = (setting) => {
        dispatch(setSetting(setting));
        setDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModal(false);
        dispatch(setSetting(null));
    };

    const selectedSetting = useSelector((state) => state.settings.setting);

    const handleDeleteConfirm = async () => {
        if (!selectedSetting) return;
        try {
            await deleteSetting(selectedSetting.key).unwrap();
            toast.success(
                `Setting "${selectedSetting.key}" deleted successfully!`
            );
            setDeleteModal(false);
            dispatch(setSetting(null));
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete setting");
            console.error(error);
        }
    };

    // Create modal handlers
    const handleOpenCreateModal = () => {
        setCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModal(false);
        setSelectedSettingType("general");
        reset();
    };

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            key: "",
            value: "",
            settingType: "general",
        },
    });

    // Watch the setting type
    const watchSettingType = watch("settingType");

    // When setting type changes, update the key and reset value
    React.useEffect(() => {
        if (watchSettingType !== selectedSettingType) {
            setSelectedSettingType(watchSettingType);

            // If it's a predefined setting type, set the key to match
            if (watchSettingType !== "general") {
                setValue("key", watchSettingType);
            } else {
                setValue("key", "");
            }

            // Reset value based on setting type
            if (watchSettingType === "starting_week_day") {
                setValue("value", "monday");
            } else if (watchSettingType === "time_format") {
                setValue("value", "24h");
            } else if (watchSettingType === "date_format") {
                setValue("value", "Y-m-d");
            } else if (watchSettingType === "timezone") {
                setValue("value", "UTC");
            } else {
                setValue("value", "");
            }
        }
    }, [watchSettingType, setValue, selectedSettingType]);

    // Render value input based on setting type
    const renderValueInput = () => {
        const currentValue = watch("value");

        switch (selectedSettingType) {
            case "starting_week_day":
                return (
                    <Select
                        label="Starting Week Day Value"
                        options={weekDays}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a starting week day"
                        error={errors.value}
                    />
                );
            case "time_format":
                return (
                    <Select
                        label="Time Format Value"
                        options={timeFormats}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a time format"
                        error={errors.value}
                    />
                );
            case "date_format":
                return (
                    <Select
                        label="Date Format Value"
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
                        label="Timezone Value"
                        options={timezones}
                        value={currentValue}
                        onChange={(e) => setValue("value", e.target.value)}
                        placeholder="Select a timezone"
                        error={errors.value}
                    />
                );
            default:
                return (
                    <Textinput
                        label="Value"
                        name="value"
                        type="text"
                        placeholder="Enter setting value"
                        register={register}
                        error={errors.value}
                    />
                );
        }
    };

    const onSubmit = async (data) => {
        try {
            // Extract just the key and value
            const { key, value } = data;
            await createSetting({ key, value }).unwrap();
            toast.success("Setting created successfully");
            handleCloseCreateModal();
        } catch (error) {
            console.error("Failed to create setting:", error);
            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to create setting");
            }
        }
    };

    // Filter settings based on search value
    const filteredSettings = settings?.filter((setting) => {
        if (!searchValue) return true;
        return (
            setting.key.toLowerCase().includes(searchValue.toLowerCase()) ||
            (setting.value &&
                setting.value.toLowerCase().includes(searchValue.toLowerCase()))
        );
    });

    return (
        <>
            {/* Delete Setting Modal */}
            <Modal
                title="Confirm Delete"
                labelClass="btn-outline-danger"
                themeClass="bg-danger-500"
                activeModal={deleteModal}
                onClose={handleCloseDeleteModal}
                centered
                footerContent={
                    <div className="flex items-center gap-3">
                        <Button
                            text="Cancel"
                            className="btn-outline-dark"
                            onClick={handleCloseDeleteModal}
                        />
                        <Button
                            text="Delete"
                            className="btn-danger"
                            isLoading={isDeleting}
                            onClick={handleDeleteConfirm}
                        />
                    </div>
                }
            >
                <h4 className="font-medium text-lg mb-3 text-slate-900">
                    Delete Setting
                </h4>
                <div className="text-base text-slate-600 dark:text-slate-300">
                    {selectedSetting ? (
                        <>
                            Are you sure you want to delete the setting{" "}
                            <strong>{selectedSetting.key}</strong>? This action
                            cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this setting? This action cannot be undone."
                    )}
                </div>
            </Modal>

            {/* Create Setting Modal */}
            <Modal
                title="Create New Setting"
                labelClass="btn-outline-dark"
                activeModal={createModal}
                onClose={handleCloseCreateModal}
                centered
                footerContent={
                    <div className="flex items-center gap-3">
                        <Button
                            text="Cancel"
                            className="btn-outline-dark"
                            onClick={handleCloseCreateModal}
                        />
                        <Button
                            text="Create"
                            className="btn-dark"
                            isLoading={isCreating}
                            onClick={handleSubmit(onSubmit)}
                        />
                    </div>
                }
            >
                <form className="space-y-4">
                    <Select
                        label="Setting Type"
                        options={settingTypes}
                        value={watch("settingType")}
                        onChange={(e) =>
                            setValue("settingType", e.target.value)
                        }
                        placeholder="Select setting type"
                        error={errors.settingType}
                    />

                    <Textinput
                        label="Key"
                        name="key"
                        type="text"
                        placeholder="Enter setting key"
                        register={register}
                        error={errors.key}
                        disabled={selectedSettingType !== "general"}
                    />

                    {renderValueInput()}
                </form>
            </Modal>

            <Card>
                <div className="md:flex pb-6 items-center">
                    <h6 className="flex-1 md:mb-0 mb-3">{title}</h6>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        <input
                            type="text"
                            className="form-control py-2"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={handleSearch}
                        />
                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add Setting"
                            className="btn-dark font-normal btn-sm"
                            iconClass="text-lg"
                            onClick={handleOpenCreateModal}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <SkeletionTable count={5} />
                ) : isError ? (
                    <div className="text-center py-4">
                        <div className="text-lg font-medium text-slate-900 mb-2">
                            Error loading settings
                        </div>
                        <div className="text-sm text-slate-600">
                            {error?.data?.message || "Something went wrong"}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden">
                                    {filteredSettings &&
                                    filteredSettings.length > 0 ? (
                                        <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                                            <thead className="bg-slate-200 dark:bg-slate-700">
                                                <tr>
                                                    <th className="table-th">
                                                        Key
                                                    </th>
                                                    <th className="table-th">
                                                        Value
                                                    </th>
                                                    <th className="table-th">
                                                        Last Updated
                                                    </th>
                                                    <th className="table-th">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                                                {filteredSettings.map(
                                                    (setting) => (
                                                        <tr key={setting.id}>
                                                            <td className="table-td font-medium">
                                                                {setting.key}
                                                            </td>
                                                            <td className="table-td">
                                                                <div className="max-w-xs truncate">
                                                                    {setting.value || (
                                                                        <em className="text-slate-400">
                                                                            No
                                                                            value
                                                                        </em>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="table-td">
                                                                {setting.updated_at
                                                                    ? new Date(
                                                                          setting.updated_at
                                                                      ).toLocaleString()
                                                                    : "—"}
                                                            </td>
                                                            <td className="table-td">
                                                                <div className="flex space-x-3 rtl:space-x-reverse">
                                                                    <Tooltip
                                                                        content="Edit"
                                                                        placement="top"
                                                                        arrow
                                                                        animation="shift-away"
                                                                    >
                                                                        <button
                                                                            className="action-btn"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/admin/settings/${setting.key}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Icon icon="heroicons:pencil-square" />
                                                                        </button>
                                                                    </Tooltip>
                                                                    <Tooltip
                                                                        content="Delete"
                                                                        placement="top"
                                                                        arrow
                                                                        animation="shift-away"
                                                                        theme="danger"
                                                                    >
                                                                        <button
                                                                            className="action-btn"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteClick(
                                                                                    setting
                                                                                )
                                                                            }
                                                                        >
                                                                            <Icon icon="heroicons:trash" />
                                                                        </button>
                                                                    </Tooltip>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Icon
                                                icon="heroicons-outline:cog"
                                                className="inline-block text-4xl text-slate-400 mb-3"
                                            />
                                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                                No settings found
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {searchValue
                                                    ? `No results found for "${searchValue}"`
                                                    : "No settings available yet. Click 'Add Setting' to create one."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </>
    );
};

export default Settings;
