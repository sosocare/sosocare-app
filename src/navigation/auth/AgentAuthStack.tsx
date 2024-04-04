import React, { useContext } from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgentAuthStackNavigatorParamList } from './types';

// SCREENS
import AgentLoginScreen from "../../screens/agent/AgentLoginScreen";

// CONSTANTS
import { COLORS, FONTS, SIZES } from '../../constants';
// ICONS
import { AuthContext } from "../../contexts/AuthContext";

const AgentAuthStack = createNativeStackNavigator<AgentAuthStackNavigatorParamList>();

const AgentAuthStackNavigator = () => {
    const { logout, login } = useContext(AuthContext);
    return (
        <AgentAuthStack.Navigator
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={'Login'}
        >
            <AgentAuthStack.Screen
                name="Login" component={AgentLoginScreen}
            />
        </AgentAuthStack.Navigator >
    );
};

export default AgentAuthStackNavigator;