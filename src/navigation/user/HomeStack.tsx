import React, { useState, useEffect } from "react";
import { Pressable, View } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackNavigatorParamList, HomeScreenNavigationProp } from './types';

// SCREENS
import HomeScreen from "../../screens/user/HomeScreen";
import ProfileScreen from "../../screens/user/home/ProfileScreen";
import EditProfileScreen from "../../screens/user/home/EditProfileScreen";
import ChangePasswordScreen from "../../screens/user/home/ChangePasswordScreen";
import NotificationsScreen from "../../screens/user/home/NotificationsScreen";
import SetLocationScreen from "../../screens/user/home/SetLocationScreen";
import FindHospitalsScreen from "../../screens/user/FindHospitalsScreen";
import FindPharmaScreen from "../../screens/user/FindPharmaScreen";
import AskDoctorScreen from "../../screens/user/home/AskDoctorScreen";
import SupportScreen from "../../screens/user/home/SupportScreen";
import Ionicons from '@expo/vector-icons/Ionicons';

// CONSTANTS
import { COLORS } from '../../constants';
import { useNavigation } from "@react-navigation/native";

import { ApplicationState, UserState, OnUserNotificationsCount } from "../../redux";
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

const HomeStack = createNativeStackNavigator<HomeStackNavigatorParamList>();

interface HomeStackProps {
    userReducer: UserState;
    OnUserNotificationsCount: Function;
}
const _HomeStackNavigator: React.FC<HomeStackProps> = (props) => {
    const { userReducer, OnUserNotificationsCount } = props;
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            try {
                if (!mounted) {
                    return;
                }
                let res = await OnUserNotificationsCount();
                if (res.success) {
                    setUnreadCount(res.count);
                }
            } catch (error) {
                if (!mounted) {
                    return;
                }
                return;
            }

        })();
        return () => {
            mounted = false;
        };
    });
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
    const navigate = useNavigation<HomeScreenNavigationProp>();

    return (
        <NativeBaseProvider theme={theme}>
            <HomeStack.Navigator
                screenOptions={({ navigation }) => ({
                    headerStyle: { backgroundColor: COLORS.white },
                    headerTitleStyle: { color: COLORS.dark },
                    headerBackTitleVisible: false,
                    headerBackVisible: false,
                    headerLeft: () => (
                        <Pressable
                            onPress={() => navigate.goBack()}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.5 : 1,
                                marginLeft: -10
                            })}
                        >
                            <Ionicons name="ios-chevron-back" style={{ fontSize: 24, marginLeft: 0, padding: 0 }} color={COLORS.dark} />
                        </Pressable>
                    ),
                    headerBackTitle: 'Back'
                })}
            >
                <HomeStack.Screen
                    options={({ navigation }) => ({
                        headerShown: true,
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
                                onPress={() => navigate.navigate('Profile')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1,
                                    width: 30,
                                    height: 30,
                                    borderRadius: 18
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
                                onPress={() => navigate.navigate('Notifications')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1,
                                    position: 'relative'
                                })}
                            >
                                {unreadCount > 0 && <View style={{ backgroundColor: COLORS.negative, width: 10, height: 10, borderRadius: 5, position: 'absolute', top: 0, left: 0 }}></View>}
                                <Ionicons name="ios-notifications-circle-outline" size={28} color={COLORS.dark} />
                            </Pressable>
                        )
                    })}
                    name="Home" component={HomeScreen}
                />
                <HomeStack.Screen
                    name="Profile" component={ProfileScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Notifications'
                    })}
                    name="Notifications" component={NotificationsScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Your Location'
                    })}
                    name="SetLocation" component={SetLocationScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Ask Doctor'
                    })}
                    name="AskDoctor" component={AskDoctorScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Contact Support'
                    })}
                    name="Support" component={SupportScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Find Hospitals'
                    })}
                    name="FindHospitals" component={FindHospitalsScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Find Pharmacies'
                    })}
                    name="FindPharmacies" component={FindPharmaScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Edit Profile'
                    })}
                    name="EditProfile" component={EditProfileScreen}
                />
                <HomeStack.Screen
                    options={() => ({
                        headerTitle: 'Change Password'
                    })}
                    name="ChangePassword" component={ChangePasswordScreen}
                />
            </HomeStack.Navigator >
        </NativeBaseProvider>
    );
};
const mapToStateProps = (state: ApplicationState) => ({
    userReducer: state.UserReducer
});

const HomeStackNavigator = connect(mapToStateProps, { OnUserNotificationsCount })(_HomeStackNavigator);

export default HomeStackNavigator;
