import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { UserBottomTabNavigatorParamList } from "../user/types";
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type UserAuthStackNavigatorParamList = {
    Login: undefined;
    Signup: undefined;
};
export type AuthStackNavigatorParamList = {
    Landing: undefined;
    UserAuth: {
        page: string;
    };
    AgentAuth: undefined;
};

export type LandingAuthScreenNavigationProp = NativeStackNavigationProp<
    AuthStackNavigatorParamList
>;
export type UserAuthScreenNavigationProp = NativeStackNavigationProp<
    UserAuthStackNavigatorParamList
>;
export type LoginNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<UserAuthStackNavigatorParamList, 'Login'>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList, 'HomeStack'>
>;
export type UserAuthStackRouteProp = RouteProp<
    AuthStackNavigatorParamList,
    'UserAuth'
>;
export type AgentAuthStackNavigatorParamList = {
    Login: undefined;
};

export type AgentAuthScreenNavigationProp = NativeStackNavigationProp<
    AgentAuthStackNavigatorParamList
>;