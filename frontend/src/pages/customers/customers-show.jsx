import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useGetCustomerQuery } from "@/store/api/customers/customersApiSlice";
import { useNavigate, useParams } from "react-router-dom";
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
                        onClick={() => navigate("/company/customers")}
                    />
                </div>
            </Card>
        );
    }

    const fullName = `${customer.first_name} ${customer.last_name}`.trim();
    const address = [
        customer.street,
        customer.house_number,
        customer.postal_code,
        customer.city,
        customer.country,
    ]
        .filter(Boolean)
        .join(", ");

    // Format date of birth
    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US").format(date);
    };

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
                        onClick={() => navigate("/company/customers")}
                    />
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit"
                        className="btn-dark"
                        onClick={() =>
                            navigate(`/company/customers/${id}/edit`)
                        }
                    />
                </div>
            </div>

            {/* Customer Details */}
            <Card title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Name</div>
                        <div className="font-medium text-slate-900">
                            {fullName}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Email</div>
                        <div className="font-medium text-slate-900">
                            {customer.email || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Phone</div>
                        <div className="font-medium text-slate-900">
                            {customer.phone || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Date of Birth
                        </div>
                        <div className="font-medium text-slate-900">
                            {formatDate(customer.date_of_birth)}
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Address Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Full Address
                        </div>
                        <div className="font-medium text-slate-900">
                            {address || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Street</div>
                        <div className="font-medium text-slate-900">
                            {customer.street || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            House Number
                        </div>
                        <div className="font-medium text-slate-900">
                            {customer.house_number || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                            Postal Code
                        </div>
                        <div className="font-medium text-slate-900">
                            {customer.postal_code || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">City</div>
                        <div className="font-medium text-slate-900">
                            {customer.city || "—"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-400">Country</div>
                        <div className="font-medium text-slate-900">
                            {customer.country || "—"}
                        </div>
                    </div>
                </div>
            </Card>

            {customer.woocommerce_customer_id && (
                <Card title="Integration Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="text-sm text-slate-400">
                                WooCommerce Customer ID
                            </div>
                            <div className="font-medium text-slate-900">
                                {customer.woocommerce_customer_id}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Customers"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/customers")}
                />
                <Button
                    icon="heroicons:pencil-square"
                    text="Edit Customer"
                    className="btn-dark"
                    onClick={() => navigate(`/company/customers/${id}/edit`)}
                />
            </div>
        </div>
    );
};

export default CustomerShow;
