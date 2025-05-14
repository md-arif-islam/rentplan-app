import { createSlice } from "@reduxjs/toolkit";

const agentsSlice = createSlice({
    name: "agents",
    initialState: {
        agents: null,
        agent: null,
    },
    reducers: {
        setAgents: (state, action) => {
            state.agents = action.payload;
        },
        setAgent: (state, action) => {
            state.agent = action.payload;
        },
    },
});

export const { setAgents, setAgent } = agentsSlice.actions;
export default agentsSlice.reducer;
