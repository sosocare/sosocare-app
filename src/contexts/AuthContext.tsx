import React, { createContext, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthContextType = {
    login: Function,
    logout: Function,
    signup: Function,
    onLoading: Function,
    doneLoading: Function,
    loading: boolean,
    authToken: String,
    userType: String;
};
let voidFunction = () => {
    console.log('function');
};
let defVal = {
    login: voidFunction,
    logout: voidFunction,
    signup: voidFunction,
    onLoading: voidFunction,
    doneLoading: voidFunction,
    loading: false,
    authToken: '',
    userType: 'user',
};

export const AuthContext = createContext(defVal);

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    const [authToken, setAuthToken] = useState('');
    const [userType, setUserType] = useState('user');
    const login = async (authToken?: string, val?: String) => {
        if (val === 'user') {
            setUserType('user');
        } else {
            setUserType('agent');
        }
        if (authToken) {
            setAuthToken(authToken);
        }
        setLoading(false);
    };
    const signup = (val?: String) => {
        if (val === 'user') {
            setUserType('user');
        } else {
            setUserType('agent');
        }
        setAuthToken("sdshdsd");
        setLoading(false);
    };
    const logout = async() => {
        await AsyncStorage.removeItem('user_token')
        await AsyncStorage.removeItem('agent_token')
        setAuthToken('');
        setLoading(false);
    };
    const onLoading = async () => {
        setLoading(true);
    };
    const doneLoading = async () => {
        setLoading(false);
    };
    return (
        <AuthContext.Provider value={{
            login: login,
            signup: signup,
            logout: logout,
            loading: loading,
            authToken: authToken,
            userType: userType,
            onLoading: onLoading,
            doneLoading: doneLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};