import React, { useState, useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecordStackNavigatorParamList } from './types';

// SCREENS
import RecordsScreen from "../../screens/agent/RecordsScreen";
import Ionicons from '@expo/vector-icons/Ionicons';

// CONSTANTS
import { COLORS, FONTS, SIZES } from '../../constants';

import { OnAgentNotificationsCount, ApplicationState, AgentState } from "../../redux";
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

const RecordStack = createNativeStackNavigator<RecordStackNavigatorParamList>();

interface RecordStackProps {
    agentReducer: AgentState;
    OnAgentNotificationsCount: Function;
}
const _RecordStackNavigator: React.FC<RecordStackProps> = (props) => {
    const { agentReducer, OnAgentNotificationsCount } = props;
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
                let res = await OnAgentNotificationsCount();
                if (res.success) {
                    setUnreadCount(res.count);
                }
                // mounted = false;
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
    }, [agentReducer.agent.image]);

    return (
        <NativeBaseProvider theme={theme}>
            <RecordStack.Navigator
                screenOptions={({ navigation }) => ({
                    headerStyle: { backgroundColor: COLORS.white },
                    headerTitleStyle: { color: COLORS.dark, },
                    headerBackTitleVisible: false,
                    headerBackVisible: false,
                    headerLeft: () => (
                        <Pressable
                            onPress={() => navigation.navigate('Clients')}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.5 : 1,
                                marginLeft: -10,
                                marginRight: Platform.OS === 'android' ? 10 : 0
                            })}
                        >
                            <Ionicons name="ios-chevron-back" style={{ fontSize: 24, marginLeft: 0, padding: 0 }} color={COLORS.dark} />
                        </Pressable>
                    ),
                    headerBackTitle: 'Back'
                })}
            >
                <RecordStack.Screen
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
                        headerTitle: 'Transactions',
                        headerTitleStyle: { color: COLORS.dark, fontSize: SIZES.large, fontFamily: FONTS.medium },
                        headerLeft: () => (
                            <Pressable
                                onPress={() => navigation.navigate('HomeStack', { screen: 'Profile' })}
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
                                onPress={() => navigation.navigate('HomeStack', { screen: 'Notifications' })}
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
                    name="AgentRecords" component={RecordsScreen}
                />
            </RecordStack.Navigator >
        </NativeBaseProvider>
    );
};
const mapToStateProps = (state: ApplicationState) => ({
    agentReducer: state.AgentReducer
});

const RecordStackNavigator = connect(mapToStateProps, { OnAgentNotificationsCount })(_RecordStackNavigator);

export default RecordStackNavigator;