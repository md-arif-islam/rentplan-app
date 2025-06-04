import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { useCreateCustomerMutation } from "@/store/api/customers/customersApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    first_name: yup
        .string()
        .required("First name is required")
        .max(255, "First name cannot exceed 255 characters"),
    last_name: yup
        .string()
        .required("Last name is required")
        .max(255, "Last name cannot exceed 255 characters"),
    email: yup
        .string()
        .email("Please enter a valid email address")
        .nullable()
        .max(255, "Email cannot exceed 255 characters"),
    phone: yup.string().nullable().max(50, "Phone cannot exceed 50 characters"),
    street: yup
        .string()
        .nullable()
        .max(255, "Street cannot exceed 255 characters"),
    house_number: yup
        .string()
        .nullable()
        .max(50, "House number cannot exceed 50 characters"),
    postal_code: yup
        .string()
        .nullable()
        .max(20, "Postal code cannot exceed 20 characters"),
    city: yup.string().nullable().max(100, "City cannot exceed 100 characters"),
    country: yup
        .string()
        .nullable()
        .max(100, "Country cannot exceed 100 characters"),
    date_of_birth: yup
        .date()
        .nullable()
        .typeError("Please enter a valid date")
        .transform((value) => (value ? new Date(value) : null)),
    woocommerce_customer_id: yup
        .number()
        .nullable()
        .integer("WooCommerce ID must be an integer")
        .transform((value) => (isNaN(value) ? null : value)),
});

const CustomerCreate = () => {
    const navigate = useNavigate();
    const [createCustomer, { isLoading }] = useCreateCustomerMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            street: "",
            house_number: "",
            postal_code: "",
            city: "",
            country: "",
            date_of_birth: null,
            woocommerce_customer_id: null,
        },
    });

    const onSubmit = async (formData) => {
        try {
            await createCustomer(formData).unwrap();
            toast.success("Customer created successfully");
            navigate("/company/customers");
        } catch (error) {
            console.error("Create failed", error);

            if (error?.data?.errors) {
                Object.entries(error.data.errors).forEach(
                    ([field, messages]) => {
                        setError(field, {
                            type: "manual",
                            message: messages[0],
                        });
                    }
                );
            } else {
                toast.error(
                    error?.data?.message || "Failed to create customer"
                );
            }
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Create New Customer
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/company/customers")}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="Personal Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="First Name *"
                            type="text"
                            placeholder="Enter first name"
                            register={register}
                            name="first_name"
                            error={errors.first_name}
                        />
                        <Textinput
                            label="Last Name *"
                            type="text"
                            placeholder="Enter last name"
                            register={register}
                            name="last_name"
                            error={errors.last_name}
                        />
                        <Textinput
                            label="Email"
                            type="email"
                            placeholder="Enter email address"
                            register={register}
                            name="email"
                            error={errors.email}
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone number"
                            register={register}
                            name="phone"
                            error={errors.phone}
                        />
                        <Textinput
                            label="Date of Birth"
                            type="date"
                            placeholder="Select date of birth"
                            register={register}
                            name="date_of_birth"
                            error={errors.date_of_birth}
                        />
                    </div>
                </Card>

                <Card title="Address Information" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Street"
                            type="text"
                            placeholder="Enter street name"
                            register={register}
                            name="street"
                            error={errors.street}
                        />
                        <Textinput
                            label="House Number"
                            type="text"
                            placeholder="Enter house number"
                            register={register}
                            name="house_number"
                            error={errors.house_number}
                        />
                        <Textinput
                            label="Postal Code"
                            type="text"
                            placeholder="Enter postal code"
                            register={register}
                            name="postal_code"
                            error={errors.postal_code}
                        />
                        <Textinput
                            label="City"
                            type="text"
                            placeholder="Enter city"
                            register={register}
                            name="city"
                            error={errors.city}
                        />
                        <Textinput
                            label="Country"
                            type="text"
                            placeholder="Enter country"
                            register={register}
                            name="country"
                            error={errors.country}
                        />
                    </div>
                </Card>

                <Card title="Integration Information" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="WooCommerce Customer ID"
                            type="number"
                            placeholder="Enter WooCommerce ID (optional)"
                            register={register}
                            name="woocommerce_customer_id"
                            error={errors.woocommerce_customer_id}
                        />
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/company/customers")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:plus"
                        text="Create Customer"
                        className="btn-dark"
                        isLoading={isLoading || isSubmitting}
                        disabled={isLoading || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default CustomerCreate;
