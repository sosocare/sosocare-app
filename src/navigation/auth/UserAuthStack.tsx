import React, { useContext } from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserAuthStackNavigatorParamList, UserAuthStackRouteProp } from './types';
import { useRoute } from '@react-navigation/native';
// SCREENS
import LoginScreen from "../../screens/user/LoginScreen";
import SignupScreen from "../../screens/user/SignupScreen";
import OnboardingScreen from "../../screens/user/OnboardingScreen";

// CONSTANTS
import { COLORS, FONTS, SIZES } from '../../constants';
// ICONS
import { AuthContext } from "../../contexts/AuthContext";

const UserAuthStack = createNativeStackNavigator<UserAuthStackNavigatorParamList>();

const UserAuthStackNavigator = () => {
    const route = useRoute<UserAuthStackRouteProp>();
    const { page } = route.params;
    const { logout, login } = useContext(AuthContext);
    return (
        <UserAuthStack.Navigator
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={page === 'login' ? 'Login' : 'Signup'}
        >
            <UserAuthStack.Screen
                name="Login" component={LoginScreen}
            />
            <UserAuthStack.Screen
                name="Signup" component={OnboardingScreen}
            />
        </UserAuthStack.Navigator >
    );
};

export default UserAuthStackNavigator;