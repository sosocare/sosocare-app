import axios from 'axios';
import { Dispatch } from 'react';
import { BASE_URL } from "../../utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationModel } from '../models';
import { store } from '../store';

export interface UpdateLocationAction {
    readonly type: 'ON_UPDATE_LOCATION',
    payload: LocationModel;
}
export interface UserErrorAction {
    readonly type: 'ON_USER_ERROR',
    payload: any;
}
export interface UserLoginAction {
    readonly type: 'ON_USER_LOGIN',
    payload: string;
}
export interface UserUpdateProfileImage {
    readonly type: 'ON_USER_UPDATE_PROFILE_IMAGE',
    payload: string;
}
export interface UserLogoutAction {
    readonly type: 'ON_USER_LOGOUT',
    payload: string;
}


export type UserAction = UpdateLocationAction | UserErrorAction | UserLoginAction | UserLogoutAction | UserUpdateProfileImage;


// User Actions trigger from Components

export const OnUserUpdatePassword = (data) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let userToken = await AsyncStorage.getItem('user_token');
        if (!userToken) {
            return { 'error': 'User logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}user/update/password`,
                { ...data }
                , {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }

    };

};
export const OnUserUpdateProfileImage = (link) => {

    return async (dispatch: Dispatch<UserAction>) => {
        try {

            dispatch({
                type: 'ON_USER_UPDATE_PROFILE_IMAGE',
                payload: link
            });
            return { 'success': 'done' };

        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }

    };

};
export const OnUserUpdate = (data) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let userToken = await AsyncStorage.getItem('user_token');
        if (!userToken) {
            return { 'error': 'User logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}user/update`,
                { ...data }
                , {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_USER_LOGIN',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }

    };

};
export const OnUpdateLocation = (location: LocationModel) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let userToken = await AsyncStorage.getItem('user_token');
        if (!userToken) {
            return { 'error': 'User logged out' };
        }
        try {
            const response = await axios.put<string>(`${BASE_URL}user/update`,
                {...location}
                , {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_UPDATE_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }

        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }

    };

};
export const onSendOTP = (phone: string) => {

    return async (dispatch: Dispatch<UserAction>) => {

        try {
            const response = await axios.post<string>(`${BASE_URL}user/otp`, {
                phone,
            });

            if (!response) {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: 'OTP Error'
                });
            }
            return response.data;
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const onVerifyOTP = (phone: string, token: string) => {

    return async (dispatch: Dispatch<UserAction>) => {

        try {
            const response = await axios.post<string>(`${BASE_URL}user/verify-otp`, {
                phone,
                token
            });

            if (!response) {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: 'OTP Verification Error'
                });
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: 'OTP Verification Error'
            });
        }
    };

};
export const OnUserNotificationsCount = () => {

    return async (dispatch: Dispatch<UserAction>) => {
        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}user/notifications/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'count': resBody['count'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};
export const OnReadUserMessage = (id, type) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            let url = `${BASE_URL}user/messages/read/${id}`
            if(type && type === 'answer'){
                url = `${BASE_URL}user/answers/read/${id}`
            }
            const response = await axios.get<string>(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};
export const OnLoadUserMessages = () => {

    return async (dispatch: Dispatch<UserAction>) => {
        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}user/messages/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'], 'messages': resBody['messages'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: 'Notifications error'
            });
        }
    };

};
export const OnUserLogin = (loginId: string, password: string) => {

    return async (dispatch: Dispatch<UserAction>) => {

        try {
            const response = await axios.post<string>(`${BASE_URL}user/login`, {
                login: loginId,
                password
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                await AsyncStorage.setItem('user_token', response.data['authToken']);
                dispatch({
                    type: 'ON_USER_LOGIN',
                    payload: response.data
                });
                let location = {
                    address_country: response.data['address_country'],
                    address_state: response.data['address_state'],
                    address_city: response.data['address_city'],
                    address_street: response.data['address_street'],
                    address_lat: null,
                    address_long: null,
                    address_zipcode: null,
                };
                dispatch({
                    type: 'ON_UPDATE_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnAskQuestion = (title: string, question: string, gender: string, age: string) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            const response = await axios.post<string>(`${BASE_URL}user/question`, {
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
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnContactSupport = (subject: string, message: string) => {

    return async (dispatch: Dispatch<UserAction>) => {
        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            const response = await axios.post<string>(`${BASE_URL}user/contact`, {
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
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnUserRefresh = () => {

    return async (dispatch: Dispatch<UserAction>) => {
        let userToken = await AsyncStorage.getItem('user_token');
        if (!userToken) {
            return;
        }
        try {
            const response = await axios.post<string>(`${BASE_URL}user/refresh`, {}, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                if (
                    resBody["message"] === "session expired" ||
                    resBody["message"] === "Please authenticate"
                ) {
                    dispatch({
                        type: 'ON_USER_LOGOUT',
                        payload: response.data
                    });
                    return { 'error': 'logout' };
                }
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: resBody['message']
                });
                return { 'error': resBody['message'] };
            } else {
                await AsyncStorage.setItem('user_token', response.data['authToken']);
                dispatch({
                    type: 'ON_USER_LOGIN',
                    payload: response.data
                });
                let location = {
                    address_country: response.data['address_country'],
                    address_state: response.data['address_state'],
                    address_city: response.data['address_city'],
                    address_street: response.data['address_street'],
                    address_lat: null,
                    address_long: null,
                    address_zipcode: null,
                };

                dispatch({
                    type: 'ON_UPDATE_LOCATION',
                    payload: location
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnUserLogout = () => {

    return async (dispatch: Dispatch<UserAction>) => {

        let token = store.getState().UserReducer.user.authToken;
        if (!token) return;
        try {
            const response = await axios.get<string>(`${BASE_URL}user/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let resBody = response.data;

            if (resBody['status'] === 'error') {
                dispatch({
                    type: 'ON_USER_LOGOUT',
                    payload: response.data
                });
                return { 'error': resBody['message'] };
            } else {
                dispatch({
                    type: 'ON_USER_LOGOUT',
                    payload: response.data
                });
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: (error as Error).message
            });
            return { 'error': (error as Error).message };
        }
    };

};
export const OnUserSignup = (
    firstName: string,
    lastName: string,
    // address_state: string,
    // address_city: string,
    // address_street: string,
    // address_zipcode: string,
    // address_long: string,
    // address_lat: string,
    email: string,
    phone: string,
    password: string
) => {

    return async (dispatch: Dispatch<UserAction>) => {
        try {
            const response = await axios.post<string>(`${BASE_URL}user/register`, {
                email,
                phone,
                password,
                first_name: firstName,
                last_name: lastName,
                // address_city,
                // address_lat,
                // address_long,
                // address_state,
                // address_street,
                // address_zipcode
            });

            if (!response) {
                dispatch({
                    type: 'ON_USER_ERROR',
                    payload: 'Signup Error'
                });
            } else {
                dispatch({
                    type: 'ON_USER_LOGIN',
                    payload: response.data
                });
            }
        } catch (error) {
            dispatch({
                type: 'ON_USER_ERROR',
                payload: 'Signup Error'
            });
        }
    };

};