import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import React from "react";
import { COLORS } from "../../constants";
import BottomTabs from "./Tabs";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: COLORS.screenBg,
    },
};
const AgentRootNavigator = () => {
    return (
        <NavigationContainer theme={theme}>
            <BottomTabs />
        </NavigationContainer>
    );
};

export default AgentRootNavigator;