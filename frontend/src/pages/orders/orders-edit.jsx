import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import { useGetCustomersQuery } from "@/store/api/customers/customersApiSlice";
import {
    useGetOrderQuery,
    useUpdateOrderMutation,
} from "@/store/api/orders/ordersApiSlice";
import { useGetProductsQuery } from "@/store/api/products/productsApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    customer_id: yup.number().required("Customer is required"),
    product_id: yup.number().required("Product is required"),
    start_date: yup.date().required("Start date is required"),
    end_date: yup
        .date()
        .required("End date is required")
        .min(yup.ref("start_date"), "End date must be after start date"),
    order_status: yup.string().required("Order status is required"),
    invoice_street: yup.string().nullable(),
    invoice_postal_code: yup.string().nullable(),
    invoice_house_number: yup.string().nullable(),
    invoice_city: yup.string().nullable(),
    invoice_country: yup.string().nullable(),
    delivery_street: yup.string().nullable(),
    delivery_postal_code: yup.string().nullable(),
    delivery_house_number: yup.string().nullable(),
    delivery_city: yup.string().nullable(),
    delivery_country: yup.string().nullable(),
    woocommerce_order_id: yup
        .number()
        .nullable()
        .transform((value) =>
            isNaN(value) || value === "" ? null : Number(value)
        ),
});

const OrderEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: order,
        isLoading: isLoadingOrder,
        isError,
        error,
    } = useGetOrderQuery(id);
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [useDeliveryAddress, setUseDeliveryAddress] = useState(false);

    // Fetch customers for dropdown
    const { data: customers, isLoading: isLoadingCustomers } =
        useGetCustomersQuery({
            search: customerSearch,
            perPage: 100,
        });

    // Fetch products for dropdown
    const { data: products, isLoading: isLoadingProducts } =
        useGetProductsQuery({
            search: productSearch,
            perPage: 100,
        });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            customer_id: "",
            product_id: "",
            start_date: "",
            end_date: "",
            order_status: "pending",
            invoice_street: "",
            invoice_postal_code: "",
            invoice_house_number: "",
            invoice_city: "",
            invoice_country: "",
            delivery_street: "",
            delivery_postal_code: "",
            delivery_house_number: "",
            delivery_city: "",
            delivery_country: "",
            woocommerce_order_id: "",
        },
    });

    // Set form values when order data is loaded
    useEffect(() => {
        if (order) {
            reset({
                customer_id: order.customer_id,
                product_id: order.product_id,
                start_date: order.start_date
                    ? new Date(order.start_date).toISOString().split("T")[0]
                    : "",
                end_date: order.end_date
                    ? new Date(order.end_date).toISOString().split("T")[0]
                    : "",
                order_status: order.order_status || "pending",
                invoice_street: order.invoice_street || "",
                invoice_postal_code: order.invoice_postal_code || "",
                invoice_house_number: order.invoice_house_number || "",
                invoice_city: order.invoice_city || "",
                invoice_country: order.invoice_country || "",
                delivery_street: order.delivery_street || "",
                delivery_postal_code: order.delivery_postal_code || "",
                delivery_house_number: order.delivery_house_number || "",
                delivery_city: order.delivery_city || "",
                delivery_country: order.delivery_country || "",
                woocommerce_order_id: order.woocommerce_order_id || "",
            });

            // Check if delivery address is the same as invoice address
            const sameAddress =
                order.invoice_street === order.delivery_street &&
                order.invoice_postal_code === order.delivery_postal_code &&
                order.invoice_house_number === order.delivery_house_number &&
                order.invoice_city === order.delivery_city &&
                order.invoice_country === order.delivery_country;

            setUseDeliveryAddress(sameAddress);
        }
    }, [order, reset]);

    // Watch invoice address values
    const invoiceStreet = watch("invoice_street");
    const invoicePostalCode = watch("invoice_postal_code");
    const invoiceHouseNumber = watch("invoice_house_number");
    const invoiceCity = watch("invoice_city");
    const invoiceCountry = watch("invoice_country");

    // Copy invoice address to delivery address when toggled
    useEffect(() => {
        if (useDeliveryAddress) {
            setValue("delivery_street", invoiceStreet);
            setValue("delivery_postal_code", invoicePostalCode);
            setValue("delivery_house_number", invoiceHouseNumber);
            setValue("delivery_city", invoiceCity);
            setValue("delivery_country", invoiceCountry);
        }
    }, [
        useDeliveryAddress,
        invoiceStreet,
        invoicePostalCode,
        invoiceHouseNumber,
        invoiceCity,
        invoiceCountry,
        setValue,
    ]);

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    const onSubmit = async (data) => {
        try {
            await updateOrder({
                id,
                ...data,
            }).unwrap();
            toast.success("Order updated successfully");
            navigate("/company/orders");
        } catch (error) {
            console.error("Update failed", error);

            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to update order");
            }
        }
    };

    if (isLoadingOrder || isLoadingCustomers || isLoadingProducts) {
        return <LoadingContent />;
    }

    if (isError) {
        return (
            <Card>
                <div className="flex flex-col items-center justify-center h-60">
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

    // Convert customers and products arrays to select options
    const customerOptions =
        customers?.data?.map((customer) => ({
            value: customer.id,
            label: `${customer.first_name} ${customer.last_name} (${
                customer.email || "No email"
            })`,
        })) || [];

    const productOptions =
        products?.data?.map((product) => ({
            value: product.id,
            label: `${product.name}`,
        })) || [];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Order #{id}
                </h4>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/orders")}
                    />
                    <Button
                        icon="heroicons-outline:eye"
                        text="View"
                        className="btn-outline-dark"
                        onClick={() => navigate(`/company/orders/${id}`)}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="Order Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Customer Selection */}
                        <div>
                            <label className="form-label">Customer *</label>
                            <Select
                                options={customerOptions}
                                value={watch("customer_id")}
                                onChange={(e) =>
                                    setValue(
                                        "customer_id",
                                        Number(e.target.value)
                                    )
                                }
                                error={errors.customer_id}
                                noOptionsMessage={() => "No customers found"}
                            />
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="form-label">Product *</label>
                            <Select
                                options={productOptions}
                                value={watch("product_id")}
                                onChange={(e) =>
                                    setValue(
                                        "product_id",
                                        Number(e.target.value)
                                    )
                                }
                                error={errors.product_id}
                                noOptionsMessage={() => "No products found"}
                            />
                        </div>

                        {/* Start & End Dates */}
                        <Textinput
                            label="Start Date *"
                            type="date"
                            register={register}
                            name="start_date"
                            error={errors.start_date}
                        />
                        <Textinput
                            label="End Date *"
                            type="date"
                            register={register}
                            name="end_date"
                            error={errors.end_date}
                        />

                        {/* Order Status */}
                        <div>
                            <label className="form-label">Status *</label>
                            <Select
                                options={statusOptions}
                                value={watch("order_status")}
                                onChange={(e) =>
                                    setValue("order_status", e.target.value)
                                }
                                error={errors.order_status}
                            />
                        </div>

                        {/* WooCommerce ID */}
                        <Textinput
                            label="WooCommerce Order ID (Optional)"
                            type="number"
                            register={register}
                            name="woocommerce_order_id"
                            error={errors.woocommerce_order_id}
                        />
                    </div>
                </Card>

                <Card title="Invoice Address" className="mt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Textinput
                            label="Street"
                            register={register}
                            name="invoice_street"
                            error={errors.invoice_street}
                        />
                        <Textinput
                            label="House Number"
                            register={register}
                            name="invoice_house_number"
                            error={errors.invoice_house_number}
                        />
                        <Textinput
                            label="Postal Code"
                            register={register}
                            name="invoice_postal_code"
                            error={errors.invoice_postal_code}
                        />
                        <Textinput
                            label="City"
                            register={register}
                            name="invoice_city"
                            error={errors.invoice_city}
                        />
                        <Textinput
                            label="Country"
                            register={register}
                            name="invoice_country"
                            error={errors.invoice_country}
                        />
                    </div>
                </Card>

                <Card title="Delivery Address" className="mt-5">
                    <div className="mb-5">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox rounded text-primary-500 border-slate-300"
                                checked={useDeliveryAddress}
                                onChange={() =>
                                    setUseDeliveryAddress(!useDeliveryAddress)
                                }
                            />
                            <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">
                                Same as invoice address
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Textinput
                            label="Street"
                            register={register}
                            name="delivery_street"
                            error={errors.delivery_street}
                            disabled={useDeliveryAddress}
                        />
                        <Textinput
                            label="House Number"
                            register={register}
                            name="delivery_house_number"
                            error={errors.delivery_house_number}
                            disabled={useDeliveryAddress}
                        />
                        <Textinput
                            label="Postal Code"
                            register={register}
                            name="delivery_postal_code"
                            error={errors.delivery_postal_code}
                            disabled={useDeliveryAddress}
                        />
                        <Textinput
                            label="City"
                            register={register}
                            name="delivery_city"
                            error={errors.delivery_city}
                            disabled={useDeliveryAddress}
                        />
                        <Textinput
                            label="Country"
                            register={register}
                            name="delivery_country"
                            error={errors.delivery_country}
                            disabled={useDeliveryAddress}
                        />
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/orders")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Update Order"
                        className="btn-dark"
                        isLoading={isUpdating}
                    />
                </div>
            </form>
        </div>
    );
};

export default OrderEdit;
