import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CustomUserModel, PlanModel, WasteLogModel } from "../../redux";

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
    FundCash: undefined;
    Withdraw: undefined;
};
export type RecordStackNavigatorParamList = {
    AgentRecords: undefined;
};

export type ClientStackNavigatorParamList = {
    Clients: undefined;
    NewClient: undefined;
    ClientDetails: {
        client: CustomUserModel;
    };
    ClientInsurance: {
        client: CustomUserModel;
    };
    EditClient: {
        client: CustomUserModel;
    };
    AddWaste: {
        client: CustomUserModel;
        material: WasteLogModel;
    };
    ConvertClient: {
        client: CustomUserModel;
    };
    BuyInsurance: {
        client: CustomUserModel;
    };
    Plan: {
        client: CustomUserModel;
        plan: PlanModel;
    };
    BuyPlan: {
        client: CustomUserModel;
        plan: PlanModel;
    };
    PayClient: {
        client: CustomUserModel;
    };
    PayCash: {
        client: CustomUserModel;
    };
    FundCash: {
        client: CustomUserModel;
    };
    ExternalClient: undefined;
};

export type UserBottomTabNavigatorParamList = {
    HomeStack: HomeStackNavigatorParamList;
    ClientStack: ClientStackNavigatorParamList;
    RecordStack: RecordStackNavigatorParamList;
};

export type ConfirmPlanScreenRouteProp = RouteProp<
    ClientStackNavigatorParamList, 'Plan'
>;
export type ClientAddWasteScreenRouteProp = RouteProp<
    ClientStackNavigatorParamList, 'AddWaste'
>;
export type ClientDetailsScreenRouteProp = RouteProp<
    ClientStackNavigatorParamList, 'ClientDetails'
>;


export type HomeScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackNavigatorParamList, 'Profile'>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList>
>;

export type ClientNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<ClientStackNavigatorParamList, 'Clients'>,
    NativeStackNavigationProp<HomeStackNavigatorParamList>
>;
export type ClientScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<ClientStackNavigatorParamList, 'Clients'>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList>
>;
export type RecordScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<RecordStackNavigatorParamList, 'AgentRecords'>,
    BottomTabNavigationProp<UserBottomTabNavigatorParamList>
>;