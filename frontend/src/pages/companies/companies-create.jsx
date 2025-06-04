import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import { useCreateCompanyMutation } from "@/store/api/companies/companiesApiSlice";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CompanyCreate = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [createCompany, { isLoading }] = useCreateCompanyMutation();

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
        admin_email: "",
        admin_password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
            await createCompany(formData).unwrap();
            toast.success("Company created successfully");
            navigate("/admin/companies");
        } catch (error) {
            console.error("Error creating company:", error);
            toast.error(error?.data?.message || "Failed to create company");

            // Display validation errors
            if (error?.data?.errors) {
                Object.keys(error.data.errors).forEach((field) => {
                    toast.error(`${field}: ${error.data.errors[field][0]}`);
                });
            }
        }
    };

    const logoPreview = formData.logo ? formData.logo : null;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Create New Company
                </h4>
                <Button
                    icon="heroicons-outline:arrow-left"
                    text="Back"
                    className="btn-outline-dark"
                    onClick={() => navigate("/admin/companies")}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <Card title="Company Information">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Company Name *"
                            type="text"
                            placeholder="Enter company name"
                            defaultValue={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Textinput
                            label="Email *"
                            type="email"
                            placeholder="Enter company email"
                            defaultValue={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone number"
                            defaultValue={formData.phone}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Website"
                            type="url"
                            placeholder="Enter website URL"
                            defaultValue={formData.website}
                            onChange={handleChange}
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
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Address Line 2"
                            type="text"
                            placeholder="Enter address line 2"
                            defaultValue={formData.address_line_2}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="City"
                            type="text"
                            placeholder="Enter city"
                            defaultValue={formData.city}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="State/Province"
                            type="text"
                            placeholder="Enter state or province"
                            defaultValue={formData.state}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Postal Code"
                            type="text"
                            placeholder="Enter postal code"
                            defaultValue={formData.postal_code}
                            onChange={handleChange}
                        />
                        <Textinput
                            label="Country"
                            type="text"
                            placeholder="Enter country"
                            defaultValue={formData.country}
                            onChange={handleChange}
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
                                text="Upload Logo"
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
                        icon="heroicons-outline:plus"
                        text="Create Company"
                        className="btn-dark"
                        isLoading={isLoading}
                    />
                </div>
            </form>
        </div>
    );
};

export default CompanyCreate;
