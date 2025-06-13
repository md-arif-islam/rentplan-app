import React from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import LoadingContent from "@/components/Loading";
import { useGetCompanySettingsMapQuery } from "@/store/api/settings/settingsApiSlice";

const CompanySettings = ({ title = "System Settings" }) => {
    const {
        data: settings,
        isLoading,
        isError,
        error,
    } = useGetCompanySettingsMapQuery();

    // Function to format setting values for display
    const formatSettingValue = (key, value) => {
        if (value === null || value === undefined) return "-";

        // Format date-related settings
        if (key.includes("date") && value && value.length > 0) {
            return value;
        }

        // Format boolean values
        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return value;
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
                        Error Loading Settings
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load settings information"}
                    </p>
                </div>
            </Card>
        );
    }

    const renderSettingGroups = () => {
        if (!settings || Object.keys(settings).length === 0) {
            return (
                <div className="text-center py-10">
                    <Icon
                        icon="heroicons-outline:cog"
                        className="inline-block text-4xl text-slate-400 mb-3"
                    />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                        No settings available
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        There are no system settings configured yet.
                    </p>
                </div>
            );
        }

        // Group settings for better display
        const dateTimeSettings = {};
        const generalSettings = {};

        Object.entries(settings).forEach(([key, value]) => {
            if (
                key.includes("date") ||
                key.includes("time") ||
                key.includes("timezone")
            ) {
                dateTimeSettings[key] = value;
            } else {
                generalSettings[key] = value;
            }
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time Settings */}
                {Object.keys(dateTimeSettings).length > 0 && (
                    <Card title="Date & Time Settings" className="h-full">
                        <div className="space-y-4">
                            {Object.entries(dateTimeSettings).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="grid grid-cols-2 gap-2 border-b border-gray-100 dark:border-slate-700 pb-4"
                                    >
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-300 capitalize">
                                            {key.replace(/_/g, " ")}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {formatSettingValue(key, value)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </Card>
                )}

                {/* General Settings */}
                {Object.keys(generalSettings).length > 0 && (
                    <Card title="General Settings" className="h-full">
                        <div className="space-y-4">
                            {Object.entries(generalSettings).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="grid grid-cols-2 gap-2 border-b border-gray-100 dark:border-slate-700 pb-4"
                                    >
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-300 capitalize">
                                            {key.replace(/_/g, " ")}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {formatSettingValue(key, value)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <>
            <Card>
                <div className="md:flex pb-6 items-center">
                    <h6 className="flex-1 md:mb-0 mb-3">{title}</h6>
                </div>

                <p className="text-slate-500 mb-6">
                    These are system-wide settings that affect the behavior and
                    appearance of the application. Contact the administrator if
                    you need to change any of these settings.
                </p>

                {renderSettingGroups()}
            </Card>
        </>
    );
};

export default CompanySettings;
