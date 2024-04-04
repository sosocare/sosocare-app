import { View, Text, Platform, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

import { ClientDetailsScreenRouteProp, ClientScreenNavigationProp } from "../../../navigation/agent/types";
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";

import { COLORS, FONTS, SIZES } from '../../../constants';
import NoticeSheet from "../../../components/NoticeSheet";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import SelectField from "../../../components/SelectField";

import { connect } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../utils';

import { Formik } from 'formik';
import * as yup from 'yup';
import * as Location from 'expo-location';
import { ApplicationState, AgentState, InsuranceModel, OnLoadAgentClient, LocationModel, OnAgentSetCareCentre } from '../../../redux';
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

interface ClientInsuranceScreenProps {
    agentReducer: AgentState;
    OnLoadAgentClient: Function;
    OnAgentSetCareCentre: Function;
}


interface HospitalModel {
    name: string;
    address: string;
}

interface PharmaModel {
    pharmacyCode: string;
    pharmacyName: string;
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

const wait = (timeout: number) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};
const _ClientInsurance: React.FC<ClientInsuranceScreenProps> = (props) => {
    const { agentReducer, OnLoadAgentClient, OnAgentSetCareCentre } = props;
    const route = useRoute<ClientDetailsScreenRouteProp>();
    const { client } = route.params;
    const navigation = useNavigation<ClientScreenNavigationProp>();

    const [inLoading, setInLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasNotice, setHasNotice] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [insurance, setInsurance] = useState<InsuranceModel>();

    const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
    const [addressState, setAddressState] = useState('');
    const [city, setCity] = useState('');
    const [cities, setCities] = useState([]);
    const [street, setStreet] = useState('');
    const [displayAddress, setDisplayAddress] = useState("Waiting for Current Location");
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
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
        setIsSuccess(false);
        navigation.navigate('ClientDetails', { client });
    };
    const handleNotice = () => {
        setHasNotice(false);
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            setInLoading(true);
            let res = await OnLoadAgentClient(client._id);
            if (res.success) {
                if (!mounted) {
                    return;
                }
                setInsurance(res.insurance);
                setInLoading(false);
            } else if (res.error) {
                setInLoading(false);
                setError(res.error);
                setHasError(true);
            }
            let existingLocation: LocationModel = agentReducer.location;
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
    }, [reload]);

    const onRefresh = useCallback(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            setRefreshing(true);
            setReload(prev => !prev);
            wait(2000).then(() => setRefreshing(false));
        })();

        return () => {
            mounted = false;
        };

    }, []);

    const states = [
        { title: "Abia", value: "Abia" },
        { title: "Adamawa", value: "Adamawa" },
        { title: "Akwa Ibom", value: "Akwa Ibom" },
        { title: "Anambra", value: "Anambra" },
        { title: "Bauchi", value: "Bauchi" },
        { title: "Bayelsa", value: "Bayelsa" },
        { title: "Benue", value: "Benue" },
        { title: "Borno", value: "Borno" },
        { title: "Cross River", value: "Cross River" },
        { title: "Delta", value: "Delta" },
        { title: "Ebonyi", value: "Ebonyi" },
        { title: "Edo", value: "Edo" },
        { title: "Ekiti", value: "Ekiti" },
        { title: "Enugu", value: "Enugu" },
        { title: "FCT - Abuja", value: "FCT - Abuja" },
        { title: "Gombe", value: "Gombe" },
        { title: "Imo", value: "Imo" },
        { title: "Jigawa", value: "Jigawa" },
        { title: "Kaduna", value: "Kaduna" },
        { title: "Kano", value: "Kano" },
        { title: "Katsina", value: "Katsina" },
        { title: "Kebbi", value: "Kebbi" },
        { title: "Kogi", value: "Kogi" },
        { title: "Kwara", value: "Kwara" },
        { title: "Lagos", value: "Lagos" },
        { title: "Nasarawa", value: "Nasarawa" },
        { title: "Niger", value: "Niger" },
        { title: "Ogun", value: "Ogun" },
        { title: "Ondo", value: "Ondo" },
        { title: "Osun", value: "Osun" },
        { title: "Oyo", value: "Oyo" },
        { title: "Plateau", value: "Plateau" },
        { title: "Rivers", value: "Rivers" },
        { title: "Sokoto", value: "Sokoto" },
        { title: "Taraba", value: "Taraba" },
        { title: "Yobe", value: "Yobe" },
        { title: "Zamfara", value: "Zamfara" },

    ];
    const CentreSchema = yup.object().shape({
        state: yup.string().required('State is required'),
        city: yup.string().required('City is required'),
        centre: yup.string().required(`Preferred ${insurance?.plan === 'Sosocare Basic Plan' ? 'Pharmacy' : 'Hospital'} is required`),
    });

    const findHospitals = async () => {
        const state = addressState
        const lga = city
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
                if (!resBody.hospitals || resBody.hospitals && resBody.hospitals.length === 0) {
                    setLoading(false);
                    return;
                }
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

    const findPharmas = async () => {
        const state = addressState
        const lga = city
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
            if (resBody['status'] === 'error') {
                setLoading(false);
                setError("Error loading pharmacies");
                setHasError(true);
                return;
            } else {
                if (!resBody.pharmacies || resBody.pharmacies && resBody.pharmacies.length === 0) {
                    setLoading(false);
                    return;
                }
                setPharmas(resBody.pharmacies);
                let thisPhams: SelectPharmaModel[] = [];
                for (let i = 0; i < resBody.pharmacies.length; i++) {
                    let pharm: PharmaModel = resBody.pharmacies[i];
                    thisPhams.push({
                        title: `${pharm.pharmacyName}: ${pharm.address}`,
                        value: pharm.pharmacyCode
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

    const handleSubmit = async ({ centre }) => {
        let selectedHosp: HospitalModel | undefined;
        let selectedPharma: PharmaModel | undefined;
        if (insurance) {
            if (insurance.plan === 'Sosocare Basic Plan') {
                let theOne = await pharmas.find((item) => item.pharmacyCode === centre);
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
        }

        try {
            if (insurance) {
                setLoading(true);
                let res = await OnAgentSetCareCentre(insurance._id, client._id, selectedHosp, selectedPharma);
                if (res.error) {
                    setError(res.error);
                    setLoading(false);
                    setHasError(true);
                }
                if (res.success) {
                    setLoading(false);
                    setSuccessMessage('Primary care center updated');
                    setIsSuccess(true);
                }
            }
        } catch (e) {
            setError(e);
            setHasError(true);
            setLoading(false);
        }


    };
    useEffect(() => {
        const source = axios.CancelToken.source();
        let mounted = true;
        (async () => {
            if (!addressState || addressState === '') return;
            if (!mounted) {
                return;
            }
            setLoading(true);
            try {
                if (!mounted) {
                    return;
                }
                const configurationObject = {
                    method: 'get',
                    url: `https://locus.fkkas.com/api/regions/${addressState.toLowerCase()}`,
                    cancelToken: source.token,
                };
                const response = await axios(configurationObject);

                let resBody = response.data;
                if (!mounted) {
                    return;
                }
                if (resBody['data']) {
                    let allCities = resBody['data'].map((item: any) => {
                        return { title: item.name, value: item.name };
                    });
                    setCities(allCities);
                    let isExist = allCities.find((item) => item.title === city);
                    if (!isExist) {
                        let defaultCity = allCities[0].title;
                        setCity(defaultCity);
                        setStreet('');
                    }
                    setLoading(false);
                    return;
                } else {
                    setError("Unable to get cities for this state");
                    setHasError(true);
                    setLoading(false);
                }

            } catch (error) {
                if (!mounted) {
                    return;
                }
                if (axios.isCancel(error)) {
                } else {
                    setError(error.message || "Unable to get cities for this state");
                    setHasError(true);
                    setLoading(false);
                    return;
                }

            }

        })();
        return () => {
            source.cancel();
            mounted = false;
        };
    }, [addressState]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!city || city === '') return;
            if (!mounted) {
                return;
            }
            setLoading(true);
            try {
                if (!mounted) {
                    return;
                }

                if (insurance) {
                    if (insurance.plan === "Sosocare Basic Plan") {
                        await findPharmas();
                    } else if (insurance.plan === "Sosocare Silver Plan") {
                        await findHospitals();
                    } else {
                        await findPharmas();
                        await findHospitals();
                    }
                }
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setError(error.message || "Unable to get pharmacies for this region");
                setHasError(true);
                setLoading(false);
                return;

            }

        })();
        return () => {
            mounted = false;
        };
    }, [city]);


    if (inLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'white', width: '100%', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }
    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                style={{ flex: 1, backgroundColor: 'white' }}
            >
                <View style={{ width: "100%" }}>
                    <View style={styles.container}>
                        <View style={styles.formContainer}>
                            <Text style={{ ...styles.headingText }}>{insurance?.plan}</Text>
                            <Text style={{ ...styles.subHeadingText }}>
                                Set {client.first_name} {client.last_name} primary {insurance?.plan === 'Sosocare Basic Plan' ? 'Pharmacy' : 'Hospital'} care center to enjoy your Insurance cover
                            </Text>
                            <View style={styles.form}>
                                <Formik
                                    initialValues={{
                                        state: addressState,
                                        city: city,
                                        centre: "",
                                    }}
                                    onSubmit={values => {
                                        handleSubmit(values);
                                    }}
                                    validationSchema={CentreSchema}
                                >
                                    {({ errors, touched, handleChange, handleSubmit, values }) => (
                                        <View style={{ width: '100%' }}>
                                            <Text style={styles.label}>State</Text>
                                            <SelectField
                                                hasIcon={false}
                                                label='State'
                                                handleChange={async (val) => {
                                                    handleChange('state')(val);
                                                    setAddressState(val);
                                                }}
                                                options={states}
                                                value={addressState}
                                                isDisabled={loading}
                                            />
                                            {errors.state && touched.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
                                            <Text style={styles.label}>City/LGA</Text>
                                            <SelectField
                                                hasIcon={false}
                                                label='City'
                                                handleChange={async (val) => {
                                                    handleChange('city')(val);
                                                    setCity(val);
                                                }}
                                                options={cities}
                                                value={city}
                                                isDisabled={loading ? true : city && city !== '' ? false : addressState && addressState !== '' ? false : true}
                                            />
                                            {errors.city && touched.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

                                            {insurance && insurance.plan === "Sosocare Basic Plan" && (<View>
                                                <Text style={styles.label}>Preferred Pharmacy</Text>
                                                <SelectField
                                                    hasIcon={false}
                                                    label='Preferred Pharmacy'
                                                    handleChange={handleChange('centre')}
                                                    options={optionsPharmas}
                                                    isDisabled={loading ? true : pharmas.length < 1 ? true : city && city !== '' ? false : true}
                                                />
                                                {errors.centre && touched.centre ? <Text style={styles.errorText}>{errors.centre}</Text> : null}
                                            </View>)}
                                            {insurance && insurance.plan === "Sosocare Silver Plan" && (<View>
                                                <Text style={styles.label}>Preferred Hospital</Text>
                                                <SelectField
                                                    hasIcon={false}
                                                    label='Preferred Hospital'
                                                    handleChange={handleChange('centre')}
                                                    options={optionsHospitals}
                                                    isDisabled={loading ? true : hospitals.length < 1 ? true : city && city !== '' ? false : true}
                                                />
                                                {errors.centre && touched.centre ? <Text style={styles.errorText}>{errors.centre}</Text> : null}
                                            </View>)}
                                            <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
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

            </ScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};


const styles = StyleSheet.create({
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
    wasteHeading: {
        fontSize: SIZES.large,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
        marginBottom: 18,
        width: '100%'
    },
    wasteRecord: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.fade,
        paddingVertical: 10,
        paddingHorizontal: 6,
    },
    wasteRecordLeft: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.pallete_deep,
        flex: 2,
    },
    wasteRecordRight: {
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
        paddingBottom: 100
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
    agentReducer: state.AgentReducer
});

const ClientInsurance = connect(mapToStateProps, { OnLoadAgentClient, OnAgentSetCareCentre })(_ClientInsurance);
export default ClientInsurance;