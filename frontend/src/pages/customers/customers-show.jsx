import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCustomerQuery } from "@/store/api/customers/customersApiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CustomerShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        data: customer,
        isLoading,
        isError,
        error,
    } = useGetCustomerQuery(id);

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        toast.error(error?.data?.message || "Failed to load customer details");
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
                    <Icon
                        icon="heroicons-outline:exclamation-circle"
                        className="text-danger-500 text-4xl mb-2"
                    />
                    <h3 className="text-xl font-medium text-slate-900">
                        Error Loading Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load customer information"}
                    </p>
                    <Button
                        text="Back to Customers"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/admin/customers")}
                    />
                </div>
            </Card>
        );
    }

    console.log(customer.holders_tax);

    return (
        <div className="space-y-5">
            {/* Header and action buttons */}
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Customer Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/customers")}
                    />
                    <Link to={`/admin/customers/${id}/edit`}>
                        <Button
                            icon="heroicons:pencil-square"
                            text="Edit"
                            className="btn-dark"
                        />
                    </Link>
                </div>
            </div>

            {/* Company details */}
            <Card title="Company Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Company Name
                        </div>
                        <div className="font-medium text-slate-900">
                            {customer?.company_name || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Representative
                        </div>
                        <div className="font-medium text-slate-900">
                            {customer?.representive || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Status</div>
                        <div className="font-medium">
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    customer?.is_active
                                        ? "bg-success-500 text-white"
                                        : "bg-danger-500 text-white"
                                }`}
                            >
                                {customer?.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Sector</div>
                        <div className="font-medium text-slate-900 capitalize">
                            {customer?.sector || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Currency</div>
                        <div className="font-medium text-slate-900">
                            {customer?.currency || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Language</div>
                        <div className="font-medium text-slate-900 uppercase">
                            {customer?.language || "—"}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Contact information */}
            <Card title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Phone</div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                            <Icon icon="heroicons-outline:phone" />
                            {customer?.phone || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Email</div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                            <Icon icon="heroicons-outline:mail" />
                            {customer?.email || "—"}
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 space-y-2">
                        <div className="text-sm text-slate-400">Created By</div>
                        <div className="font-medium text-slate-900">
                            {customer?.creator?.email ? (
                                <div className="flex items-center gap-2">
                                    <Icon icon="heroicons-outline:user-circle" />
                                    {customer.creator.email}
                                </div>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Address information */}
            <Card title="Address">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Address</div>
                        <div className="font-medium text-slate-900">
                            {customer?.address || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">City</div>
                        <div className="font-medium text-slate-900">
                            {customer?.city || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Postal Code
                        </div>
                        <div className="font-medium text-slate-900">
                            {customer?.post_code || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Country</div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                            {customer?.country?.name ? (
                                <>
                                    <span className="text-base inline-block">
                                        {customer.country.code}
                                    </span>
                                    {customer.country.name}
                                </>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Agent Information */}
            <Card title="Agent Information">
                {customer?.agent ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Agent Status
                            </div>
                            <div className="font-medium">
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-success-500 text-white">
                                    Has Agent
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Agent Name
                            </div>
                            <div className="font-medium text-slate-900">
                                {customer?.agent_relation?.name || "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Agent Percentage
                            </div>
                            <div className="font-medium text-slate-900">
                                {customer?.agent_percentage !== null ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary-500 font-bold">
                                            {customer.agent_percentage}%
                                        </span>
                                        <div className="w-20 bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                                            <div
                                                className="bg-primary-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        customer.agent_percentage
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    "—"
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-20">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                            No Agent Assigned
                        </span>
                    </div>
                )}
            </Card>

            {/* Tax Information */}
            <Card title="Tax Information">
                {customer?.holders_tax ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Tax Percentage
                            </div>
                            <div className="font-medium text-slate-900">
                                {customer.holders_tax.percentage !== null ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-warning-500 font-bold">
                                            {customer.holders_tax.percentage}%
                                        </span>
                                        <div className="w-20 bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                                            <div
                                                className="bg-warning-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        customer.holders_tax
                                                            .percentage
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    "—"
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Is Deductible
                            </div>
                            <div className="font-medium">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        customer.holders_tax.is_deductible
                                            ? "bg-success-500 text-white"
                                            : "bg-danger-500 text-white"
                                    }`}
                                >
                                    {customer.holders_tax.is_deductible
                                        ? "Yes"
                                        : "No"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                Tax Country
                            </div>
                            <div className="font-medium text-slate-900">
                                {customer.holders_tax.country?.name || "—"}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-20">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                            No Tax Information
                        </span>
                    </div>
                )}
            </Card>

            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Customers"
                    className="btn-outline-dark"
                    onClick={() => navigate("/admin/customers")}
                />
                <Link to={`/admin/customers/${id}/edit`}>
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit Customer"
                        className="btn-dark"
                    />
                </Link>
            </div>
        </div>
    );
};

export default CustomerShow;
