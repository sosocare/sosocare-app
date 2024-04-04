import React, { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AuthStack from "./auth";
import AppStack from "./app";
import { AuthContext } from "../contexts/AuthContext";
import { useFonts } from "expo-font";
import { connect } from 'react-redux';
import { ApplicationState, UserState, AgentState, OnUserRefresh, OnLoadInsurance, OnAgentRefresh, OnLoadWallet } from '../redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthContextType } from "../contexts/AuthContext";

interface AppNavProps {
    userReducer: UserState;
    agentReducer: AgentState;
    OnAgentRefresh: Function;
    OnUserRefresh: Function;
    OnLoadWallet: Function;
    OnLoadInsurance: Function;
}
const _AppNav: React.FC<AppNavProps> = (props) => {
    const { OnAgentRefresh, OnUserRefresh, userReducer, agentReducer, OnLoadWallet, OnLoadInsurance } = props;
    const { loading, authToken, login, logout, onLoading, doneLoading }: AuthContextType = useContext(AuthContext);

    useEffect(() => {
        const setTokens = async () => {
            onLoading();
            let userToken = await AsyncStorage.getItem('user_token');
            let agentToken = await AsyncStorage.getItem('agent_token');
            if (agentToken) {
                let res = await OnAgentRefresh();
                let res2 = await OnLoadWallet('agent', agentReducer.agent.authToken);
                if (res.error === 'logout') {
                    logout();
                    doneLoading();
                    return;
                }
                login(agentToken, 'agent');

                doneLoading();
            } else if (userToken) {
                let res = await OnUserRefresh();
                let res2 = await OnLoadWallet('user', userReducer.user.authToken);
                let res3 = await OnLoadInsurance('user', userReducer.user.authToken);
                if (res.error === 'logout') {
                    logout();
                    doneLoading();
                    return;
                }
                login(userToken, 'user');

                doneLoading();
            } else {
                logout();
                doneLoading();
            }
        };
        setTokens();
    }, []);
    const [fontsLoaded] = useFonts({
        InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
        InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
        InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
        InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
        InterLight: require("../../assets/fonts/Inter-Light.ttf"),
        PoppinsLight: require("../../assets/fonts/Poppins/Poppins-Light.ttf"),
        PoppinsRegular: require("../../assets/fonts/Poppins/Poppins-Regular.ttf"),
        PoppinsMedium: require("../../assets/fonts/Poppins/Poppins-Medium.ttf"),
        PoppinsSemiBold: require("../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
        PoppinsBold: require("../../assets/fonts/Poppins/Poppins-Bold.ttf"),
    });

    if (loading || !fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }
    return authToken ? <AppStack /> : <AuthStack />;
};
// export default AppNav;

const mapToStateProps = (state: ApplicationState) => ({
    userReducer: state.UserReducer,
    agentReducer: state.AgentReducer
});

const AppNav = connect(mapToStateProps, { OnAgentRefresh, OnUserRefresh, OnLoadWallet, OnLoadInsurance })(_AppNav);
export default AppNav;