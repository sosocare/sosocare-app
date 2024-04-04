import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState, useContext } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnUserUpdatePassword, OnUserLogout } from '../../../redux';

import { Formik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/user/types";
import { AuthContext } from "../../../contexts/AuthContext";
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

interface ChangeProfileScreenProps {
    userReducer: UserState;
    OnUserUpdatePassword: Function;
    OnUserLogout: Function;
}
let resetFormError: () => void;
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _ChangeProfileScreen: React.FC<ChangeProfileScreenProps> = (props) => {
    const { userReducer, OnUserUpdatePassword, OnUserLogout } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
        oldPassword: "",
    });

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = async () => {
        setIsSuccess(false);
        await logUserOut();
    };

    const AccountSchema = yup.object().shape({
        oldPassword: yup.string()
            .trim()
            .required('Old pin is required'),
        password: yup.string().required('Pin is required').min(4, 'Pin  must be at least 4 characters').max(4, 'Pin should not be more than 4 characters'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Pins must match')
            .required('Pin is Required'),
    });
    const { logout } = useContext(AuthContext);
    const logUserOut = async () => {
        try {
            let res = await OnUserLogout();
            if (res.error) {
                setError(res.error);
                setHasError(true);
            }
            if (res.success) {
                logout();
            }

        } catch (e) {
            setError(e.message);
            setHasError(true);
        }
        logout();
    };

    const handleSubmit = async ({ oldPassword, password, confirmPassword }) => {
        setLoading(true);
        try {
            let res = await OnUserUpdatePassword({ oldPassword: oldPassword, password: password });
            if (res.error) {
                setError(res.error);
                setLoading(false);
                setHasError(true);
            }
            if (res.success) {
                setLoading(false);
                setSuccessMessage("Password Saved. Proceed to Login");
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
            <SafeAreaView style={{ backgroundColor: 'white' }} />
            <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                    <View style={styles.container}>
                        <View style={styles.mainContainer}>
                            <View style={{ flex: 1, width: '100%', marginTop: 10, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column' }}>
                                <View style={{ paddingTop: 20, width: '100%' }}>
                                    <View style={styles.form}>
                                        <Formik
                                            initialValues={{
                                                password: "",
                                                confirmPassword: "",
                                                oldPassword: "",
                                            }}
                                            onSubmit={values => handleSubmit(values)}
                                            validationSchema={AccountSchema}
                                        >
                                            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                                                <View style={{ width: '100%' }}>
                                                    <Text style={styles.label}>Old pin</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Old Pin'
                                                        isSecure={true}
                                                        handleChange={handleChange('oldPassword')}
                                                        passBlur={handleBlur('oldPassword')}
                                                    />
                                                    {errors.oldPassword && touched.oldPassword ? <Text style={styles.errorText}>{errors.oldPassword}</Text> : null}
                                                    <Text style={styles.label}>New pin</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='New Pin'
                                                        isSecure={true}
                                                        handleChange={handleChange('password')}
                                                        passBlur={handleBlur('password')}
                                                    />
                                                    {errors.password && touched.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                                                    <Text style={styles.label}>Confirm new pin</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Confirm Pin'
                                                        isSecure={true}
                                                        handleChange={handleChange('confirmPassword')}
                                                        passBlur={handleBlur('confirmPassword')}
                                                    />
                                                    {errors.confirmPassword && touched.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                                                    <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
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
        paddingHorizontal: 24
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

const ChangeProfileScreen = connect(mapToStateProps, { OnUserUpdatePassword, OnUserLogout })(_ChangeProfileScreen);
export default ChangeProfileScreen;