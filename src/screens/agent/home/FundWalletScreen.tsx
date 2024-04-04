import { View, Text, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { Paystack } from "react-native-paystack-webview";

import { COLORS, SIZES, FONTS } from '../../../constants';

import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import NoticeSheet from "../../../components/NoticeSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import { ListItemAlt } from "../../../components/ListItemAlt";

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/agent/types";
import { connect } from 'react-redux';
import { ApplicationState, AgentState, WalletState, WalletModel, SosocareBankModel, OnLoadWallet, OnVerifyTransaction, OnGetPayStackKey } from '../../../redux';
import Wizard, { WizardRef } from 'react-native-wizard';

import {
    NativeBaseProvider,
    extendTheme,
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

interface FundWalletScreenProps {
    agentReducer: AgentState;
    walletReducer: WalletState;
    OnLoadWallet: Function;
    OnVerifyTransaction: Function;
    OnGetPayStackKey: Function;
}

const _FundWalletScreen: React.FC<FundWalletScreenProps> = (props) => {
    const { agentReducer, walletReducer, OnLoadWallet, OnVerifyTransaction, OnGetPayStackKey } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasNotice, setHasNotice] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState(0);
    const [userWallet, setUserWallet] = useState<WalletModel>();
    const [sosocareBank, setSosocareBank] = useState<SosocareBankModel>()

    const wizard = useRef<WizardRef>(null);
    const [payingWithPayStack, setPayingWithPayStack] = useState(false);
    const [paystackKey, setPaystackKey] = useState('');
    const [isFirstStep, setIsFirstStep] = useState(true);
    const [isLastStep, setIsLastStep] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [verifying, setVerifying] = useState(false);


    const clearError = () => {
        setHasError(false);
        setLoading(false);
    };
    const handleNotice = () => {
        setHasNotice(false);
        setLoading(false);
    };
    const handleSuccess = async () => {
        setIsSuccess(false);
        setLoading(false);
        await OnLoadWallet('agent', agentReducer.agent.authToken);
        navigation.navigate('Home');
    };

    const handleMain = async (num: number) => {
        if (num === 1) {
            wizard.current!.next();
        } else if (num === 2) {
            try {
                setLoading(true);
                let res = await OnGetPayStackKey();
                if (res.success) {
                    setPaystackKey(res.paystack_public);
                    setLoading(false);
                    wizard.current!.goTo(2);
                } else {
                    setLoading(false);
                    setError('Unable to connect to Paystack, kindly try another method');
                    setHasError(true);
                }
            } catch (error) {
                setLoading(false);
                setError('Unable to connect to Paystack, kindly try another method');
                setHasError(true);
                return;
            }

        }
    };
    const payWithPayStack = (amount) => {
        if (amount) {
            try {
                setLoading(true);
                setPaymentAmount(amount);
                setPayingWithPayStack(true);

            } catch (error) {
                setLoading(false);
                setError(error.message);
                setHasError(true);
                return;
            }
        }
    };
    const handlePayError = () => {
        setLoading(false);
        setPayingWithPayStack(false);
        setError("Payment Error");
        setHasError(true);
    };
    const handlePayDone = async (reference) => {
        try {
            setVerifying(true);
            setLoading(false);

            let res = await OnVerifyTransaction(reference, 'agent');
            if (res.pending) {
                setVerifying(false);
                setLoading(false);
                setPayingWithPayStack(false);
                setHasNotice(true);
                setNoticeMessage('Confirmation pending. Your wallet will be credited once we confirm your payment');
                return;
            }
            if (res.error) {
                setVerifying(false);
                setLoading(false);
                setPayingWithPayStack(false);
                setError(res.error);
                setHasError(true);
                return;
            }
            if (res.success) {
                setVerifying(false);
                setLoading(false);
                setPayingWithPayStack(false);
                setSuccessMessage('Payment confirmed');
                setIsSuccess(true);
                return;
            }
        } catch (error) {
            setVerifying(false);
            setLoading(false);
            setPayingWithPayStack(false);
            setError(error.message);
            setHasError(true);
            return;
        }

    };
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            try {
                setLoading(true);
                let existingUser = agentReducer.agent;
                let wallet = walletReducer.wallet;
                setUserWallet(wallet);
                setSosocareBank(walletReducer.sosocareBank)
                setLoading(false);
                setEmail(existingUser.email || '');
                setPhone(existingUser.phone);
            } catch (error) {
                setLoading(false);
                setError('Unable to load Wallet');
                setHasError(true);
                return;
            }

        })();
        return () => {
            mounted = false;
        };
    }, []);

    const stepList = [
        {
            content: <Main handleSubmit={handleMain} loading={loading} />,
        },
        {
            content: <Transfer wallet={userWallet} sosocareBank={sosocareBank} handleSubmit={() => { }} loading={loading} />,
        },
        {
            content: <PayStack handleSubmit={payWithPayStack} loading={loading} />,
        },
    ];
    if (verifying) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size={'large'} />
                <Text
                    style={{
                        marginTop: 10,
                        textAlign: 'center',
                        fontSize: SIZES.large,
                        fontFamily: FONTS.semiBold,
                        color: COLORS.pallete_deep
                    }}
                >
                    Verifying transaction
                </Text>
            </View>
        );
    }
    if (payingWithPayStack) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Paystack
                    paystackKey={paystackKey}
                    amount={paymentAmount}
                    billingMobile={phone}
                    billingEmail={email}
                    onCancel={(e) => {
                        handlePayError();
                    }}
                    onSuccess={(res) => {
                        handlePayDone(res.transactionRef.reference);
                        // handle response here
                    }}
                    autoStart={true}
                />
            </View>);
    }
    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={styles.container}>
                    <View style={{ width: '100%', flex: 1 }}>
                        <Wizard
                            ref={wizard}
                            steps={stepList}
                            isFirstStep={val => setIsFirstStep(val)}
                            isLastStep={val => setIsLastStep(val)}
                            currentStep={({ currentStep, isLastStep, isFirstStep }) => {
                                setCurrentStep(currentStep);
                            }}
                        />
                    </View>

                    <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                    <ErrorSheet error={error} open={hasError} closed={clearError} />
                    <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
                </View>

            </ScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};

const Main = ({ handleSubmit, loading }) => {

    return (
        <View style={{ ...styles.stepContainer }}>
            <Text style={{ fontSize: SIZES.large, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep, marginBottom: 20 }}>Select a method to continue</Text>
            <ListItemAlt
                title='Bank Transfer'
                backgroundColor='white'
                color={COLORS.dark}
                tint={COLORS.fade}
                loading={false}
                onTap={() => handleSubmit(1)}
                width={'100%'}
                leftIcon={'bank-outline'}
            />
            <ListItemAlt
                title='Card'
                backgroundColor='white'
                color={COLORS.dark}
                tint={COLORS.fade}
                loading={false}
                onTap={() => handleSubmit(2)}
                width={'100%'}
                leftIcon={'credit-card-outline'}
            />
        </View>
    );
};

interface TransferProps {
    wallet?: WalletModel;
    sosocareBank?: SosocareBankModel;
    loading: boolean;
    handleSubmit: Function;
}
const Transfer: React.FC<TransferProps> = (props) => {
    const { handleSubmit, loading, wallet, sosocareBank } = props;
    return (
        <View style={{ ...styles.stepContainer }}>
            <View style={{ ...styles.insuranceContainer, marginBottom: 60, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.white }}>
                <Text style={{ ...styles.insuranceHeading, color: COLORS.gray, marginLeft: 6, fontSize: SIZES.medium + 4 }}>Your SOSOCARE Account</Text>
                {wallet && <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <View style={styles.transactionRecord}>
                        <Text style={styles.transactionRecordLeft}>
                            Account name
                        </Text>
                        <Text style={styles.transactionRecordRight}>{wallet.virtual_account_name ? wallet.virtual_account_name : sosocareBank.account_name}</Text>
                    </View>
                    <View style={styles.transactionRecord}>
                        <Text style={styles.transactionRecordLeft}>
                            Account number
                        </Text>
                        <Text style={styles.transactionRecordRight}>{wallet.virtual_account_number ? wallet.virtual_account_number : sosocareBank?.account_number}</Text>
                    </View>
                    <View style={styles.transactionRecord}>
                        <Text style={styles.transactionRecordLeft}>
                            Bank
                        </Text>
                        <Text style={styles.transactionRecordRight}>{wallet.virtual_account_bank ? wallet.virtual_account_bank : sosocareBank?.account_bank}</Text>
                    </View>
                </View>}
            </View>
            {wallet!.virtual_account_number ?
                <View><Text style={{ color: COLORS.pallete_deep, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'left', marginBottom: 8 }}>
                    Step 1: Transfer via any payment method to your SOSOCARE Virtual to account fund your wallet
                </Text>
                    <Text style={{ color: COLORS.pallete_deep, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'left', marginBottom: 20 }}>
                        Step 2: Click the "Verify transfer" button below to verify your transfer at anytime
                    </Text>
                </View>
                : <View><Text style={{ color: COLORS.pallete_deep, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'left', marginBottom: 8 }}>
                    Step 1: Transfer via any payment method to the SOSOCARE Bank account fund your wallet
                </Text>
                    <Text style={{ color: COLORS.pallete_deep, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'left', marginBottom: 20 }}>
                        Step 2: Contact {sosocareBank?.support_phone} via phone or whatsapp to confirm your transction.
                    </Text>
                </View>}
            {wallet?.virtual_account_bank && <ButtonWithTitle
                title={'Verify Transfer'}
                backgroundColor={COLORS.pallete_deep}
                loading={loading}
                onTap={handleSubmit}
                color={COLORS.white}
                width={'100%'}
            />}
        </View>
    );
};
const PayStack = ({ handleSubmit, loading }) => {
    const [amount, setAmount] = useState(0);
    const pay = () => {
        let paystackAmount = (amount * 100) / 100;
        handleSubmit(paystackAmount);
    };
    return (
        <View style={{ ...styles.stepContainer }}>
            <Text style={styles.headingText}>Card Payment (₦)</Text>
            <View style={{ width: '100%', justifyContent: 'flex-start' }}>
                <TextField
                    label='Amount'
                    handleChange={setAmount}
                    isNumber={true}
                    prefix={'\u20A6'}
                />
                <ButtonWithTitle
                    title={'Pay'}
                    color={COLORS.white}
                    backgroundColor={COLORS.pallete_deep}
                    loading={loading}
                    onTap={pay}
                    width={'100%'}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flex: 1
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
    walletReducer: state.WalletReducer
});

const FundWalletScreen = connect(mapToStateProps, { OnLoadWallet, OnVerifyTransaction, OnGetPayStackKey })(_FundWalletScreen);
export default FundWalletScreen;;