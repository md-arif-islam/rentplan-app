import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import {
    useGetCompanyQuery,
    useUpdateCompanyMutation,
} from "@/store/api/companies/companiesApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
    name: yup
        .string()
        .required("Company name is required")
        .max(255, "Company name cannot exceed 255 characters"),
    email: yup
        .string()
        .required("Email is required")
        .email("Please enter a valid email address")
        .max(255, "Email cannot exceed 255 characters"),
    phone: yup.string().max(20, "Phone cannot exceed 20 characters"),
    website: yup
        .string()
        .url("Please enter a valid URL")
        .max(255, "Website URL cannot exceed 255 characters")
        .nullable(),
    address_line_1: yup
        .string()
        .max(255, "Address cannot exceed 255 characters")
        .nullable(),
    address_line_2: yup
        .string()
        .max(255, "Address cannot exceed 255 characters")
        .nullable(),
    city: yup.string().max(255, "City cannot exceed 255 characters").nullable(),
    state: yup
        .string()
        .max(255, "State cannot exceed 255 characters")
        .nullable(),
    postal_code: yup
        .string()
        .max(20, "Postal code cannot exceed 20 characters")
        .nullable(),
    country: yup
        .string()
        .max(255, "Country cannot exceed 255 characters")
        .nullable(),
    plan: yup.object().shape({
        plan_name: yup.string().required("Plan name is required"),
        plan_price: yup
            .number()
            .required("Plan price is required")
            .min(0, "Price cannot be negative"),
        plan_status: yup
            .string()
            .required("Plan status is required")
            .oneOf(
                ["active", "inactive", "trial", "expired"],
                "Invalid plan status"
            ),
        plan_start_date: yup.date().required("Start date is required"),
        plan_expiry_date: yup
            .date()
            .required("Expiry date is required")
            .min(
                yup.ref("plan_start_date"),
                "Expiry date must be after start date"
            ),
    }),
});

const CompanyEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [updateCompany, { isLoading: isUpdating }] =
        useUpdateCompanyMutation();

    const { data: company, isLoading, isError, error } = useGetCompanyQuery(id);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    // Initialize form with company data when available
    useEffect(() => {
        if (company) {
            reset({
                name: company.name || "",
                email: company.email || "",
                phone: company.phone || "",
                website: company.website || "",
                address_line_1: company.address_line_1 || "",
                address_line_2: company.address_line_2 || "",
                city: company.city || "",
                state: company.state || "",
                postal_code: company.postal_code || "",
                country: company.country || "",
                logo: company.logo || null,
                plan: company.plan || {
                    plan_name: "Basic",
                    plan_price: 0,
                    plan_status: "active",
                    plan_features: ["basic_features"],
                    plan_start_date: new Date().toISOString().split("T")[0],
                    plan_expiry_date: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    )
                        .toISOString()
                        .split("T")[0],
                },
            });
        }
    }, [company, reset]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue("logo", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const onSubmit = async (formData) => {
        try {
            await updateCompany({ id, ...formData }).unwrap();
            toast.success("Company updated successfully");
            navigate("/admin/companies");
        } catch (error) {
            console.error("Update failed", error);

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
                toast.error(error?.data?.message || "Failed to update company");
            }
        }
    };

    // Determine logo preview source
    const logoValue = watch("logo");
    const logoPreview = logoValue
        ? logoValue.startsWith("data:")
            ? logoValue
            : `${import.meta.env.VITE_API_URL}/${logoValue}`
        : null;

    const planStatusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "trial", label: "Trial" },
        { value: "expired", label: "Expired" },
    ];

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
                        Error Loading Data
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                        {error?.data?.message ||
                            "Could not load company information"}
                    </p>
                    <Button
                        text="Back to Companies"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/admin/companies")}
                    />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Company
                </h4>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/companies")}
                    />
                    <Button
                        icon="heroicons-outline:eye"
                        text="View Details"
                        className="btn-outline-dark"
                        onClick={() => navigate(`/admin/companies/${id}`)}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card title="Company Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Company Name *"
                            type="text"
                            placeholder="Enter company name"
                            register={register}
                            name="name"
                            error={errors.name}
                        />
                        <Textinput
                            label="Email *"
                            type="email"
                            placeholder="Enter company email"
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
                            label="Website"
                            type="url"
                            placeholder="Enter website URL"
                            register={register}
                            name="website"
                            error={errors.website}
                        />
                    </div>
                </Card>

                <Card title="Address Information" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Address Line 1"
                            type="text"
                            placeholder="Enter address line 1"
                            register={register}
                            name="address_line_1"
                            error={errors.address_line_1}
                        />
                        <Textinput
                            label="Address Line 2"
                            type="text"
                            placeholder="Enter address line 2"
                            register={register}
                            name="address_line_2"
                            error={errors.address_line_2}
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
                            label="State/Province"
                            type="text"
                            placeholder="Enter state or province"
                            register={register}
                            name="state"
                            error={errors.state}
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
                            label="Country"
                            type="text"
                            placeholder="Enter country"
                            register={register}
                            name="country"
                            error={errors.country}
                        />
                    </div>
                </Card>

                <Card title="Company Logo" className="mt-5">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        <div>
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="h-20 w-20 object-contain border border-slate-200 rounded-lg bg-slate-50"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Icon
                                        icon="heroicons-outline:office-building"
                                        className="text-3xl text-slate-400"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <Button
                                text="Change Logo"
                                icon="heroicons-outline:upload"
                                className="btn-outline-dark"
                                onClick={handleFileUploadClick}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Supported formats: JPG, PNG, GIF (Max size: 2MB)
                            </p>
                        </div>
                    </div>
                </Card>

                <Card title="Plan Information" className="mt-5">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Plan Name"
                            type="text"
                            placeholder="Enter plan name"
                            register={register}
                            name="plan.plan_name"
                            error={errors.plan?.plan_name}
                        />
                        <Textinput
                            label="Price"
                            type="number"
                            placeholder="Enter price"
                            register={register}
                            name="plan.plan_price"
                            step="0.01"
                            min="0"
                            error={errors.plan?.plan_price}
                        />
                        <Select
                            label="Status"
                            options={planStatusOptions}
                            value={watch("plan.plan_status")}
                            onChange={(e) =>
                                setValue("plan.plan_status", e.target.value)
                            }
                            error={errors.plan?.plan_status}
                        />
                        <Textinput
                            label="Start Date"
                            type="date"
                            register={register}
                            name="plan.plan_start_date"
                            error={errors.plan?.plan_start_date}
                        />
                        <Textinput
                            label="Expiry Date"
                            type="date"
                            register={register}
                            name="plan.plan_expiry_date"
                            error={errors.plan?.plan_expiry_date}
                        />
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:x"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/companies")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Update Company"
                        className="btn-dark"
                        isLoading={isUpdating || isSubmitting}
                        disabled={isUpdating || isSubmitting}
                    />
                </div>
            </form>
        </div>
    );
};

export default CompanyEdit;
