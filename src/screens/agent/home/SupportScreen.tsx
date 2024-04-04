import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Ionicons from '@expo/vector-icons/Ionicons';
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnAgentContactSupport } from '../../../redux';

import { Formik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/agent/types";

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

interface SupportScreenProps {
    userReducer: UserState;
    OnAgentContactSupport: Function;
}
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _SupportScreen: React.FC<SupportScreenProps> = (props) => {
    const { userReducer, OnAgentContactSupport } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = () => {
        setIsSuccess(false);
        navigation.navigate('Home');
    };

    const MessageSchema = yup.object().shape({
        subject: yup.string()
            .trim()
            .required('Subject is required'),
        message: yup.string()
            .trim()
            .required('Message is required'),

    });
    const handleSubmit = async ({ subject, message }) => {
        setLoading(true);
        try {
            let res = await OnAgentContactSupport(subject, message);
            if (res.error) {
                setError(res.error);
                setLoading(false);
                setHasError(true);
            }
            if (res.success) {
                setLoading(false);
                setSuccessMessage("Message submitted. A support representative will contact you shortly");
                setIsSuccess(true);
            }

        } catch (e) {
            setError(e.message);
            setHasError(true);
            setLoading(false);
        }

    };


    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaView style={{ backgroundColor: 'white' }} />
            <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                <View style={styles.container}>
                        <View style={styles.mainContainer}>
                            <Text style={{ ...styles.headingText, marginTop: 30 }}>Contact Us</Text>
                            <Text style={{ ...styles.subHeadingText }}>
                                Send us a message and a support personnel will get in touch with you.
                            </Text>
                            <View style={{ flex: 1, width: '100%', marginTop: 10, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column' }}>
                                <View style={{ paddingTop: 20, width: '100%' }}>
                                    <View style={styles.form}>
                                        <Formik
                                            initialValues={{
                                                subject: '',
                                                message: ""
                                            }}
                                            onSubmit={values => handleSubmit(values)}
                                            validationSchema={MessageSchema}
                                        >
                                            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                                                <View style={{ width: '100%' }}>
                                                    <Text style={styles.label}>Subject</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Subject'
                                                        isSecure={false}
                                                        handleChange={handleChange('subject')}
                                                        passBlur={handleBlur('subject')}
                                                        value={formData.subject}
                                                    />
                                                    {errors.subject && touched.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
                                                    <Text style={styles.label}>Message</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Message'
                                                        isSecure={false}
                                                        handleChange={handleChange('message')}
                                                        passBlur={handleBlur('message')}
                                                        value={formData.message}
                                                        lines={5}
                                                    />
                                                    {errors.message && touched.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
                                                    <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                                                </View>
                                            )}
                                        </Formik>
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: '100%', justifyContent: 'flex-start', marginTop: 28, alignItems: 'flex-start' }}>
                                <View
                                    style={{
                                        width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
                                    }}>
                                    <View style={{ borderRadius: 6, backgroundColor: COLORS.fade, marginRight: 6, padding: 4 }}>
                                        <Ionicons name='ios-call-outline' style={{ fontSize: 20 }} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: COLORS.gray }}>Call us at: +234 816 347 1359</Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
                                    }}>
                                    <View style={{ borderRadius: 6, backgroundColor: COLORS.fade, marginRight: 6, padding: 4 }}>
                                        <Ionicons name='ios-mail-outline' style={{ fontSize: 20 }} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: COLORS.gray }}>Mail us at: support@sosocare.com</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
                        <ErrorSheet error={error} open={hasError} closed={clearError} />
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
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
    mainContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#d9d9d9'
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
    userReducer: state.UserReducer
});

const SupportScreen = connect(mapToStateProps, { OnAgentContactSupport })(_SupportScreen);
export default SupportScreen;