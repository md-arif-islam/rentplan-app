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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CompanyEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [updateCompany, { isLoading: isUpdating }] =
        useUpdateCompanyMutation();

    const { data: company, isLoading, isError, error } = useGetCompanyQuery(id);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        website: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        logo: null,
        plan: {
            plan_name: "Basic",
            plan_price: 0,
            plan_status: "active",
            plan_features: ["basic_features"],
            plan_start_date: new Date().toISOString().split("T")[0],
            plan_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        },
    });

    // Initialize form with company data when available
    useEffect(() => {
        if (company) {
            setFormData({
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
    }, [company]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePlanChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            plan: {
                ...formData.plan,
                [name]: value,
            },
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateCompany({ id, ...formData }).unwrap();
            toast.success("Company updated successfully");
            navigate("/admin/companies");
        } catch (error) {
            console.error("Error updating company:", error);
            toast.error(error?.data?.message || "Failed to update company");

            // Display validation errors
            if (error?.data?.errors) {
                Object.keys(error.data.errors).forEach((field) => {
                    toast.error(`${field}: ${error.data.errors[field][0]}`);
                });
            }
        }
    };

    // Determine logo preview source
    const logoPreview = formData.logo
        ? formData.logo.startsWith("data:")
            ? formData.logo
            : `${import.meta.env.VITE_API_URL}/${formData.logo}`
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

            <form onSubmit={handleSubmit}>
                <Card title="Company Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Company Name *"
                            type="text"
                            placeholder="Enter company name"
                            defaultValue={formData.name}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "name",
                                        value: e.target.value,
                                    },
                                })
                            }
                            required
                        />
                        <Textinput
                            label="Email *"
                            type="email"
                            placeholder="Enter company email"
                            defaultValue={formData.email}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "email",
                                        value: e.target.value,
                                    },
                                })
                            }
                            required
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone number"
                            defaultValue={formData.phone}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "phone",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Website"
                            type="url"
                            placeholder="Enter website URL"
                            defaultValue={formData.website}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "website",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                </Card>

                <Card title="Address Information" className="mt-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Address Line 1"
                            type="text"
                            placeholder="Enter address line 1"
                            defaultValue={formData.address_line_1}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "address_line_1",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Address Line 2"
                            type="text"
                            placeholder="Enter address line 2"
                            defaultValue={formData.address_line_2}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "address_line_2",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="City"
                            type="text"
                            placeholder="Enter city"
                            defaultValue={formData.city}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "city",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="State/Province"
                            type="text"
                            placeholder="Enter state or province"
                            defaultValue={formData.state}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "state",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Postal Code"
                            type="text"
                            placeholder="Enter postal code"
                            defaultValue={formData.postal_code}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "postal_code",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Country"
                            type="text"
                            placeholder="Enter country"
                            defaultValue={formData.country}
                            onChange={(e) =>
                                handleChange({
                                    target: {
                                        name: "country",
                                        value: e.target.value,
                                    },
                                })
                            }
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
                            defaultValue={formData.plan?.plan_name}
                            onChange={(e) =>
                                handlePlanChange({
                                    target: {
                                        name: "plan_name",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Price"
                            type="number"
                            placeholder="Enter price"
                            defaultValue={formData.plan?.plan_price}
                            step="0.01"
                            min="0"
                            onChange={(e) =>
                                handlePlanChange({
                                    target: {
                                        name: "plan_price",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Select
                            label="Status"
                            options={planStatusOptions}
                            value={formData.plan?.plan_status || "active"}
                            onChange={(e) =>
                                handlePlanChange({
                                    target: {
                                        name: "plan_status",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Start Date"
                            type="date"
                            defaultValue={formData.plan?.plan_start_date}
                            onChange={(e) =>
                                handlePlanChange({
                                    target: {
                                        name: "plan_start_date",
                                        value: e.target.value,
                                    },
                                })
                            }
                        />
                        <Textinput
                            label="Expiry Date"
                            type="date"
                            defaultValue={formData.plan?.plan_expiry_date}
                            onChange={(e) =>
                                handlePlanChange({
                                    target: {
                                        name: "plan_expiry_date",
                                        value: e.target.value,
                                    },
                                })
                            }
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
                        isLoading={isUpdating}
                    />
                </div>
            </form>
        </div>
    );
};

export default CompanyEdit;
