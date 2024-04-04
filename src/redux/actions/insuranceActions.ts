import axios from 'axios';
import { Dispatch } from 'react';
import { BASE_URL } from "../../utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InsuranceErrorAction {
    readonly type: 'ON_INSURANCE_ERROR',
    payload: any;
}

export interface LoadInsuranceAction {
    readonly type: 'ON_LOAD_INSURANCE',
    payload: any;
}
export interface LoadPlansAction {
    readonly type: 'ON_LOAD_PLANS',
    payload: any;
}

export type InsuranceAction = InsuranceErrorAction | LoadInsuranceAction | LoadPlansAction;


export const OnLoadInsurance = (userType, token) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {

        try {
            const response = await axios.get<string>(`${BASE_URL}${userType}/insurance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            // console.log("insurance load: ", resBody);
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_LOAD_INSURANCE',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnLoadPlans = () => {

    return async (dispatch: Dispatch<InsuranceAction>) => {

        try {
            const response = await axios.get<string>(`${BASE_URL}/plans`);

            let resBody = response.data;
            // console.log("insurance load: ", resBody);
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_LOAD_PLANS',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};

export const OnBuyInsuranceOnboarding = (planId, duration, payment_method, transaction_ref = null, user, addressState, city, hospital, pharmacy) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
      

        try {
            const response = await axios.post<string>(`${BASE_URL}user/new/insurance/mobile`, {
                planId,
                duration,
                payment_method,
                transaction_ref,
                hospital,
                pharmacy,
                addressState,
                city,
                user,

            })


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnBuyInsurance = (planId, duration, payment_method, transaction_ref = null, userType, hospital, pharmacy) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
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
            const response = await axios.post<string>(`${BASE_URL}${userType}/insurance`, {
                planId,
                duration,
                payment_method,
                transaction_ref,
                hospital,
                pharmacy
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnSetCareCentre = (insuranceId, hospital, pharmacy) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
        let token: string | null | undefined;
        token = await AsyncStorage.getItem('user_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.put<string>(`${BASE_URL}user/insurance/update-centre/${insuranceId}`, {
                hospital,
                pharmacy
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnCancelInsurance = (insuranceId) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
        let token: string | null | undefined;
        token = await AsyncStorage.getItem('user_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.put<string>(`${BASE_URL}user/insurance/cancel/${insuranceId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentCancelInsurance = (insuranceId, clientId) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
        let token: string | null | undefined;
        token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.put<string>(`${BASE_URL}agent/insurance/cancel/${insuranceId}`, {
                clientId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentSetCareCentre = (insuranceId,clientId, hospital, pharmacy) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
        let token: string | null | undefined;
        token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.put<string>(`${BASE_URL}agent/insurance/update-centre/${insuranceId}`, {
                hospital,
                pharmacy,
                clientId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentBuyInsurance = (planId, duration, payment_method, transaction_ref = null, userId, hospital, pharmacy) => {

    return async (dispatch: Dispatch<InsuranceAction>) => {
        let token = await AsyncStorage.getItem('agent_token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/insurance`, {
                planId,
                duration,
                payment_method,
                transaction_ref,
                userId,
                hospital,
                pharmacy
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_INSURANCE_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_INSURANCE_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};