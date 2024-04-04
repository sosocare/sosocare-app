import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PlanModel } from "../../redux";

export type HomeStackNavigatorParamList = {
    Home: undefined;
    Profile: undefined;
    EditProfile: undefined;
    ChangePassword: undefined;
    Notifications: undefined;
    SetLocation: undefined;
    FindHospitals: undefined;
    FindPharmacies: undefined;
    AskDoctor: undefined;
    Support: undefined;
};
export type WalletStackNavigatorParamList = {
    Wallet: undefined;
    Conversion: undefined;
    FundCash: undefined;
    Withdraw: undefined;
    Transactions: undefined;
};
export type InsuranceStackNavigatorParamList = {
    Insurance: undefined;
    Plan: {
        plan: PlanModel;
    };
    BuyPlan: {
        plan: PlanModel;
    };
    InsuranceHistory: undefined;
    ManageInsurance: undefined;
};

// export type HomeScreenNavigationProp = NativeStackNavigationProp<
//     HomeStackNavigatorParamList, 'Plan'
// >;
export type InsuranceScreenNavigationProp = NativeStackNavigationProp<InsuranceStackNavigatorParamList>;
export type PlanScreenRouteProp = RouteProp<
    InsuranceStackNavigatorParamList, 'Plan'
>;
export type WalletScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<WalletStackNavigatorParamList>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList>
>;
export type HomeScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackNavigatorParamList, 'Home'>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList>
>;

export type UserBottomTabNavigatorParamList = {
    HomeStack: HomeStackNavigatorParamList;
    WalletStack: WalletStackNavigatorParamList;
    // Wallet: undefined;
    InsuranceStack: InsuranceStackNavigatorParamList;
    FindAgent: undefined;
    Chat: undefined;
};