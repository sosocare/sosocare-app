import { View, Text, Platform, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Paystack } from "react-native-paystack-webview";
import { PlanScreenRouteProp } from "../../../navigation/user/types";
import { useRoute } from '@react-navigation/native';
import { formatCurrency } from "react-native-format-currency";

import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import NoticeSheet from "../../../components/NoticeSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';

import { Formik } from 'formik';
import * as yup from 'yup';
import * as Location from 'expo-location';

import { InsuranceScreenNavigationProp } from "../../../navigation/user/types";
import { useNavigation } from "@react-navigation/native";

import axios from 'axios';
import { BASE_URL } from '../../../utils';

import { connect } from 'react-redux';
import { ApplicationState, UserState, InsuranceState, LocationModel, OnBuyInsurance, OnLoadInsurance, OnGetPayStackKey } from '../../../redux';
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

interface BuyPlanScreenProps {
    userReducer: UserState;
    insuranceReducer: InsuranceState;
    OnBuyInsurance: Function;
    OnLoadInsurance: Function;
    OnGetPayStackKey: Function;
}

interface HospitalModel {
    name: string;
    address: string;
}

interface PharmaModel {
    email: string;
    phone: string;
    name: string;
    state: string;
    lga: string;
    address: string;
}
interface SelectPharmaModel {
    title: string;
    value: string;
}
interface SelectHospitalModel {
    title: string;
    value: string;
}

const _BuyPlanScreen: React.FC<BuyPlanScreenProps> = (props) => {
    const route = useRoute<PlanScreenRouteProp>();
    const navigation = useNavigation<InsuranceScreenNavigationProp>();
    const { userReducer, insuranceReducer, OnBuyInsurance, OnGetPayStackKey, OnLoadInsurance } = props;
    const { plan } = route.params;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasNotice, setHasNotice] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [duration, setDuration] = useState("1 month");
    const [payingWithPayStack, setPayingWithPayStack] = useState(false);
    const [paystackKey, setPaystackKey] = useState('');
    const [verifying, setVerifying] = useState(false);

    const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
    const [addressState, setAddressState] = useState('');
    const [city, setCity] = useState('');
    const [cities, setCities] = useState([]);
    const [street, setStreet] = useState('');
    const [displayAddress, setDisplayAddress] = useState("Waiting for Current Location");

    const [hospitals, setHospitals] = useState<Array<HospitalModel>>([]);
    const [optionsHospitals, setOptionsHospitals] = useState<Array<SelectHospitalModel>>([]);
    const [pharmas, setPharmas] = useState<Array<PharmaModel>>([]);
    const [optionsPharmas, setOptionsPharmas] = useState<Array<SelectPharmaModel>>([]);
    const [activePharma, setActivePharma] = useState<PharmaModel>();
    const [activeHospital, setActiveHospital] = useState<HospitalModel>();

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = async () => {
        await OnLoadInsurance("user", userReducer.user.authToken);
        setIsSuccess(false);
        navigation.navigate('Insurance');
    };
    const handleNotice = () => {
        setHasNotice(false);
        setLoading(false);
    };

    const durations = [
        { title: "1 month", value: "1 month" },
        { title: "2 months", value: "2 months" },
        { title: "3 months", value: "3 months" },
        { title: "4 months", value: "4 months" },
        { title: "5 months", value: "5 months" },
        { title: "6 months", value: "6 months" },
    ];
    const methods = [
        { title: "Wallet", value: "Wallet" },
        { title: "Paystack", value: "Paystack" }
    ];
    const PurchaseSchema = yup.object().shape({
        duration: yup.string().required('Duration is required'),
        payment_method: yup.string().required('Payment Method is required'),
        amount: yup.string().required(),
        centre: yup.string().required(`Preferred ${plan.name === 'Sosocare Basic Plan' ? 'Pharmacy' : 'Hospital'} is required`),
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            const [incomeValueFormattedWithSymbol, incomeValueFormattedWithoutSymbol, incomeSymbol] = formatCurrency({ amount: plan.price / 100, code: "USD" });
            setTotalAmount(incomeValueFormattedWithoutSymbol);
            setPhone(userReducer.user.phone);
            setEmail(userReducer.user.email || '');
            let existingLocation: LocationModel = userReducer.location;
            if (existingLocation.address_city && existingLocation.address_state) {
                setAddress({
                    region: existingLocation.address_state,
                    city: existingLocation.address_city,
                    street: existingLocation.address_street,
                    district: '',
                    country: existingLocation.address_country,
                    streetNumber: '',
                    subregion: '',
                    postalCode: '',
                    name: '',
                    isoCountryCode: '',
                    timezone: ''
                });
                setAddressState(existingLocation.address_state);
                setCity(existingLocation.address_city);
                setStreet(existingLocation.address_street || '');
                if (plan.name === "Sosocare Basic Plan") {
                    await findPharmas(existingLocation.address_state, existingLocation.address_city);
                } else if (plan.name === "Sosocare Silver Plan") {
                    await findHospitals(existingLocation.address_state, existingLocation.address_city);
                } else {
                    await findPharmas(existingLocation.address_state, existingLocation.address_city);
                    await findHospitals(existingLocation.address_state, existingLocation.address_city);
                }
                return;
            }
            if (addressState && addressState !== '') return;
            setLoading(true);
            try {
                if (!mounted) {
                    return;
                }
                let { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    setError('Permission to access location is not granted');
                    setHasError(true);
                    setLoading(false);
                }

                let location: any = await Location.getCurrentPositionAsync({});

                const { coords } = location;

                if (coords) {
                    const { latitude, longitude } = coords;
                    if (!mounted) {
                        return;
                    }
                    let addressResponse: any = await Location.reverseGeocodeAsync({ latitude, longitude });
                    let region = "";
                    let lga = "";
                    for (let item of addressResponse) {
                        setLoading(false);
                        setAddress(item);
                        // onUpdateLocation(item)
                        let currentAddress = `${item.name},${item.street}, ${item.postalCode}, ${item.country}`;
                        setDisplayAddress(currentAddress);
                        setAddressState(item.region);
                        region = item.region;
                        lga = item.city;
                        setCity(item.city);
                        setStreet(item.street);
                        return;
                    }

                    if (plan.name === "Sosocare Basic Plan") {
                        await findPharmas(region, lga);
                    } else if (plan.name === "Sosocare Silver Plan") {
                        await findHospitals(region, lga);
                    } else {
                        await findPharmas(region, lga);
                        await findHospitals(region, lga);
                    }
                    setLoading(false);
                } else {
                    //notify user something went wrong with location
                    setError("Could't get location automatically");
                    setHasError(true);
                    setLoading(false);
                }



            } catch (error) {
                if (!mounted) {
                    return;
                }
                setError(error.message);
                setHasError(true);
                setLoading(false);
                return;
            }

        })();
        return () => {
            mounted = false;
        };
    }, []);


    const handleSubmit = async ({ duration, payment_method, centre }) => {
        let selectedHosp: HospitalModel | undefined;
        let selectedPharma: PharmaModel | undefined;
        if (plan.name === 'Sosocare Basic Plan') {
            let theOne = await pharmas.find((item) => item.name === centre);
            if (theOne) {
                selectedPharma = theOne;
                setActivePharma(theOne);
            }
        } else {
            let theOne = await hospitals.find((item) => item.name === centre);
            if (theOne) {
                selectedHosp = theOne;
                setActiveHospital(theOne);
            }
        }
        if (payment_method === 'Paystack') {
            try {
                setLoading(true);
                let res = await OnGetPayStackKey();
                if (res.success) {
                    setPaystackKey(res.paystack_public);
                    setLoading(false);
                    setPayingWithPayStack(true);
                    return;
                } else {
                    setLoading(false);
                    setError('Unable to connect to Paystack, kindly try another method');
                    setHasError(true);
                    return;
                }
            } catch (error) {
                setLoading(false);
                setError('Unable to connect to Paystack, kindly try another method');
                setHasError(true);
                return;
            }
        } else if (payment_method === 'Wallet') {
            setLoading(true);
            try {
                let res = await OnBuyInsurance(plan._id, duration, payment_method, null, 'user', selectedHosp, selectedPharma);
                if (res.error) {
                    setError(res.error);
                    setLoading(false);
                    setHasError(true);
                }
                if (res.success) {
                    setLoading(false);
                    setSuccessMessage('Congratulations, you now have Insurance cover at all of our partner facilities.');
                    setIsSuccess(true);
                }

            } catch (e) {
                setError(e);
                setHasError(true);
                setLoading(false);
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

            let res = await OnBuyInsurance(plan._id, duration, 'Paystack', reference, 'user', activeHospital, activePharma);
            if (res.pending) {
                setVerifying(false);
                setLoading(false);
                setPayingWithPayStack(false);
                setHasNotice(true);
                setNoticeMessage('Confirmation pending. Your Insurance will be activated once we confirm your payment');
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
                setSuccessMessage('Congratulations, you now have Insurance cover at all of our partner facilities.');
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

    const findHospitals = async (state, lga) => {
        try {
            setLoading(true);
            const configurationObject = {
                method: 'post',
                url: `${BASE_URL}hospitals`,
                data: {
                    state: state ? state : addressState,
                    lga: lga ? lga : city
                }
            };
            const response = await axios(configurationObject);
            let resBody = response.data;

            if (resBody['status'] === 'error') {
                setLoading(false);
                setError("Error loading hospitals");
                setHasError(true);
                return;
            } else {
                setHospitals(resBody.hospitals);
                let thisHosps: SelectHospitalModel[] = [];
                for (let i = 0; i < resBody.hospitals.length; i++) {
                    let hops: HospitalModel = resBody.hospitals[i];
                    thisHosps.push({
                        title: `${hops.name}`,
                        value: hops.name
                    });
                }
                setOptionsHospitals(thisHosps);
                setLoading(false);
                return;

            }
        } catch (error) {
            setLoading(false);
            setError(error.message);
            setHasError(true);
            return;
        }
    };

    const findPharmas = async (state, lga) => {
        try {
            setLoading(true);
            const configurationObject = {
                method: 'post',
                url: `${BASE_URL}pharmacies`,
                data: {
                    state: state ? state : addressState,
                    lga: lga ? lga : city
                }
            };
            const response = await axios(configurationObject);

            let resBody = response.data;
            console.log("pharamcies: ", resBody)
            if (resBody['status'] === 'error') {
                setLoading(false);
                setError("Error loading pharmacies");
                setHasError(true);
                return;
            } else {
                setPharmas(resBody.pharmacies);
                let thisPhams: SelectPharmaModel[] = [];
                for (let i = 0; i < resBody.pharmacies.length; i++) {
                    let pharm: PharmaModel = resBody.pharmacies[i];
                    thisPhams.push({
                        title: pharm.name,
                        value: pharm.name
                    });
                }
                setOptionsPharmas(thisPhams);
                setLoading(false);
                return;

            }
        } catch (error) {
            setLoading(false);
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
            let multiplier = parseInt(duration.charAt(0));
            let totalPrice = plan.price * multiplier;
            setPaymentAmount(((totalPrice / 100) * 100) / 100);
            const [incomeValueFormattedWithSymbol, incomeValueFormattedWithoutSymbol, incomeSymbol] = formatCurrency({ amount: totalPrice / 100, code: "USD" });
            setTotalAmount(incomeValueFormattedWithoutSymbol);
        })();

        return () => {
            mounted = false;
        };
    }, [duration]);

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
    } else if (payingWithPayStack) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Paystack
                    paystackKey={paystackKey}
                    amount={paymentAmount}
                    billingMobile={phone}
                    billingEmail={email}
                    onCancel={(e) => {
                        handlePayError();
                        // handle response here
                    }}
                    onSuccess={(res) => {
                        handlePayDone(res.transactionRef.reference);
                        // handle response here
                    }}
                    autoStart={true}
                />
            </View>);
    } else {
        return (
            <NativeBaseProvider theme={theme}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                    <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                        <View style={styles.container}>
                            <View style={styles.formContainer}>
                                <Text style={{ ...styles.headingText }}>{plan.ussd_name}</Text>
                                <Text style={{ ...styles.subHeadingText }}>
                                    Select Duration and Method of Payment
                                </Text>
                                <View style={styles.form}>
                                    <Formik
                                        initialValues={{
                                            duration: "1 month",
                                            payment_method: "Wallet",
                                            amount: totalAmount,
                                            centre: "",
                                        }}
                                        onSubmit={values => {
                                            handleSubmit(values);
                                        }}
                                        validationSchema={PurchaseSchema}
                                    >
                                        {({ errors, touched, handleChange, handleSubmit, values }) => (
                                            <View style={{ width: '100%' }}>
                                                <Text style={styles.label}>Duration</Text>
                                                <SelectField
                                                    hasIcon={false}
                                                    label='Duration'
                                                    handleChange={(val) => {
                                                        handleChange('duration')(val);
                                                        setDuration(val);
                                                    }}
                                                    options={durations}
                                                    isDisabled={true}
                                                    value={values.duration}
                                                />
                                                {errors.duration && touched.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
                                                <Text style={styles.label}>Payment Method</Text>
                                                <SelectField
                                                    hasIcon={false}
                                                    label='Payment Method'
                                                    handleChange={handleChange('payment_method')}
                                                    options={methods}
                                                    isDisabled={loading}
                                                    value={values.payment_method}
                                                />
                                                {errors.payment_method && touched.payment_method ? <Text style={styles.errorText}>{errors.payment_method}</Text> : null}
                                                <Text style={styles.label}>Total Amount</Text>
                                                <TextField
                                                    isNumber={true}
                                                    prefix={'\u20A6'}
                                                    label='Amount'
                                                    isSecure={false}
                                                    isDisabled={true}
                                                    handleChange={handleChange('amount')}
                                                    value={totalAmount.toString()}
                                                />
                                                {plan.name === "Sosocare Basic Plan" && (<View>
                                                    <Text style={styles.label}>Preferred Pharmacy</Text>
                                                    <SelectField
                                                        hasIcon={false}
                                                        label='Preferred Pharmacy'
                                                        handleChange={handleChange('centre')}
                                                        options={optionsPharmas}
                                                        isDisabled={loading ? true : pharmas.length < 1 ? true : false}
                                                    />
                                                    {errors.centre && touched.centre ? <Text style={styles.errorText}>{errors.centre}</Text> : null}
                                                </View>)}
                                                {plan.name === "Sosocare Silver Plan" && (<View>
                                                    <Text style={styles.label}>Preferred Hospital</Text>
                                                    <SelectField
                                                        hasIcon={false}
                                                        label='Preferred Hospital'
                                                        handleChange={handleChange('centre')}
                                                        options={optionsHospitals}
                                                        isDisabled={loading ? true : hospitals.length < 1 ? true : false}
                                                    />
                                                    {errors.centre && touched.centre ? <Text style={styles.errorText}>{errors.centre}</Text> : null}
                                                </View>)}
                                                <ButtonWithTitle loading={loading} noBg={false} title={'Pay'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                                            </View>
                                        )}
                                    </Formik>
                                </View>
                            </View>
                        </View>
                        <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                        <ErrorSheet error={error} open={hasError} closed={clearError} />
                        <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
                    </View>
                </KeyboardAwareScrollView>
                <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            </NativeBaseProvider>
        );
    }
};

const styles = StyleSheet.create({
    insuranceContainer: {
        width: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        paddingTop: 30,
        paddingBottom: 10,
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
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginBottom: 18
    },
    formContainer: {
        flex: 5,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 30
    },
    form: {
        width: '100%',
        flexDirection: 'column',
    },
    label: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.gray,
        marginBottom: 10
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
        marginBottom: 60
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
    insuranceReducer: state.InsuranceReducer
});

const BuyPlanScreen = connect(mapToStateProps, { OnBuyInsurance, OnLoadInsurance, OnGetPayStackKey })(_BuyPlanScreen);
export default BuyPlanScreen;