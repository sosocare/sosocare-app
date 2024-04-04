import { WalletAction } from "../actions";
import { WalletModel, WalletState, SosocareBankModel } from "../models/index";

const initialState: WalletState = {
    wallet: {} as WalletModel,
    sosocareBank: {} as SosocareBankModel,
    wastelogs: [],
    errors: []
};
const WalletReducer = (state: WalletState = initialState, action: WalletAction) => {
    const { type, payload } = action;

    switch (type) {
        case 'ON_LOAD_WALLET':
            let loadedState = Object.assign(state, { wallet: { ...payload.wallet, total_weight: payload.total_weight, total_unit: payload.total_unit }, wastelogs: payload.wastelogs, sosocareBank: payload.sosocareBank });
            return loadedState;
        default:
            return state;

    }
};

export { WalletReducer };