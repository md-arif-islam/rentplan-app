import React, { useState } from "react";
import SkeletionTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import {
    useDeleteSettingMutation,
    useGetSettingsQuery,
    useCreateSettingMutation,
} from "@/store/api/settings/settingsApiSlice";
import { setSetting } from "@/store/api/settings/settingsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";

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
});

const Settings = ({ title = "System Settings" }) => {
    const [searchValue, setSearchValue] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
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
        reset();
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await createSetting(data).unwrap();
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
                    <Textinput
                        label="Key"
                        name="key"
                        type="text"
                        placeholder="Enter setting key"
                        register={register}
                        error={errors.key}
                    />
                    <Textinput
                        label="Value"
                        name="value"
                        type="text"
                        placeholder="Enter setting value"
                        register={register}
                        error={errors.value}
                    />
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
