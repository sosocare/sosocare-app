import React, { useContext } from "react";
import UserRootNavigator from "../user";
import AgentRootNavigator from "../agent";
// import { StatusBar } from 'expo-status-bar';
// import { COLORS } from "../../constants";
import { AuthContext } from "../../contexts/AuthContext";

const AppStack = () => {
    const {userType} = useContext(AuthContext)
    return (
        <>
            {userType === 'user' ? <UserRootNavigator /> : <AgentRootNavigator />}
        </>
    );
};

export default AppStack;