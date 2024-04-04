import axios from 'axios';
import { Dispatch } from 'react';
import { BASE_URL } from "../../utils";
import { LocationModel } from '../models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';

export interface UpdateAgentLocationAction {
    readonly type: 'ON_UPDATE_AGENT_LOCATION',
    payload: LocationModel;
}
export interface AgentErrorAction {
    readonly type: 'ON_AGENT_ERROR',
    payload: any;
}
export interface AgentLogoutAction {
    readonly type: 'ON_AGENT_LOGOUT',
    payload: string;
}
export interface AgentLoginAction {
    readonly type: 'ON_AGENT_LOGIN',
    payload: string;
}
export interface AgentUpdateProfileImage {
    readonly type: 'ON_AGENT_UPDATE_PROFILE_IMAGE',
    payload: string;
}


export type AgentAction = UpdateAgentLocationAction | AgentErrorAction | AgentLoginAction | AgentLogoutAction | AgentUpdateProfileImage;


// User Actions trigger from Components
export const OnAgentUpdatePassword = (data) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let agentToken = await AsyncStorage.getItem('agent_token');
        if (!agentToken) {
            return { 'error': 'Agent logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}agent/update/password`,
                { ...data }
                , {
                    headers: {
                        'Authorization': `Bearer ${agentToken}`
                    }
                });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: error
            });
            return { 'error': error.message };
        }

    };

};
export const OnAgentUpdateProfileImage = (link) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        try {
            dispatch({
                type: 'ON_AGENT_UPDATE_PROFILE_IMAGE',
                payload: link
            });
            return { 'success': 'done' };

        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: error
            });
            return { 'error': error.message };
        }

    };

};
export const OnAgentUpdate = (data) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let agentToken = await AsyncStorage.getItem('agent_token');
        if (!agentToken) {
            return { 'error': 'Agent logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}agent/update`,
                { ...data }
                , {
                    headers: {
                        'Authorization': `Bearer ${agentToken}`
                    }
                });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_AGENT_LOGIN',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: error
            });
            return { 'error': error.message };
        }

    };

};

export const OnUpdateAgentLocation = (location: LocationModel) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let agentToken = await AsyncStorage.getItem('agent_token');
        if (!agentToken) {
            return { 'error': 'Agent logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}agent/update`,
                location
                , {
                    headers: {
                        'Authorization': `Bearer ${agentToken}`
                    }
                });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_UPDATE_AGENT_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: error
            });
            return { 'error': error.message };
        }

    };

};
export const OnAgentRefresh = () => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let agentToken = await AsyncStorage.getItem('agent_token');
        if (!agentToken) {
            return { 'error': 'Not logged in' };
        }
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/refresh`, {}, {
                headers: {
                    'Authorization': `Bearer ${agentToken}`
                }
            });
            let resBody = response.data;

            if (resBody['status'] === 'error') {
                if (
                    resBody["message"] === "session expired" ||
                    resBody["message"] === "Please authenticate"
                ) {
                    dispatch({
                        type: 'ON_AGENT_LOGOUT',
                        payload: response.data
                    });
                    return { 'error': 'logout' };
                }
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                await AsyncStorage.setItem('agent_token', response.data['authToken']);
                dispatch({
                    type: 'ON_AGENT_LOGIN',
                    payload: response.data
                });
                let location = {
                    address_country: response.data['address_country'],
                    address_state: response.data['address_state'],
                    address_city: response.data['address_city'],
                    address_street: response.data['address_street'],
                    address_lat: response.data['address_lat'],
                    address_long: response.data['address_long'],
                    address_zipcode: response.data['address_zipcode'],
                };
                dispatch({
                    type: 'ON_UPDATE_AGENT_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Login Error'
            });
            return { 'error': error.message };
        }
    };

};
export const OnAgentLogin = (loginId: string, password: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/login`, {
                login: loginId,
                password
            });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                await AsyncStorage.setItem('agent_token', response.data['authToken']);
                dispatch({
                    type: 'ON_AGENT_LOGIN',
                    payload: response.data
                });
                let location = {
                    address_country: response.data['address_country'],
                    address_state: response.data['address_state'],
                    address_city: response.data['address_city'],
                    address_street: response.data['address_street'],
                    address_lat: response.data['address_lat'],
                    address_long: response.data['address_long'],
                    address_zipcode: response.data['address_zipcode'],
                };
                dispatch({
                    type: 'ON_UPDATE_AGENT_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Login Error'
            });
            return { 'error': error };
        }
    };

};
export const OnAgentLogout = () => {

    return async (dispatch: Dispatch<AgentAction>) => {

        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_LOGOUT',
                    payload: response.data
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_AGENT_LOGOUT',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Login Error'
            });
            return { 'error': error.message };
        }
    };

};
export const OnAgentNotificationsCount = () => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/notifications/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'count': resBody['count'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};
export const OnReadAgentMessage = (id, type) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            let url = `${BASE_URL}agent/messages/read/${id}`
            if(type && type === 'answer'){
                url = `${BASE_URL}agent/answers/read/${id}`
            }
            const response = await axios.get<string>(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};
export const OnLoadAgentMessages = () => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/messages/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'messages': resBody['messages'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};

// agent client actions
export const OnAddUserWaste = (waste, amount, userId) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;

        try {
            const response = await axios.post<string>(`${BASE_URL}agent/waste/add`, {
                waste,
                weight: amount,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnLoadAgentClient = (id: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return {
                    'success': resBody['status'],
                    'insurance': resBody['insurance'],
                    'wallet': resBody['wallet'],
                    'wastelogs': resBody['wastelogs'],
                    'total_weight': resBody['total_weight'],
                    'total_unit': resBody['total_unit'],
                    'plans': resBody['plans'],
                };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Users error'
            });
        }
    };

};
export const OnLoadClients = () => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'clients': resBody['clients'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Users error'
            });
        }
    };

};
export const OnLoadExternalClient = (id: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/external/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return {
                    'success': resBody['status'],
                    'insurance': resBody['insurance'],
                    'wallet': resBody['wallet'],
                    'wastelogs': resBody['wastelogs'],
                    'total_weight': resBody['total_weight'],
                    'plans': resBody['plans'],
                };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Users error'
            });
        }
    };

};
export const OnLoadCheckClient = (id: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}agent/external/check/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return {
                    'success': resBody['status'],
                    'client': resBody['client']
                };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: 'Users error'
            });
        }
    };

};
export const OnAgentAskQuestion = (title: string, question: string, gender: string, age: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/question`, {
                title,
                question,
                gender,
                age
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAgentContactSupport = (subject: string, message: string) => {

    return async (dispatch: Dispatch<AgentAction>) => {
        let token = store.getState().AgentReducer.agent.authToken;
        if (!token) return;
        try {
            const response = await axios.post<string>(`${BASE_URL}agent/contact`, {
                subject,
                message
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_AGENT_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_AGENT_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};