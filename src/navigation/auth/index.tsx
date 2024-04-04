import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../../constants";
import LandingScreen from "../../screens/LandingScreen";
import UserAuthStackNavigator from "./UserAuthStack";
import AgentAuthStackNavigator from "./AgentAuthStack";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: COLORS.screenBg,
    },
};
const AuthNavigation = createNativeStackNavigator();
const AuthStack = () => {
    return (
        <NavigationContainer theme={theme}>
            <AuthNavigation.Navigator screenOptions={{
                headerShown: false
            }}
            initialRouteName={'Landing'}
            >
                <AuthNavigation.Screen
                    name="Landing" component={LandingScreen}
                />
                <AuthNavigation.Screen
                    name="UserAuth" component={UserAuthStackNavigator}
                />
                <AuthNavigation.Screen
                    name="AgentAuth" component={AgentAuthStackNavigator}
                />
            </AuthNavigation.Navigator>
        </NavigationContainer>
    );
};

export default AuthStack;
