import LoadingContent from "@/components/Loading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import Icon from "@/components/ui/Icon";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import {
    useCreateBreederMutation,
    useGetCreateDataQuery,
} from "@/store/api/breeders/breedersApiSlice";
import { setBreeder } from "@/store/api/breeders/breedersSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BreedersCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showAgentFields, setShowAgentFields] = useState(false);

    // Fetch required data for creating a breeder
    const { data, isLoading, error } = useGetCreateDataQuery();

    // Initialize default breeder state
    useEffect(() => {
        if (!isLoading && data) {
            dispatch(
                setBreeder({
                    ...data,
                    breeder: {
                        company_name: "",
                        address: "",
                        city: "",
                        post_code: "",
                        country_id: "",
                        phone: "",
                        email: "",
                        representive: "",
                        language: "en",
                        is_active: true,
                        holder_tax_id: "",
                        agent: false,
                        agent_id: null,
                        agent_percentage: null,
                        sector: "",
                        currency: "EUR",
                    },
                })
            );
        }
    }, [data, isLoading, dispatch]);

    const breeder = useSelector((state) => state.breeders.breeder) || {};

    const [createBreeder, { isLoading: isCreating }] =
        useCreateBreederMutation();

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
            setBreeder({
                ...breeder,
                breeder: {
                    ...breeder.breeder,
                    agent: checked,
                    agent_id: checked ? breeder.breeder.agent_id : null,
                    agent_percentage: checked
                        ? breeder.breeder.agent_percentage
                        : null,
                },
            })
        );
        setShowAgentFields(checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createBreeder(breeder.breeder).unwrap();
            toast.success("Breeder created successfully");
            navigate("/admin/breeders");
        } catch (error) {
            console.error("Error creating breeder:", error);
            toast.error(error?.data?.message || "Failed to create breeder");
        }
    };

    if (isLoading || !breeder || Object.keys(breeder).length === 0) {
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
                            "Could not load required data to create a breeder"}
                    </p>
                    <Button
                        text="Back to Breeders"
                        icon="heroicons-outline:arrow-left"
                        className="btn-primary"
                        onClick={() => navigate("/admin/breeders")}
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
                    Create Breeder
                </h4>
                <div className="flex space-x-4 rtl:space-x-reverse">
                    <Button
                        icon="heroicons-outline:arrow-left"
                        text="Back"
                        className="btn-outline-dark"
                        onClick={() => navigate("/admin/breeders")}
                    />
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
                            value={breeder.breeder.company_name || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.representive || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
                                            representive: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <div className="flex items-center mt-7">
                            <Checkbox
                                label="Is Active"
                                value={breeder.breeder.is_active || false}
                                activeClass="ring-primary-500 bg-primary-500"
                                onChange={(e) =>
                                    dispatch(
                                        setBreeder({
                                            ...breeder,
                                            breeder: {
                                                ...breeder.breeder,
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
                            value={breeder.breeder.sector || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.currency || "EUR"}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.language || "en"}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.phone || ""}
                            icon="heroicons-outline:phone"
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.email || ""}
                            icon="heroicons-outline:mail"
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.address || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.city || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                            value={breeder.breeder.post_code || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
                                            post_code: e.target.value,
                                        },
                                    })
                                )
                            }
                        />

                        <Select
                            label="Country"
                            options={
                                breeder.countries
                                    ? breeder.countries.map((country) => ({
                                          value: country.id,
                                          label: country.name,
                                      }))
                                    : []
                            }
                            value={breeder.breeder.country_id || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                                value={breeder.breeder.agent || false}
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
                                        breeder.agents
                                            ? breeder.agents.map((agent) => ({
                                                  value: agent.id,
                                                  label: agent.name,
                                              }))
                                            : []
                                    }
                                    value={breeder.breeder.agent_id || ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setBreeder({
                                                ...breeder,
                                                breeder: {
                                                    ...breeder.breeder,
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
                                    value={
                                        breeder.breeder.agent_percentage || ""
                                    }
                                    onChange={(e) =>
                                        dispatch(
                                            setBreeder({
                                                ...breeder,
                                                breeder: {
                                                    ...breeder.breeder,
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
                                breeder.holders_taxes
                                    ? breeder.holders_taxes.map((tax) => ({
                                          value: tax.id,
                                          label: `${tax.country.name} (${tax.percentage}%)`,
                                      }))
                                    : []
                            }
                            value={breeder.breeder.holder_tax_id || ""}
                            onChange={(e) =>
                                dispatch(
                                    setBreeder({
                                        ...breeder,
                                        breeder: {
                                            ...breeder.breeder,
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
                        onClick={() => navigate("/admin/breeders")}
                    />
                    <Button
                        type="submit"
                        icon="heroicons-outline:plus"
                        text="Create Breeder"
                        className="btn-dark"
                        isLoading={isCreating}
                    />
                </div>
            </form>
        </div>
    );
};

export default BreedersCreate;
