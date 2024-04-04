import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Formik } from 'formik';
import * as yup from 'yup';

import { COLORS, SIZES, FONTS } from '../../constants';

import { TextField } from "../../components/TextField";
import SelectField from "../../components/SelectField";
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import ErrorSheet from "../../components/ErrorSheet";
import { HospitalListItem } from "../../components/HospitalListItem";
import ContentSheet from "../../components/ContentSheet";

import axios from 'axios';
import { BASE_URL } from '../../utils';

import Wizard, { WizardRef } from 'react-native-wizard';

import {
    NativeBaseProvider,
    extendTheme,
    Image
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


interface HospitalModel {
    name: string;
    address: string;
}

const FindHospitalsScreen = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);

    const wizard = useRef<WizardRef>(null);

    const [isFirstStep, setIsFirstStep] = useState(true);
    const [isLastStep, setIsLastStep] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

    const [addressState, setAddressState] = useState('');
    const [hospitals, setHospitals] = useState<Array<HospitalModel>>([]);

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
    });


    const clearError = () => {
        setHasError(false);
        setLoading(false);
    };

    const findHospitals = async () => {
        try {
            setLoading(true);
            const configurationObject = {
                method: 'post',
                url: `${BASE_URL}hospitals`,
                data: {
                    state: addressState
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
    const handleMain = async () => {
        await findHospitals();
        wizard.current!.next();
    };

    const searchingFunc = (obj, value) => {
        for (let key in obj) {
            if (
                !Number.isInteger(obj[key]) &&
                !(typeof obj[key] === "object") &&
                !(typeof obj[key] === "boolean")
            ) {
                if (obj[key].toLowerCase().indexOf(value.toLowerCase()) != -1) {
                    return true;
                }
            }
        }
        return false;
    };


    const Main = ({ handleSubmit }) => {
        return (
            <View style={{ ...styles.stepContainer }}>
                <View style={{ flex: 2, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require("../../../assets/location.png")} alt={'Search Image'} style={{ resizeMode: 'contain', marginBottom: 0 }} w={'2/5'} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={{ ...styles.headingText }}>Find Hospitals</Text>
                    <Text style={{ ...styles.subHeadingText }}>
                        Search SOSOCARE partner Hospitals to access Insurance
                    </Text>
                    <View style={styles.form}>
                        <Formik

                            initialValues={{
                                state: addressState,
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
                                    <ButtonWithTitle loading={loading} noBg={false} title={'Search'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </View>
        );
    };
    const Results = () => {
        const [searchText, setSearchText] = useState('');
        const [displayHospitals, setDisplayHospitals] = useState<Array<HospitalModel>>([]);
        const [showContent, setShowContent] = useState(false);
        const [activeHospital, setActiveHospital] = useState<HospitalModel>();
        const closeContent = () => {
            setShowContent(false);
        };
        const showHospital = async (name) => {
            try {
                let currentItem = displayHospitals.find((item) => item.name === name);
                if (currentItem) {
                    setActiveHospital(currentItem);
                    setShowContent(true);
                }
            } catch (error) {
                setLoading(false);
                setError("Error kindly retry");
                setHasError(true);
            }
        };


        useEffect(() => {
            let mounted = true;
            (async () => {
                if (!mounted) {
                    return;
                }
                let group = hospitals;
                if (searchText && searchText.trim() !== "") {
                    let results: Array<HospitalModel> = [];
                    for (let j = 0; j < group.length; j++) {
                        if (searchingFunc(group[j], searchText)) {
                            results.push(group[j]);
                        }
                    }
                    setDisplayHospitals(results);
                } else {
                    setDisplayHospitals(hospitals);
                }
            })();
            return () => {
                mounted = false;
            };
        }, [searchText]);
        const HospitalContent = () => {
            const activeItem = activeHospital;
            if (activeItem) {
                return (
                    <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
                        <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>Hospital Details</Text>
                        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                            <View style={styles.transactionRecord}>
                                <Text style={styles.transactionRecordLeft}>
                                    Name
                                </Text>
                                <Text style={styles.transactionRecordRight}>{activeItem.name}</Text>
                            </View>
                            <View style={styles.transactionRecord}>
                                <Text style={styles.transactionRecordLeft}>
                                    Address
                                </Text>
                                <Text style={styles.transactionRecordRight}>{activeItem.address}</Text>
                            </View>
                        </View>
                    </View>
                );
            }
            return (<></>);

        };

        return (
            <View style={{ flex: 1 }}>
                <View style={{ width: '100%' }}>
                    <TextField
                        handleChange={(val) => setSearchText(val)}
                        label='Search hospital name or address'
                        icon={'search'}
                        isDisabled={loading}
                        hasIcon
                    />
                </View>
                <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Results</Text>
                <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
                    <View style={{ width: '100%', marginTop: 0, marginBottom: 60 }}>
                        {
                            displayHospitals.length > 0 ?
                                displayHospitals.map((item: HospitalModel, index) => (
                                    <HospitalListItem
                                        backgroundColor={COLORS.pallete_white}
                                        tint={COLORS.fade}
                                        color={COLORS.dark}
                                        key={index}
                                        id={index.toString()}
                                        onTap={() => showHospital(item.name)}
                                        description={item.name}
                                        address={item.address}
                                    />
                                ))
                                : <Text style={{ fontSize: 16, marginVertical: 60, fontFamily: FONTS.medium, color: COLORS.pallete_deep, textAlign: 'center' }}>No Hospital Found for this location</Text>
                        }
                        <ButtonWithTitle
                            title='Go Back'
                            backgroundColor={COLORS.pallete_deep}
                            color={COLORS.white}
                            loading={loading}
                            onTap={() => wizard.current!.prev()}
                            width={'100%'}
                        />
                    </View>
                </View>
                {<ContentSheet content={<HospitalContent />} open={showContent} closed={closeContent} />}
            </View>
        );

    };

    const stepList = [
        {
            content: <Main handleSubmit={() => handleMain()} />,
        },
        {
            content: <Results />,
        },
    ];



    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
            <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                    <View style={styles.container}>
                        <View style={{ width: '100%' }}>
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

                        <ErrorSheet error={error} open={hasError} closed={clearError} />
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};


const styles = StyleSheet.create({
    stepContainer: {
        width: '100%',
        justifyContent: 'center',
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
    formContainer: {
        flex: 5,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    form: {
        width: '100%',
        flexDirection: 'column',
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
        height: '100%',
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

export default FindHospitalsScreen;