import React, { useEffect, useState } from "react";
import { Pressable, View, Dimensions, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

// STACKS AND SCREENS
import HomeStack from "./HomeStack";
import ClientStack from "./ClientStack";
import RecordStack from "./RecordStack";
import { UserBottomTabNavigatorParamList, HomeScreenNavigationProp } from "./types";
import {
    NativeBaseProvider,
    extendTheme,
    Image,
    Skeleton
} from "native-base";
// Define the config
const config = {
    useSystemColorMode: false,
    initialColorMode: "light",
};

// extend the theme
export const theme = extendTheme({
    colors: {
        primary: {
            100: '#52A56E',
            200: '#C6C6C6'
        }
    },
    config
});
type MyThemeType = typeof theme;
declare module "native-base" {
    interface ICustomTheme extends MyThemeType { }
}

// CONSTANTS
import { COLORS, SIZES, FONTS } from "../../constants";

import { useNavigation } from "@react-navigation/native";
import { OnAgentLogout, ApplicationState, AgentState } from "../../redux";
import { connect } from 'react-redux';

const Tab = createBottomTabNavigator<UserBottomTabNavigatorParamList>();
interface BottomStackProps {
    agentReducer: AgentState;
    OnAgentLogout: Function;
}
const _BottomTabs: React.FC<BottomStackProps> = (props) => {
    const { agentReducer, OnAgentLogout } = props;
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const height = Dimensions.get('screen').height;
    const DEVICE_WIDTH = Dimensions.get('window').width;
    let sizeMultiplier: number = 0.8;
    let shortScreensMaxHeight = 680;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            try {
                setLoading(true);
                if (!mounted) {
                    return;
                }
                let existingImage = agentReducer.agent.image;
                setImageUrl(existingImage || '');
                setImageLoading(true);
                setLoading(false);
            } catch (error) {
                if (!mounted) {
                    return;
                }
                setLoading(false);
                return;
            }

        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Tab.Navigator sceneContainerStyle={{ backgroundColor: 'white' }} screenOptions={{
            headerShown: false,
            tabBarStyle: {
                minHeight: Platform.OS === 'android' ? 56 : '8%',
                backgroundColor: COLORS.white,
                borderLeftWidth: 0.2,
                borderRightWidth: 0.2,
                // paddingTop: height < shortScreensMaxHeight ? SIZES.base : SIZES.medium,
                // paddingBottom: height < shortScreensMaxHeight ? SIZES.base : SIZES.large,
                borderColor: COLORS.gray,
                borderTopColor: COLORS.gray,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                borderTopStartRadius: 15,
                padding: 10,
                width: DEVICE_WIDTH,
                position: 'absolute',
                bottom: 0,
                borderTopEndRadius: 15,
                elevation: 5,
                shadowColor: 'rgb(230, 235, 243)',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.5,
                shadowRadius: 10
            },
            tabBarLabelStyle: {
                fontStyle: 'normal',
                fontFamily: FONTS.regular,
                fontWeight: '400',
                fontSize: 10,
                lineHeight: 16,
                textAlign: 'center'
            },
            tabBarActiveTintColor: COLORS.pallete_deep,
            tabBarInactiveTintColor: COLORS.dark
        }}>
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-home-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                    )
                }}
            />

            <Tab.Screen
                name="ClientStack"
                component={ClientStack}
                options={{
                    headerTitleStyle: { color: COLORS.dark, fontSize: SIZES.large, fontFamily: FONTS.medium },
                    tabBarLabel: 'Clients',
                    tabBarActiveTintColor: COLORS.pallete_deep,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-people-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                    )
                }}
            />

            <Tab.Screen
                name="RecordStack"
                component={RecordStack}
                options={{
                    headerTitleStyle: { color: COLORS.dark, fontSize: SIZES.large, fontFamily: FONTS.medium },
                    tabBarLabel: 'Transactions',
                    tabBarActiveTintColor: COLORS.pallete_deep,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-list-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                    )
                }}
            />


            {/* <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarLabel: 'Chat',
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-chatbox-ellipses-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                    )
                }}
            /> */}
        </Tab.Navigator>
    );
};

const mapToStateProps = (state: ApplicationState) => ({
    agentReducer: state.AgentReducer
});

const BottomTabs = connect(mapToStateProps, { OnAgentLogout })(_BottomTabs);

export default BottomTabs;