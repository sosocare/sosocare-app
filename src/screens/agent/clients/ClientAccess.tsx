import { View, Text, Pressable, ImageBackground, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Formik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import * as Location from 'expo-location';
// import Wizard
import Wizard, { WizardRef } from 'react-native-wizard';
import { connect } from 'react-redux';
import { ApplicationState, AgentState, OnLoadCheckClient, OnLoadExternalClient, CustomUserModel } from '../../../redux';

import { useNavigation } from "@react-navigation/native";
import { ClientScreenNavigationProp } from "../../../navigation/agent/types";

import { yupSequentialStringSchema } from "../../../utils/yup-utils";
import { COLORS, SIZES, FONTS } from '../../../constants';

import { TextField } from "../../../components/TextField";
import SelectField from "../../../components/SelectField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import axios from 'axios';
import { BASE_URL } from '../../../utils';
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";


const keyboardVerticalOffset = Platform.OS === 'ios' ? 20 : 0;
let resetFormError: () => void;

interface UserSignUpProps {
    agentReducer: AgentState;
    OnLoadCheckClient: Function;
    OnLoadExternalClient: Function;
}

import {
    NativeBaseProvider,
    extendTheme,
    Skeleton,
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

const _ClientAccess: React.FC<UserSignUpProps> = (props) => {
    const { agentReducer, OnLoadCheckClient, OnLoadExternalClient } = props;
    const navigation = useNavigation<ClientScreenNavigationProp>();

    const wizard = useRef<WizardRef>(null);
    const [isFirstStep, setIsFirstStep] = useState(true);
    const [isLastStep, setIsLastStep] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [client, setClient] = useState<CustomUserModel>();
    const [hasError, setHasError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [granted, setGranted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [stepTitle, setStepTitle] = useState('Serve External Client');

    const [formData, setFormData] = useState({
        soso_id: "",
        token: '',
    });

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = () => {
        setIsSuccess(false);
        navigation.navigate('Clients');
    };

    useEffect(() => {
        setGranted(false);
        if(currentStep === 0 || currentStep === 1) {
            setStepTitle('Serve External Client')
        }
    }, [currentStep]);

    const verifyOTP = async (phone: string, token: string) => {
        try {
            const configurationObject = {
                method: 'post',
                url: `${BASE_URL}user/verify-phone`,
                data: {
                    phone,
                    token
                }
            };
            const response = await axios(configurationObject);

            let resBody = response.data;
            if (resBody['status'] === 'error') {
                return { 'error': resBody['message'] };
            } else {
                return { 'success': resBody['status'] };
            }
        } catch (error) {
            return { 'error': error };
        }
    };
    const handleSubmit1 = async ({ soso_id }) => {
        setLoading(true);
        setGranted(false);
        setFormData(prev => Object.assign(prev, { soso_id }));
        let res1 = await OnLoadCheckClient(soso_id);
        if (res1.success === 'success') {
            setClient(res1.client);
            wizard.current!.next();
            setLoading(false);
        } else if (res1.error) {
            setError(res1.error);
            setHasError(true);
        } else {
            setError("Error kindly retry");
            setHasError(true);
        }
        setLoading(false);
    };
    const handleSubmit2 = async ({ token }) => {
        setLoading(true);
        setGranted(false);
        try {
            setFormData(prev => Object.assign(prev, { token }));
            let res = await verifyOTP(client!.phone, token);
            if (res.success) {
                let values = formData;
                setGranted(true);
                setStepTitle('Confirm Client')
                wizard.current!.next();

                setLoading(false);
            } else if (res.error) {
                setError(res.error);
                setHasError(true);
            } else {
                setError("Error kindly retry");
                setHasError(true);
            }
            setLoading(false);
        } catch (e) {
            setError("Error kindly retry");
            setHasError(true);
        }
        setLoading(false);

    };
    const handleSubmit3 = async () => {
        if(client) navigation.navigate('ClientDetails', { client });
    };

    const stepList = [
        {
            content: <Step1 handleSubmit1={handleSubmit1} loading={loading} formData={formData} />,
        },
        {
            content: <Step2 handleSubmit2={handleSubmit2} loading={loading} />,
        },
        {
            content: <Step3 handleSubmit3={handleSubmit3} loading={loading} client={client} />,
        },
    ];

    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={styles.container}>
                <ImageBackground source={require("../../../../assets/auth-bg.png")} style={styles.container}>
                    <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%' }}>
                        <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                            <View style={styles.formContainer}>
                                <Text style={{ ...styles.headingText }}>{stepTitle}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                                    {currentStep > 0 ? <Pressable style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }} onPress={() => wizard.current!.prev()}>
                                        <Ionicons name="ios-chevron-back" style={{ ...styles.subHeadingText, fontSize: 20, marginLeft: 0, color: COLORS.primary }} color={COLORS.primary} />
                                        <Text style={{ ...styles.subHeadingText, color: COLORS.primary, marginLeft: 0 }}>Back</Text>
                                    </Pressable> : null}
                                    <Text style={{ ...styles.subHeadingText, marginLeft: currentStep > 0 ? 33 : 0 }}>Step {currentStep + 1} of 3</Text>
                                </View>

                                <View style={styles.form}>
                                    <View>
                                        <Wizard
                                            ref={wizard}
                                            steps={stepList}
                                            isFirstStep={val => setIsFirstStep(val)}
                                            isLastStep={val => setIsLastStep(val)}
                                            onNext={() => {
                                                console.log("Next Step Called");
                                            }}
                                            currentStep={({ currentStep, isLastStep, isFirstStep }) => {
                                                setCurrentStep(currentStep);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                            <ErrorSheet error={error} open={hasError} closed={clearError} />
                        </View>
                    </KeyboardAwareScrollView>
                </ImageBackground>
            </SafeAreaView>
        </NativeBaseProvider>
    );
};
const Step1 = ({ handleSubmit1, loading, formData}) => {
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const clearError = () => {
        setHasError(false);
    };

    const Step1Schema = yup.object().shape({
        soso_id: yup.string().required('SOSOCARE ID/Phone number is required'),
    });
    return (
        <Formik
            initialValues={{
                soso_id: formData.soso_id,
            }}
            onSubmit={values => handleSubmit1(values)}
            validationSchema={Step1Schema}
        >
            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                <View style={{ width: '100%' }}>
                    <TextField
                        hasIcon={false}
                        label='SOSOCARE ID/Phone number'
                        isSecure={false}
                        handleChange={handleChange('soso_id')}
                        passBlur={handleBlur('soso_id')}
                        isDisabled={loading || localLoading}
                        value={formData.soso_id}
                    />
                    {errors.soso_id && touched.soso_id ? <Text style={styles.errorText}>{errors.soso_id}</Text> : null}
                    <ButtonWithTitle loading={loading || localLoading} noBg={false} title={'Continue'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                    <ErrorSheet error={error} open={hasError} closed={clearError} />
                </View>
            )}
        </Formik>
    );
};
const Step3 = ({ handleSubmit3, loading, client }) => {
    const [imageLoading, setImageLoading] = useState(false);
    useEffect(() => {
        if (client!.image) setImageLoading(true);
    }, []);
    return (
        <View style={{ width: '100%' }}>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                <View style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderColor: COLORS.primary,
                    borderWidth: 2,
                    padding: 3,
                    marginBottom: 8,
                    position: 'relative'
                }}>
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {loading
                            ? <Skeleton rounded='full' w={'full'} h={'full'} />
                            : !loading && client.image
                                ? <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', width: "100%", height: '100%' }}>
                                    <Image alt='Client Image'
                                        onLoad={() => setImageLoading(false)} source={{ uri: client.image }}
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
                                : <Image alt='Client Image' source={require("../../../../assets/blank.png")}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        flex: 1,
                                        resizeMode: 'cover',
                                        borderRadius: 60,
                                    }}
                                />
                        }

                    </View>
                </View>
                <Text style={{ textAlign: 'center', marginBottom: 0, fontSize: SIZES.extraLarge, fontFamily: FONTS.semiBold, color: COLORS.dark }}>{client.first_name} {client.last_name}</Text>
                <Text style={{ textAlign: 'center', marginBottom: 0, fontSize: SIZES.medium, fontFamily: FONTS.bold, color: COLORS.primary }}>{client.soso_id}</Text>
            </View>
            <ButtonWithTitle loading={loading} noBg={false} title={'Confirm'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit3} width={'100%'} />
        </View>
    );
};
const Step2 = ({ handleSubmit2, loading }) => {
    const Step3Schema = yup.object().shape({
        token: yup.string()
            .trim()
            .min(4, 'Too Short!')
            .max(6, 'Too Long!')
    });
    return (
        <Formik
            initialValues={{
                token: ''
            }}
            onSubmit={values => handleSubmit2(values)}
            validationSchema={Step3Schema}
        >
            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                <View style={{ width: '100%' }}>
                    <Text style={{ fontSize: 14, color: COLORS.dark, fontFamily: FONTS.medium, marginVertical: 6 }}>An OTP has been sent to the Client's phone number kindly verify phone number by providing OTP below</Text>
                    <TextField
                        hasIcon={false}
                        isNumber={true}
                        isPhone={false}
                        label='----'
                        isSecure={false}
                        handleChange={handleChange('token')}
                        passBlur={handleBlur('token')}
                    />
                    {errors.token && touched.token ? <Text style={styles.errorText}>{errors.token}</Text> : null}
                    <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                </View>
            )}
        </Formik>

    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: 'white',
        width: "100%"
    },
    imageContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    headerImage: {
        resizeMode: 'contain',
        width: '60%',
        marginVertical: 80
    },
    formContainer: {
        width: '100%',
        flexDirection: 'column',
        paddingHorizontal: 24,
        marginTop: 20
    },
    form: {
        width: '100%',
        flexDirection: 'column',
    },
    headingText: {
        fontFamily: FONTS.semiBold,
        fontSize: SIZES.heading,
        color: COLORS.dark,
        marginBottom: SIZES.font
    },
    subHeadingText: {
        fontFamily: FONTS.medium,
        fontSize: SIZES.medium,
        color: COLORS.gray,
        marginBottom: 20,
    },
    errorText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        color: COLORS.negative,
        marginTop: -26,
        marginBottom: 10,
    },
});
// export default ClientAccess;

const mapToStateProps = (state: ApplicationState) => ({
    agentReducer: state.AgentReducer
});

const ClientAccess = connect(mapToStateProps, { OnLoadCheckClient, OnLoadExternalClient })(_ClientAccess);
export default ClientAccess;