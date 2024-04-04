import { AgentAction } from "../actions";
import { AgentModel, AgentState, LocationModel } from "../models/index";

const initialState: AgentState = {
    agent: {} as AgentModel,
    location: {} as LocationModel,
    errors: []
};
const AgentReducer = (state: AgentState = initialState, action: AgentAction) => {
    const { type, payload } = action;
    switch (type) {
        case 'ON_AGENT_UPDATE_PROFILE_IMAGE':
            let updatedState = Object.assign(state, { agent: {...state.agent, image: payload} });
            return updatedState;
        case 'ON_UPDATE_AGENT_LOCATION':
            return {
                ...state,
                location: payload
            };
        case 'ON_AGENT_LOGIN':
            let loginState = Object.assign(state, { agent: payload });
            return loginState;
        case 'ON_AGENT_LOGOUT':
            let logoutState = {
                agent: {} as AgentModel,
                location: {} as LocationModel,
                errors: []
            };
            return logoutState;

        default:
            return state;

    }
};

export { AgentReducer };