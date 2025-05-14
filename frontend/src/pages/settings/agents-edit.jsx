import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import {
    useGetAgentQuery,
    useUpdateAgentMutation,
} from "@/store/api/agents/agentsApiSlice";
import { setAgent } from "@/store/api/agents/agentsSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const AgentsEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get agent from the Redux store
    const agent = useSelector((state) => state.agents.agent) || {};

    // Fetch agent data from API
    const { data, isLoading, error } = useGetAgentQuery(id);

    useEffect(() => {
        if (!isLoading && data) {
            dispatch(setAgent(data));
        }
    }, [data, isLoading, dispatch]);

    const [updateAgent, { isLoading: isUpdating }] = useUpdateAgentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateAgent(agent).unwrap();
            toast.success("Agent updated successfully");
            navigate("/admin/agents");
        } catch (error) {
            console.error("Error updating agent:", error);
        }
    };

    return (
        <div>
            {isLoading ? (
                <div className="p-4 border rounded shadow bg-white dark:bg-slate-800">
                    {/* Title Skeleton */}
                    <div className="h-8 w-48 bg-gray-300 dark:bg-slate-600 rounded mb-6 animate-pulse" />
                    <div className="space-y-6">
                        {/* Country Select Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        {/* Percentage Input Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        {/* Checkbox Skeleton */}
                        <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                        </div>
                        {/* Time Picker Skeleton */}
                        <div className="h-10 w-full bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                    {/* Save Button Skeleton */}
                    <div className="mt-8">
                        <div className="h-10 w-32 bg-gray-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                </div>
            ) : error ? (
                <div>Error loading data</div>
            ) : (
                <Card title="Edit Agent">
                    <form onSubmit={handleSubmit}>
                        <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
                            <Textinput
                                label="Agent Name"
                                type="text"
                                placeholder="Enter agent name"
                                defaultValue={agent.name}
                                onChange={(e) =>
                                    dispatch(
                                        setAgent({
                                            ...agent,
                                            name: e.target.value,
                                        })
                                    )
                                }
                            />
                        </div>
                        <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse mt-4">
                            <Button
                                type="submit"
                                text="Save"
                                className="btn-dark"
                                isLoading={isUpdating}
                            />
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default AgentsEdit;
