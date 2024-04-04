import { View, Text, Dimensions, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../../constants';

import { TransactionListItem } from "../../../components/TransactionListItem";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import ContentSheet from "../../../components/ContentSheet";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/user/types";
import { formatCurrency } from "react-native-format-currency";
import axios from 'axios';
import { BASE_URL } from '../../../utils';

import { connect } from 'react-redux';
import { ApplicationState, UserState, WalletState, TransactionModel, OnLoadWallet } from '../../../redux';

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

interface TransactionsScreenProps {
    userReducer: UserState;
    walletReducer: WalletState;
    OnLoadWallet: Function;
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const _TransactionsScreen: React.FC<TransactionsScreenProps> = (props) => {
    const { userReducer, walletReducer, OnLoadWallet } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [activeItem, setActiveItem] = useState<TransactionModel>();
    const [successMessage, setSuccessMessage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transactions, setTransactions] = useState<Array<TransactionModel>>([]);
    const [totalIn, setTotalIn] = useState(0);
    const [totalOut, setTotalOut] = useState(0);
    const [showContent, setShowContent] = useState(false);

    const closeContent = () => {
        setShowContent(false);
        setLoading(false);
    };
    const clearError = () => {
        setHasError(false);
        setLoading(false);
    };
    const handleSuccess = async () => {
        setIsSuccess(false);
        setLoading(false);
        // navigation.navigate('Login');
    };

    useEffect(() => {
        let mounted = true;
        const source = axios.CancelToken.source();
        (async () => {
            if (!mounted) {
                return;
            }
            try {
                setLoading(true);
                let existingUser = userReducer.user;
                let wallet = walletReducer.wallet;
                const response = await axios.get<string>(`${BASE_URL}user/transactions/all`, {
                    cancelToken: source.token,
                    headers: {
                        'Authorization': `Bearer ${existingUser.authToken}`
                    }
                });

                let resBody = response.data;

                if (resBody['status'] === 'error') {
                    setLoading(false);
                    setError('Unable to load transations');
                    setHasError(true);
                    return;
                } else {
                    if (!mounted) {
                        return;
                    }
                    let transactions = resBody['transactions'];
                    setTransactions(resBody['transactions']);
                    let income = 0;
                    let expense = 0;
                    for (let i = 0; i < transactions.length; i++) {
                        let currentItem = transactions[i];
                        if (currentItem.category === 'conversion' || currentItem.category === 'funding') {
                            income += currentItem.amount;
                        } else {
                            expense += currentItem.amount;
                        }
                    }
                    const [incomeValueFormattedWithSymbol, incomeValueFormattedWithoutSymbol, incomeSymbol] = formatCurrency({ amount: income / 100, code: "USD" });
                    const [expenseValueFormattedWithSymbol, expenseValueFormattedWithoutSymbol, expenseSymbol] = formatCurrency({ amount: expense / 100, code: "USD" });

                    setTotalIn(incomeValueFormattedWithoutSymbol);
                    setTotalOut(expenseValueFormattedWithoutSymbol);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                setError('Unable to load transations');
                setHasError(true);
                return;
            }


        })();
        return () => {
            source.cancel();
            mounted = false;
        };
    }, []);

    const showTransaction = async (id) => {
        try {
            setLoading(true);
            let currentItem = transactions.find((item) => item._id === id);
            if (currentItem) {
                setActiveItem(currentItem);
                setShowContent(true);
            }
        } catch (error) {
            setLoading(false);
            setError("Error kindly retry");
            setHasError(true);
        }
    };

    const TransactionContent = () => {
        if (activeItem) {
            const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: activeItem.amount / 100, code: "USD" });
            let formattedAmount = valueFormattedWithoutSymbol;
            return (
                <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
                    <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>Transaction Details</Text>
                    <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Date
                            </Text>
                            <Text style={styles.transactionRecordRight}>{new Date(activeItem.date).toDateString()}</Text>
                        </View>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Reference
                            </Text>
                            <Text style={styles.transactionRecordRight}>{activeItem.reference}</Text>
                        </View>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Category
                            </Text>
                            <Text style={{ ...styles.transactionRecordRight, textTransform: 'capitalize' }}>{activeItem.category}</Text>
                        </View>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Amount
                            </Text>
                            <Text style={{ ...styles.transactionRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{'\u20A6'}{formattedAmount}</Text>
                        </View>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Status
                            </Text>
                            <View style={[
                                styles.transactionRecordRight, { justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }]}
                            >
                                <Text style={[
                                    { maxWidth: 50 },
                                    activeItem.status === 'success'
                                        ? { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.pallete_deep, padding: 6 }
                                        : activeItem.status === 'failed'
                                            ? { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.negative, padding: 6 }
                                            : { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.dark, padding: 6 }
                                ]}
                                >
                                    {activeItem.status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.transactionRecord}>
                            <Text style={styles.transactionRecordLeft}>
                                Description
                            </Text>
                            <Text style={{ ...styles.transactionRecordRight }}>{activeItem.description}</Text>
                        </View>
                    </View>
                </View>
            );
        }
        return (<></>);

    };

    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={styles.container}>
                    <View style={{
                        marginBottom: 20,
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{ width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name='arrow-up-bold' style={{ fontSize: 24, marginRight: 4 }} color={COLORS.primary} />
                            <Text style={{ fontSize: SIZES.extraLarge, fontFamily: FONTS.semiBold, color: COLORS.pallete_green }}>{'\u20A6'}{totalIn}</Text>
                        </View>
                        <View style={{ width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name='arrow-down-bold' style={{ fontSize: 24, marginRight: 4 }} color={COLORS.negative} />
                            <Text style={{ fontSize: SIZES.extraLarge, fontFamily: FONTS.semiBold, color: COLORS.pallete_green }}>{'\u20A6'}{totalOut}</Text>
                        </View>
                    </View>
                    <TransactionsList transactions={transactions} viewTransaction={showTransaction} />

                    {<ContentSheet content={<TransactionContent />} open={showContent} closed={closeContent} />}
                    <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                    <ErrorSheet error={error} open={hasError} closed={clearError} />
                </View>

            </ScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};


const TransactionsList = ({ transactions, viewTransaction }) => {
    return (
        <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_white }}>
            <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Transaction Records</Text>
            <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{ width: '100%', marginTop: 0 }}>
                    {
                        transactions.map((item: TransactionModel) => (
                            <TransactionListItem
                                detail={item.category}
                                amount={item.amount}
                                description={item.description}
                                backgroundColor={COLORS.white}
                                tint={COLORS.fade}
                                color={COLORS.dark}
                                loading={false}
                                key={item._id}
                                id={item._id}
                                onTap={viewTransaction}
                            />
                        ))
                    }
                </View>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
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
    userReducer: state.UserReducer,
    walletReducer: state.WalletReducer
});

const TransactionsScreen = connect(mapToStateProps, { OnLoadWallet })(_TransactionsScreen);
export default TransactionsScreen;;