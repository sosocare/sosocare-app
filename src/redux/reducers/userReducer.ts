import { UserAction } from "../actions";
import { UserModel, UserState, LocationModel } from "../models/index";

const initialState: UserState = {
    user: {} as UserModel,
    location: {} as LocationModel,
    errors: []
};
const UserReducer = (state: UserState = initialState, action: UserAction) => {
    const { type, payload } = action;
    switch (type) {
        case 'ON_USER_UPDATE_PROFILE_IMAGE':
            let updatedState = Object.assign(state, { user: {...state.user, image: payload} });
            return updatedState;
        case 'ON_UPDATE_LOCATION':
            return {
                ...state,
                location: payload
            };
        case 'ON_USER_LOGIN':
            let loginState = Object.assign(state, { user: payload });
            return loginState;
        case 'ON_USER_LOGOUT':
            let logoutState = {
                user: {} as UserModel,
                location: {} as LocationModel,
                errors: []
            };
            return logoutState;

        default:
            return state;

    }
};

export { UserReducer };