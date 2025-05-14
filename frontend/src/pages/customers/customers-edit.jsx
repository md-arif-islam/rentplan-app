import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import {
    useGetCustomerEditDataQuery,
    useUpdateCustomerMutation,
} from "@/store/api/customers/customersApiSlice";
import { setCustomer } from "@/store/api/customers/customersSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CustomersEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showAgentFields, setShowAgentFields] = useState(false);

    // Fetch customer data from API
    const { data, isLoading, error } = useGetCustomerEditDataQuery(id);

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setCustomer(data));
            setShowAgentFields(data.customer?.agent || false);
        }
    }, [data, isLoading, dispatch]);

    const customer = useSelector((state) => state.customers.customer) || {};

    const [updateCustomer, { isLoading: isUpdating }] =
        useUpdateCustomerMutation();

    const sectorOptions = [
        { value: "snijplanten", label: "Snijplanten" },
        { value: "tuinplanten", label: "Tuinplanten" },
        { value: "handel", label: "Handel" },
        { value: "agent", label: "Agent" },
    ];

    const currencyOptions = [
        { value: "EUR", label: "Euro (EUR)" },
        { value: "USD", label: "US Dollar (USD)" },
    ];

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "nl", label: "Dutch" },
        { value: "de", label: "German" },
    ];

    const handleAgentChange = (checked) => {
        dispatch(
            setCustomer({
                ...customer,
                customer: {
                    ...customer.customer,
                    agent: checked,
                },
            })
        );
        setShowAgentFields(checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Customer data to be updated:", customer.customer);

        try {
            await updateCustomer(customer.customer).unwrap();
            toast.success("Customer updated successfully");
            navigate("/admin/customers");
        } catch (error) {
            console.error("Error updating customer:", error);
            toast.error(error?.data?.message || "Failed to update customer");
        }
    };

    if (isLoading || !customer || Object.keys(customer).length === 0) {
        return (
            <Card>
                <LoadingContent />
            </Card>
        );
    }

    if (error) {
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

    return (
        <div className="space-y-5">
            {/* Header and action buttons */}
            <div className="flex flex-wrap justify-between items-center">
                <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    Edit Customer
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/customers")}
                    />
                    <Link to={`/admin/customers/${id}`}>
                        <Button
                            icon="heroicons-outline:eye"
                            text="View Details"
                            className="btn-outline-dark"
                        />
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Company details */}
                <Card title="Company Information">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Company Name"
                            type="text"
                            placeholder="Enter company name"
                            defaultValue={customer.customer.company_name}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            company_name: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Textinput
                            label="Representative"
                            type="text"
                            placeholder="Enter representative"
                            defaultValue={customer.customer.representive}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            representive: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <div className="flex items-center mt-7">
                            <Checkbox
                                label="Is Active"
                                value={customer.customer.is_active || false}
                                activeClass="ring-primary-500 bg-primary-500"
                                onChange={(e) =>
                                    dispatch(
                                        setCustomer({
                                            ...customer,
                                            customer: {
                                                ...customer.customer,
                                                is_active: e.target.checked,
                                            },
                                        })
                                    )
                                }
                            />
                        </div>

                        <Select
                            label="Sector"
                            options={sectorOptions}
                            value={customer.customer.sector || ""}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            sector: e.target.value,
                                        },
                                    })
                                )
                            }
                            placeholder="Select a sector"
                        />

                        <Select
                            label="Currency"
                            options={currencyOptions}
                            value={customer.customer.currency || ""}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            currency: e.target.value,
                                        },
                                    })
                                )
                            }
                            placeholder="Select a currency"
                        />

                        <Select
                            label="Language"
                            options={languageOptions}
                            value={customer.customer.language || ""}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            language: e.target.value,
                                        },
                                    })
                                )
                            }
                            placeholder="Select a language"
                        />
                    </div>
                </Card>

                {/* Contact information */}
                <Card title="Contact Information" className="mt-5">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Phone"
                            type="text"
                            placeholder="Enter phone"
                            defaultValue={customer.customer.phone}
                            icon="heroicons-outline:phone"
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            phone: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Textinput
                            label="Email"
                            type="email"
                            placeholder="Enter email"
                            defaultValue={customer.customer.email}
                            icon="heroicons-outline:mail"
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            email: e.target.value,
                                        },
                                    })
                                )
                            }
                        />
                    </div>
                </Card>

                {/* Address information */}
                <Card title="Address" className="mt-5">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <Textinput
                            label="Address"
                            type="text"
                            placeholder="Enter address"
                            defaultValue={customer.customer.address}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            address: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Textinput
                            label="City"
                            type="text"
                            placeholder="Enter city"
                            defaultValue={customer.customer.city}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            city: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Textinput
                            label="Postal Code"
                            type="text"
                            placeholder="Enter postal code"
                            defaultValue={customer.customer.post_code}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            post_code: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Select
                            label="Country"
                            options={
                                customer.countries
                                    ? customer.countries.map((country) => ({
                                          value: country.id,
                                          label: country.name,
                                      }))
                                    : []
                            }
                            value={customer.customer.country_id || ""}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            country_id: e.target.value,
                                        },
                                    })
                                )
                            }
                            placeholder="Select a country"
                        />
                    </div>
                </Card>

                {/* Agent Information */}
                <Card title="Agent Information" className="mt-5">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <div className="flex items-center">
                            <Checkbox
                                label="Has Agent"
                                value={customer.customer.agent || false}
                                activeClass="ring-primary-500 bg-primary-500"
                                onChange={(e) =>
                                    handleAgentChange(e.target.checked)
                                }
                            />
                        </div>

                        {showAgentFields && (
                            <>
                                <Select
                                    label="Agent"
                                    options={
                                        customer.agents
                                            ? customer.agents.map((agent) => ({
                                                  value: agent.id,
                                                  label: agent.name,
                                              }))
                                            : []
                                    }
                                    value={customer.customer.agent_id || ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setCustomer({
                                                ...customer,
                                                customer: {
                                                    ...customer.customer,
                                                    agent_id: e.target.value,
                                                },
                                            })
                                        )
                                    }
                                    placeholder="Select an agent"
                                />

                                <Textinput
                                    label="Agent Percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Enter agent percentage"
                                    defaultValue={
                                        customer.customer.agent_percentage || ""
                                    }
                                    onChange={(e) =>
                                        dispatch(
                                            setCustomer({
                                                ...customer,
                                                customer: {
                                                    ...customer.customer,
                                                    agent_percentage:
                                                        e.target.value,
                                                },
                                            })
                                        )
                                    }
                                />
                            </>
                        )}
                    </div>
                </Card>

                {/* Tax Information */}
                <Card title="Tax Information" className="mt-5">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                        <Select
                            label="Holder Tax"
                            options={
                                customer.holders_taxes
                                    ? customer.holders_taxes.map((tax) => ({
                                          value: tax.id,
                                          label: `${tax.country.name} (${tax.percentage}%)`,
                                      }))
                                    : []
                            }
                            value={customer.customer.holder_tax_id || ""}
                            onChange={(e) =>
                                dispatch(
                                    setCustomer({
                                        ...customer,
                                        customer: {
                                            ...customer.customer,
                                            holder_tax_id: e.target.value,
                                        },
                                    })
                                )
                            }
                            placeholder="Select a holder tax"
                        />
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-5">
                    <Button
                        type="button"
                        icon="heroicons-outline:arrow-left"
                        text="Cancel"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/customers")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:save"
                        text="Save Changes"
                        className="btn-dark"
                        isLoading={isUpdating}
                    />
                </div>
            </form>
        </div>
    );
};

export default CustomersEdit;
