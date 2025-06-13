import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import LoadingContent from "@/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    useGetSettingQuery,
    useUpdateSettingMutation,
} from "@/store/api/settings/settingsApiSlice";

// Schema for the edit setting form
const schema = yup.object().shape({
    value: yup.string().nullable(),
});

const SettingsEdit = () => {
    const { key } = useParams();
    const navigate = useNavigate();

    const { data: setting, isLoading, isError, error } = useGetSettingQuery(key);
    const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
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
                Object.entries(error.data.errors).forEach(([field, messages]) => {
                    toast.error(`${field}: ${messages[0]}`);
                });
            } else {
                toast.error(error?.data?.message || "Failed to update setting");
            }
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
                        {error?.data?.message || "Could not load setting information"}
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
                        <Textarea
                            label="Value"
                            name="value"
                            placeholder="Enter setting value"
                            register={register}
                            error={errors.value}
                            rows={5}
                        />
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
