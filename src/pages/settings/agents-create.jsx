import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { useCreateAgentMutation } from "@/store/api/agents/agentsApiSlice";
import { setAgent } from "@/store/api/agents/agentsSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AgentsCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get agent from Redux store
    const agent = useSelector((state) => state.agents.agent) || { name: "" };

    // Reset agent in store when component mounts
    useEffect(() => {
        dispatch(setAgent(null));
    }, [dispatch]);

    const [createAgent, { isLoading }] = useCreateAgentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createAgent(agent).unwrap();
            toast.success("Agent created successfully");
            navigate("/admin/agents");
        } catch (error) {
            console.error("Error creating agent:", error);
            toast.error("Failed to create agent");
        }
    };

    return (
        <div>
            <Card title="Create Agent">
                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-1 grid-cols-1 gap-5">
                        <Textinput
                            label="Agent Name"
                            type="text"
                            placeholder="Enter agent name"
                            value={agent.name}
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
                            type="button"
                            text="Cancel"
                            className="btn-outline-dark"
                            onClick={() => navigate("/admin/agents")}
                        />
                        <Button
                            type="submit"
                            text="Create"
                            className="btn-dark"
                            isLoading={isLoading}
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AgentsCreate;
