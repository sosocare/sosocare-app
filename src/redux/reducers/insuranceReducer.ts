import { InsuranceAction } from "../actions";
import { InsuranceModel, InsuranceState, PlanModel } from "../models/index";

const initialState: InsuranceState = {
    insurance: {} as InsuranceModel,
    errors: [],
    plans: []
};
const InsuranceReducer = (state: InsuranceState = initialState, action: InsuranceAction) => {
    const { type, payload } = action;

    switch (type) {
        case 'ON_LOAD_INSURANCE':
            let loadedState = Object.assign(state, { insurance: payload.insurance, plans: payload.plans });
            return loadedState;
        case 'ON_LOAD_PLANS':
            let plansState = Object.assign(state, { plans: payload.plans });
            return plansState;
        default:
            return state;

    }
};

export { InsuranceReducer };