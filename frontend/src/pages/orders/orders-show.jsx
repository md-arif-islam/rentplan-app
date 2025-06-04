import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { useGetOrderQuery } from "@/store/api/orders/ordersApiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const OrderShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: order, isLoading, isError, error } = useGetOrderQuery(id);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-success-500';
            case 'processing':
                return 'bg-info-500';
            case 'pending':
                return 'bg-warning-500';
            case 'cancelled':
                return 'bg-danger-500';
            default:
                return 'bg-slate-500';
        }
    };

    if (isLoading) {
        return <LoadingContent />;
    }

    if (isError) {
        toast.error(error?.data?.message || "Failed to load order details");
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
                            "Could not load order information"}
                    </p>
                    <Button
                        text="Back to Orders"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/company/orders")}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header and action buttons */}
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Order Details
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/orders")}
                    />
                    <Link to={`/company/orders/${id}/edit`}>
                        <Button
                            icon="heroicons:pencil-square"
                            text="Edit"
                            className="btn-dark"
                        />
                    </Link>
                </div>
            </div>

            {/* Order Summary */}
            <Card title="Order Summary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h5 className="text-sm text-slate-400 font-medium mb-1">Order Status</h5>
                            <Badge
                                label={order.order_status || "Unknown"}
                                className={getStatusColor(order.order_status)}
                            />
                        </div>

                        <div>
                            <h5 className="text-sm text-slate-400 font-medium mb-1">Customer</h5>
                            <p className="text-base text-slate-900 dark:text-white">
                                {order.customer?.first_name} {order.customer?.last_name}
                            </p>
                            <p className="text-sm text-slate-500">
                                {order.customer?.email || "No email"}
                            </p>
                            <p className="text-sm text-slate-500">
                                {order.customer?.phone || "No phone"}
                            </p>
                        </div>

                        <div>
                            <h5 className="text-sm text-slate-400 font-medium mb-1">Product</h5>
                            <p className="text-base text-slate-900 dark:text-white">
                                {order.product?.name || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h5 className="text-sm text-slate-400 font-medium mb-1">Order Dates</h5>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-1">Start Date</p>
                                    <p className="text-base text-slate-900 dark:text-white">
                                        {formatDate(order.start_date)}
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-1">End Date</p>
                                    <p className="text-base text-slate-900 dark:text-white">
                                        {formatDate(order.end_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-sm text-slate-400 font-medium mb-1">Order Details</h5>
                            <p className="text-sm text-slate-500">
                                Order created on {formatDate(order.created_at)}
                            </p>
                            {order.woocommerce_order_id && (
                                <p className="text-sm text-slate-500">
                                    WooCommerce Order ID: {order.woocommerce_order_id}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Address Information */}
            <Card title="Address Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Invoice Address */}
                    <div>
                        <h5 className="text-base font-medium mb-3">Invoice Address</h5>
                        <div className="space-y-1">
                            <p className="text-sm">
                                {order.invoice_street || "Not specified"} {order.invoice_house_number || ""}
                            </p>
                            <p className="text-sm">
                                {order.invoice_postal_code || ""} {order.invoice_city || ""}
                            </p>
                            <p className="text-sm">{order.invoice_country || ""}</p>
                        </div>
                    </div>
                    
                    {/* Delivery Address */}
                    <div>
                        <h5 className="text-base font-medium mb-3">Delivery Address</h5>
                        <div className="space-y-1">
                            <p className="text-sm">
                                {order.delivery_street || "Not specified"} {order.delivery_house_number || ""}
                            </p>
                            <p className="text-sm">
                                {order.delivery_postal_code || ""} {order.delivery_city || ""}
                            </p>
                            <p className="text-sm">{order.delivery_country || ""}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Product Details */}
            <Card title="Product Details">
                {order.product ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 col-span-2">
                            <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                                {order.product.image_url ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/${order.product.image_url}`}
                                        alt={order.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700">
                                        <Icon icon="heroicons-outline:photograph" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h5 className="text-base font-medium">{order.product.name}</h5>
                                <p className="text-sm text-slate-500">
                                    {order.product.type === 0 ? "Simple Product" : "Variable Product"}
                                </p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <Link to={`/company/products/${order.product.id}`}>
                                <Button
                                    icon="heroicons-outline:eye"
                                    text="View Product"
                                    className="btn-outline-dark btn-sm"
                                />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-slate-500">No product information available</p>
                    </div>
                )}
            </Card>

            {/* Action buttons at the bottom */}
            <div className="flex justify-between">
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back to Orders"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/orders")}
                />
                <Link to={`/company/orders/${id}/edit`}>
                    <Button
                        icon="heroicons:pencil-square"
                        text="Edit Order"
                        className="btn-dark"
                    />
                </Link>
            </div>
        </div>
    );
};

export default OrderShow;
