import { View, Text, Platform, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { COLORS, SIZES, FONTS } from '../../../constants';

import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { useNavigation } from "@react-navigation/native";
import { ClientDetailsScreenRouteProp, ClientScreenNavigationProp } from "../../../navigation/agent/types";
import { useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';

import { connect } from 'react-redux';
import {
    ApplicationState,
    AgentState,
    OnAgentGiveCash,
    OnLoadWallet
} from '../../../redux';

import { NativeBaseProvider, extendTheme } from "native-base";
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

interface PayoutCashProps {
    agentReducer: AgentState;
    OnAgentGiveCash: Function;
    OnLoadWallet: Function;
}

const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _PayoutCash: React.FC<PayoutCashProps> = (props) => {
    const { agentReducer, OnAgentGiveCash, OnLoadWallet } = props;
    const navigation = useNavigation<ClientScreenNavigationProp>();
    const route = useRoute<ClientDetailsScreenRouteProp>();
    const { client } = route.params;

    const [inLoading, setInLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState(0);

    // notice handlers
    const clearError = () => {
        setHasError(false);
        setLoading(false);
    };
    const handleSuccess = async () => {
        setIsSuccess(false);
        setLoading(false);
        await OnLoadWallet('agent', agentReducer.agent.authToken);
        navigation.navigate('ClientDetails', { client });
    };


    // principal actions
    const WithdrawFunds = async (amount) => {
        try {
            setLoading(true);
            if (amount < 100) {
                setLoading(false);
                setError('Withdrawal amount must be greater than ₦100');
                setHasError(true);
                return;
            }
            let res = await OnAgentGiveCash(amount, client._id);
            if (res.error) {
                setLoading(false);
                setError(res.error);
                setHasError(true);
                return;
            }
            if (res.success) {
                setLoading(false);
                setSuccessMessage('Your transfer is been processed');
                setIsSuccess(true);
                return;
            }
        } catch (error) {
            setLoading(false);
            setError('Withdrawal failed');
            setHasError(true);
            return;
        }
    };




    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                <View style={styles.container}>
                    <View style={{ width: '100%', flex: 1 }}>
                        <View style={{ ...styles.stepContainer }}>
                            <Text style={{...styles.headingText, fontSize:18}}>Cash amount you gave Client (₦)</Text>
                            <View style={{ width: '100%', justifyContent: 'flex-start' }}>
                                <TextField
                                    label='Amount'
                                    handleChange={setWithdrawalAmount}
                                    isNumber={true}
                                    prefix={'\u20A6'}
                                />
                                <ButtonWithTitle
                                    title={'Submit'}
                                    color={COLORS.white}
                                    backgroundColor={COLORS.pallete_deep}
                                    loading={loading}
                                    onTap={() => WithdrawFunds(withdrawalAmount)}
                                    width={'100%'}
                                />
                            </View>
                        </View>
                    </View>

                    <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                    <ErrorSheet error={error} open={hasError} closed={clearError} />
                </View>

            </KeyboardAwareScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    stepContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flex: 1
    },
    label: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.gray,
        marginBottom: 10
    },
    transactionHeading: {
        fontSize: SIZES.large,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginBottom: 18,
        width: '100%'
    },
    transactionRecord: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.fade,
        paddingVertical: 10,
        paddingHorizontal: 6,
    },
    transactionRecordLeft: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.pallete_deep,
        flex: 2,
    },
    transactionRecordRight: {
        flex: 5,
        fontSize: SIZES.medium,
        fontFamily: FONTS.medium,
        color: COLORS.gray,
        flexShrink: 1
    },
    insuranceContainer: {
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        paddingTop: 30,
        paddingBottom: 30,
        marginBottom: 20,
        paddingHorizontal: 18,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderTopEndRadius: 15,
        elevation: 5,
        shadowColor: 'rgb(230, 235, 243)',
        shadowOffset: { width: 4, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    insuranceHeading: {
        fontSize: SIZES.large,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginBottom: 18,
        width: '100%'
    },
    insurancePlan: {
        fontSize: SIZES.extraLarge,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginBottom: 6
    },
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fefefe',
        paddingHorizontal: 24,
        paddingTop: 20
    },
    imageBg: {
        resizeMode: 'cover',
        width: "100%",
        height: "100%",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headingText: {
        fontFamily: FONTS.semiBold,
        fontSize: SIZES.heading,
        color: COLORS.dark,
        marginBottom: SIZES.font,
        textAlign: 'center'
    },
    errorText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.negative,
        marginTop: -26,
        marginBottom: 10,
    },
    subHeadingText: {
        fontFamily: FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        marginBottom: 20,
        textAlign: 'center'
    },
});


const mapToStateProps = (state: ApplicationState) => ({
    agentReducer: state.AgentReducer,
});

const PayoutCash = connect(mapToStateProps, { OnAgentGiveCash, OnLoadWallet })(_PayoutCash);
export default PayoutCash;