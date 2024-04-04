import React, { useState, useEffect } from "react";
import { Pressable, View, Dimensions, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { HomeScreenNavigationProp } from './types';

// STACKS AND SCREENS
import HomeStack from "./HomeStack";
import WalletStack from "./WalletStack";
import InsuranceStack from "./InsuranceStack"
import ChatScreen from "../../screens/user/ChatScreen";
import FindAgentScreen from "../../screens/user/FindAgentScreen";

// CONSTANTS
import { COLORS, SIZES, FONTS } from "../../constants";

import { UserBottomTabNavigatorParamList } from "./types";
import { OnUserLogout, ApplicationState, UserState } from "../../redux";
import { connect } from 'react-redux';

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
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator<UserBottomTabNavigatorParamList>();

interface HomeStackProps {
    userReducer: UserState;
    OnUserLogout: Function;
}
const _BottomTabs: React.FC<HomeStackProps> = (props) => {
    const { userReducer, OnUserLogout } = props;
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const height = Dimensions.get('screen').height;
    const DEVICE_WIDTH = Dimensions.get('window').width;
    let sizeMultiplier: number = 1;
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
                let existingImage = userReducer.user.image;
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
        <NativeBaseProvider theme={theme}>
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
                        headerTitleStyle: { display: 'none' },
                        tabBarLabel: 'Home',
                        tabBarActiveTintColor: COLORS.pallete_deep,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="ios-home-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                        )
                    }}
                />
                <Tab.Screen
                    name="WalletStack"
                    component={WalletStack}
                    options={{
                        headerTitleStyle: { color: COLORS.dark, fontSize: SIZES.large, fontFamily: FONTS.medium },
                        tabBarLabel: 'Wallet',
                        tabBarActiveTintColor: COLORS.pallete_deep,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="ios-wallet-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                        )
                    }}
                />
                <Tab.Screen
                    name="InsuranceStack"
                    component={InsuranceStack}
                    options={{
                        headerTitleStyle: { color: COLORS.dark, fontSize: SIZES.large, fontFamily: FONTS.medium },
                        tabBarLabel: 'Insurance',
                        tabBarActiveTintColor: COLORS.pallete_deep,
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="hospital-box-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                        )
                    }}
                />
                <Tab.Screen
                    name="FindAgent"
                    component={FindAgentScreen}
                    options={({ navigation }) => ({
                        headerShown: false,
                        headerStyle: {
                            backgroundColor: COLORS.white,
                            borderLeftWidth: 0.2,
                            borderRightWidth: 0.2,
                            borderColor: COLORS.gray,
                            borderBottomColor: COLORS.gray,
                            borderBottomLeftRadius: 15,
                            borderBottomRightRadius: 15,
                            borderBottomStartRadius: 15,
                            borderBottomEndRadius: 15,
                            elevation: 5,
                            shadowColor: 'rgb(230, 235, 243)',
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.5,
                            shadowRadius: 37,
                            minHeight: '13%',
                            height: '13%',
                        },
                        headerTitleStyle: { display: 'none', color: COLORS.dark, fontSize: 0, borderBottomColor: 'transparent', borderColor: 'transparent', borderWidth: 0 },
                        headerLeft: () => (
                            <Pressable
                                onPress={() => navigation.navigate('Profile')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1,
                                    width: 36,
                                    height: 36,
                                    borderRadius: 21,
                                    marginLeft: 20,
                                })}
                            >
                                {loading
                                    ? <Skeleton rounded='full' w={'full'} h={'full'} />
                                    : !loading && imageUrl
                                        ? <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', width: "100%", height: '100%' }}>
                                            <Image alt='Profile Image'
                                                onLoad={() => setImageLoading(false)} source={{ uri: imageUrl }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    flex: 1,
                                                    resizeMode: 'cover',
                                                    borderRadius: 60,
                                                }}
                                            />
                                            <Skeleton position={'absolute'} top={0} zIndex={5} display={imageLoading ? 'flex' : 'none'} rounded='full' w={'full'} h={'full'} />
                                        </View>
                                        : <Image alt='Profile Image' source={require("../../../assets/blank.png")}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                flex: 1,
                                                resizeMode: 'cover',
                                                borderRadius: 60,
                                            }}
                                        />
                                }
                            </Pressable>
                        ),
                        headerRight: () => (
                            <Pressable
                                onPress={() => navigation.navigate('Notifications')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1,
                                    marginRight: 20
                                })}
                            >
                                <Ionicons name="ios-notifications-circle-outline" size={36} color={COLORS.dark} />
                            </Pressable>
                        ),
                        tabBarLabel: 'Find Agent',
                        tabBarActiveTintColor: COLORS.pallete_deep,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="ios-navigate-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                        )
                    })}
                />
                {/* <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                     headerTitleStyle: {display: 'none'},
                    tabBarLabel: 'Chat',
                    tabBarActiveTintColor: COLORS.pallete_deep,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-chatbox-ellipses-outline" style={{ fontSize: size * sizeMultiplier, color: color }} />
                    )
                }}
            /> */}
            </Tab.Navigator>
        </NativeBaseProvider>
    );
};

const mapToStateProps = (state: ApplicationState) => ({
    userReducer: state.UserReducer
});

const BottomTabs = connect(mapToStateProps, { OnUserLogout })(_BottomTabs);

export default BottomTabs;
