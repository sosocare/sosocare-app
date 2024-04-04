import { combineReducers } from 'redux';
import { WalletReducer } from './walletReducer';
import { UserReducer } from './userReducer';
import { AgentReducer } from './agentReducer';
import { InsuranceReducer } from './insuranceReducer';

const rootReducer = combineReducers({
    UserReducer,
    AgentReducer,
    WalletReducer,
    InsuranceReducer
});

export type ApplicationState = ReturnType<typeof rootReducer> 
export { rootReducer };