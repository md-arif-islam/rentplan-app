import SkeletionTable from "@/components/skeleton/Table";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import { useGetCustomersQuery } from "@/store/api/customers/customersApiSlice";
import { useCreateOrderMutation } from "@/store/api/orders/ordersApiSlice";
import { useGetProductsQuery } from "@/store/api/products/productsApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    customer_id: yup
        .number()
        .transform((value) =>
            isNaN(value) || value === "" ? undefined : value
        )
        .required("Customer is required")
        .typeError("Please select a customer"),
    product_id: yup
        .number()
        .transform((value) =>
            isNaN(value) || value === "" ? undefined : value
        )
        .required("Product is required")
        .typeError("Please select a product"),
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

const OrderCreate = () => {
    const navigate = useNavigate();
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [useDeliveryAddress, setUseDeliveryAddress] = useState(true);

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
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            customer_id: "",
            product_id: "",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
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

    // Watch customer and invoice address values
    const selectedCustomerId = watch("customer_id");
    const invoiceStreet = watch("invoice_street");
    const invoicePostalCode = watch("invoice_postal_code");
    const invoiceHouseNumber = watch("invoice_house_number");
    const invoiceCity = watch("invoice_city");
    const invoiceCountry = watch("invoice_country");

    // Find the selected customer
    const selectedCustomer = customers?.data?.find(
        (customer) => customer.id === parseInt(selectedCustomerId)
    );

    // Update invoice address when customer changes
    useEffect(() => {
        if (selectedCustomer) {
            setValue("invoice_street", selectedCustomer.street || "");
            setValue("invoice_postal_code", selectedCustomer.postal_code || "");
            setValue(
                "invoice_house_number",
                selectedCustomer.house_number || ""
            );
            setValue("invoice_city", selectedCustomer.city || "");
            setValue("invoice_country", selectedCustomer.country || "");
        }
    }, [selectedCustomer, setValue]);

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
            // Validate customer_id and product_id again before submission
            if (!data.customer_id || isNaN(Number(data.customer_id))) {
                toast.error("Please select a valid customer");
                return;
            }
            if (!data.product_id || isNaN(Number(data.product_id))) {
                toast.error("Please select a valid product");
                return;
            }

            // Ensure customer_id and product_id are numbers
            data.customer_id = Number(data.customer_id);
            data.product_id = Number(data.product_id);

            await createOrder(data).unwrap();
            toast.success("Order created successfully");
            navigate("/company/orders");
        } catch (error) {
            console.error("Create failed", error);

            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        toast.error(`${field}: ${messages[0]}`);
                    }
                );
            } else {
                toast.error(error?.data?.message || "Failed to create order");
            }
        }
    };

    if (isLoadingCustomers || isLoadingProducts) {
        return <SkeletionTable count={4} />;
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
                    Create New Order
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/orders")}
                />
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
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValue(
                                        "customer_id",
                                        value ? Number(value) : ""
                                    );
                                }}
                                error={errors.customer_id}
                                noOptionsMessage={() => "No customers found"}
                            />
                            {errors.customer_id && (
                                <div className="text-danger-500 text-sm mt-1">
                                    {errors.customer_id.message}
                                </div>
                            )}
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="form-label">Product *</label>
                            <Select
                                options={productOptions}
                                value={watch("product_id")}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValue(
                                        "product_id",
                                        value ? Number(value) : ""
                                    );
                                }}
                                error={errors.product_id}
                                noOptionsMessage={() => "No products found"}
                            />
                            {errors.product_id && (
                                <div className="text-danger-500 text-sm mt-1">
                                    {errors.product_id.message}
                                </div>
                            )}
                        </div>

                        {/* Start & End Dates */}
                        <Textinput
                            label="Start Date *"
                            type="date"
                            register={register}
                            name="start_date"
                            error={errors.start_date}
                            placeholder="Select start date"
                        />
                        <Textinput
                            label="End Date *"
                            type="date"
                            register={register}
                            name="end_date"
                            error={errors.end_date}
                            placeholder="Select end date"
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
                            placeholder="Enter WooCommerce ID if applicable"
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
                            placeholder="Enter street name"
                        />
                        <Textinput
                            label="House Number"
                            register={register}
                            name="invoice_house_number"
                            error={errors.invoice_house_number}
                            placeholder="Enter house number"
                        />
                        <Textinput
                            label="Postal Code"
                            register={register}
                            name="invoice_postal_code"
                            error={errors.invoice_postal_code}
                            placeholder="Enter postal code"
                        />
                        <Textinput
                            label="City"
                            register={register}
                            name="invoice_city"
                            error={errors.invoice_city}
                            placeholder="Enter city"
                        />
                        <Textinput
                            label="Country"
                            register={register}
                            name="invoice_country"
                            error={errors.invoice_country}
                            placeholder="Enter country"
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
                            placeholder="Enter street name"
                        />
                        <Textinput
                            label="House Number"
                            register={register}
                            name="delivery_house_number"
                            error={errors.delivery_house_number}
                            disabled={useDeliveryAddress}
                            placeholder="Enter house number"
                        />
                        <Textinput
                            label="Postal Code"
                            register={register}
                            name="delivery_postal_code"
                            error={errors.delivery_postal_code}
                            disabled={useDeliveryAddress}
                            placeholder="Enter postal code"
                        />
                        <Textinput
                            label="City"
                            register={register}
                            name="delivery_city"
                            error={errors.delivery_city}
                            disabled={useDeliveryAddress}
                            placeholder="Enter city"
                        />
                        <Textinput
                            label="Country"
                            register={register}
                            name="delivery_country"
                            error={errors.delivery_country}
                            disabled={useDeliveryAddress}
                            placeholder="Enter country"
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
                        icon="heroicons-outline:plus"
                        text="Create Order"
                        className="btn-dark"
                        isLoading={isCreating}
                    />
                </div>
            </form>
        </div>
    );
};

export default OrderCreate;
