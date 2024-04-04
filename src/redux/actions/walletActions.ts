import axios from 'axios';
import { Dispatch } from 'react';
import { BASE_URL } from "../../utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletErrorAction {
    readonly type: 'ON_WALLET_ERROR',
    payload: any;
}

export interface LoadWalletAction {
    readonly type: 'ON_LOAD_WALLET',
    payload: any;
}

export type WalletAction = WalletErrorAction | LoadWalletAction;


export const OnLoadWallet = (userType, token) => {  

    return async (dispatch: Dispatch<WalletAction>) => {

        try {
            const response = await axios.get<string>(`${BASE_URL}${userType}/wallet`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            // console.log("wallet load: ", resBody);
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_LOAD_WALLET',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};

export const OnConvertAllItems = (userType) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            const response = await axios.get<string>(`${BASE_URL}${userType}/waste/convert/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnConvertItem = (id, userType) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}${userType}/waste/convert`, {
                wasteId: id,
                weight: 'all'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentConvertItem = (id, userId) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/waste/convert`, {
                wasteId: id,
                weight: 'all',
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentConvertAllItems = (userId) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/waste/convert/all`, {
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnVerifyTransaction = (reference, userType) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}${userType}/verify/transaction`, {
                reference
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'pending') {
                return { 'pending': resBody['message'] };
            } else if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnLoadBanks = () => {

    return async (dispatch: Dispatch<WalletAction>) => {
        try {
            const response = await axios.get<string>(`${BASE_URL}banks`);
            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'banks': resBody['banks'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnGetPayStackKey = () => {

    return async (dispatch: Dispatch<WalletAction>) => {
        try {
            const response = await axios.get<string>(`${BASE_URL}key/paystack`);
            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'paystack_public': resBody['paystack_public'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnResolveBank = (account_number, bank_code) => {

    return async (dispatch: Dispatch<WalletAction>) => {

        try {
            const response = await axios.post<string>(`${BASE_URL}user/bank/resolve`, {
                account_number,
                bank_code
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'account_name': resBody['account_name'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnSavePaymentMethod = (account_number, bank_code, bank_name, account_name, userType, bvn) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            // console.log("bvn2: ", bvn)
            const response = await axios.post<string>(`${BASE_URL}${userType}/bank/withdrawal/method`, {
                account_number,
                bank_code,
                bank_name,
                account_name,
                bvn
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnSaveAgentPaymentMethod = (account_number, bank_code, bank_name, account_name, userType, bvn) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}/agent/agent/bank/withdrawal/method`, {
                account_number,
                bank_code,
                bank_name,
                account_name,
                bvn
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnWithdrawFunds = (amount, userType) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token: string | null | undefined;
        if (userType === 'user') {
            token = await AsyncStorage.getItem('user_token');
            if (!token) {
                return;
            }
        } else {
            token = await AsyncStorage.getItem('agent_token');
            if (!token) {
                return;
            }
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}${userType}/wallet/transfer`, {
                amount
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else if (resBody['status'] === 'success') {
                return { 'success': resBody['message'] };
            } else {
                return { 'error': 'Something went wrong' };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentSavePaymentMethod = (account_number, bank_code, bank_name, account_name, userId, bvn) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/bank/withdrawal/method`, {
                account_number,
                bank_code,
                bank_name,
                account_name,
                userId,
                bvn
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentWithdrawFunds = (amount, userId) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/wallet/transfer`, {
                amount,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else if (resBody['status'] === 'success') {
                return { 'success': resBody['message'] };
            } else {
                return { 'error': 'Something went wrong' };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentGiveCash = (amount, userId) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/wallet/transfer/cash`, {
                amount,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else if (resBody['status'] === 'success') {
                return { 'success': resBody['message'] };
            } else {
                return { 'error': 'Something went wrong' };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentFundCash = (amount, userId) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/wallet/fund/cash`, {
                amount,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_WALLET_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else if (resBody['status'] === 'success') {
                return { 'success': resBody['message'] };
            } else {
                return { 'error': 'Something went wrong' };
            }
        } catch (error) {
            dispatch({
                type: 'ON_WALLET_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
