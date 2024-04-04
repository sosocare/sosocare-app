import { View, Text, Platform, SafeAreaView, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';
import axios from 'axios';
import { BASE_URL } from '../../../utils';

import { connect } from 'react-redux';
import { ApplicationState, AgentState, OnUpdateAgentLocation, LocationModel } from '../../../redux';

import { Formik } from 'formik';
import * as yup from 'yup';
import * as Location from 'expo-location';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/agent/types";

import {
    NativeBaseProvider,
    extendTheme,
    Image,
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
interface SetLocationProps {
    agentReducer: AgentState;
    OnUpdateAgentLocation: Function;
}
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const _SetLocationScreen: React.FC<SetLocationProps> = (props) => {
    const { agentReducer, OnUpdateAgentLocation } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

    const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
    const [addressState, setAddressState] = useState('');
    const [city, setCity] = useState('');
    const [cities, setCities] = useState([]);
    const [street, setStreet] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [long, setLong] = useState('');
    const [lat, setLat] = useState('');
    const [displayAddress, setDisplayAddress] = useState("Waiting for Current Location");

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = () => {
        setIsSuccess(false);
        navigation.navigate('Home');
    };


    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
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
                    postalCode: existingLocation.address_zipcode,
                    name: '',
                    isoCountryCode: '',
                    timezone: ''
                });
                setAddressState(existingLocation.address_state);
                setCity(existingLocation.address_city);
                setStreet(existingLocation.address_street || '');
                setZipcode(existingLocation.address_zipcode || '');
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
                    if (!mounted) {
                        return;
                    }
                    const { latitude, longitude } = coords;
                    setLong(longitude);
                    setLat(latitude);
                    let addressResponse: any = await Location.reverseGeocodeAsync({ latitude, longitude });
                    for (let item of addressResponse) {
                        setLoading(false);
                        setAddress(item);
                        // onUpdateLocation(item)
                        let currentAddress = `${item.name},${item.street}, ${item.postalCode}, ${item.country}`;
                        setDisplayAddress(currentAddress);
                        setAddressState(item.region);
                        setCity(item.city);
                        setZipcode(item.postalCode);
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
            }

        })();
        return () => {
            mounted = false;
        };
    }, []);

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
    const LocationSchema = yup.object().shape({
        state: yup.string().required('State is required'),
        city: yup.string().required('City is required'),
        street: yup.string().required('Street is required'),
        zipcode: yup.string().required('Zipcode is required'),
    });

    const handleSubmit = async ({ state, city, street, zipcode }) => {
        setLoading(true);
        try {
            let location: LocationModel = {
                address_country: 'Nigeria',
                address_state: state,
                address_city: city,
                address_street: street,
                address_lat: lat,
                address_long: long,
                address_zipcode: zipcode,
            };
            let res = await OnUpdateAgentLocation(location);
            if (res.error) {
                setError(res.error);
                setLoading(false);
                setHasError(true);
            }
            if (res.success) {
                setLoading(false);
                setSuccessMessage('Location Saved');
                setIsSuccess(true);
            }

        } catch (e) {
            setError(e);
            setHasError(true);
            setLoading(false);
        }

    };

    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView />
            <ImageBackground source={require("../../../../assets/auth-bg.png")} style={styles.container}>
                <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                    <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                        <View style={{ ...styles.container, backgroundColor: 'white', paddingBottom: '13%' }}>
                            <View style={styles.container}>
                                <View style={{ flex: 2, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require("../../../../assets/location.png")} alt={"Map image"} style={{ resizeMode: 'contain', marginBottom: 0 }} w={'2/5'} />
                                </View>

                                <View style={styles.formContainer}>
                                    <Text style={{ ...styles.headingText }}>Select Your Location</Text>
                                    <Text style={{ ...styles.subHeadingText }}>
                                        Set your stand location for clients
                                    </Text>
                                    <View style={styles.form}>
                                        <Formik
                                            initialValues={{
                                                state: addressState,
                                                street: street,
                                                city: city,
                                                zipcode: zipcode,
                                            }}
                                            onSubmit={values => {
                                                handleSubmit(values);
                                            }}
                                            validationSchema={LocationSchema}
                                        >
                                            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                                                <View style={{ width: '100%' }}>
                                                    <SelectField
                                                        hasIcon={false}
                                                        label='State'
                                                        handleChange={(val) => {
                                                            handleChange('state')(val);
                                                            setAddressState(val);
                                                        }}
                                                        options={states}
                                                        value={addressState}
                                                        isDisabled={loading}
                                                    />
                                                    {errors.state && touched.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
                                                    <SelectField
                                                        hasIcon={false}
                                                        label='City'
                                                        handleChange={(val) => {
                                                            handleChange('city')(val);
                                                            setCity(val);
                                                        }}
                                                        options={cities}
                                                        value={city}
                                                        isDisabled={loading ? true : city && city !== '' ? false : addressState && addressState !== '' ? false : true}
                                                    />
                                                    {errors.city && touched.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                                                    <TextField
                                                        hasIcon={false}
                                                        isNumber={false}
                                                        isPhone={false}
                                                        label='Street'
                                                        isSecure={false}
                                                        isDisabled={loading ? true : street && street !== '' ? false : city && city !== '' ? false : true}
                                                        handleChange={handleChange('street')}
                                                        passBlur={handleBlur('street')}
                                                        value={street}
                                                    />
                                                    {errors.street && touched.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
                                                    <TextField
                                                        hasIcon={false}
                                                        isNumber={true}
                                                        isPhone={false}
                                                        label='Zipcode'
                                                        isSecure={false}
                                                        isDisabled={loading ? true : zipcode && zipcode !== '' ? false : city && city !== '' ? false : true}
                                                        handleChange={handleChange('zipcode')}
                                                        passBlur={handleBlur('zipcode')}
                                                        value={zipcode}
                                                    />
                                                    {errors.zipcode && touched.zipcode ? <Text style={styles.errorText}>{errors.zipcode}</Text> : null}
                                                    <ButtonWithTitle loading={loading} noBg={false} title={'Save'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                                                </View>
                                            )}
                                        </Formik>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                        <ErrorSheet error={error} open={hasError} closed={clearError} />
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
            <SafeAreaView />
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageBg: {
        resizeMode: 'cover',
        width: deviceWidth,
        height: deviceHeight,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        flex: 5,
        width: '100%',
        flexDirection: 'column',
        paddingHorizontal: 24,
        justifyContent: 'flex-start',
        paddingBottom: 100
    },
    form: {
        width: '100%',
        flexDirection: 'column',
        marginBottom: 60
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

const SetLocationScreen = connect(mapToStateProps, { OnUpdateAgentLocation })(_SetLocationScreen);
export default SetLocationScreen;