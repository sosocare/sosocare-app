import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';

import { connect } from 'react-redux';
import { ApplicationState, AgentState, OnAgentAskQuestion } from '../../../redux';

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

interface AskDoctorScreenProps {
    agentReducer: AgentState;
    OnAgentAskQuestion: Function;
}
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _AskDoctorScreen: React.FC<AskDoctorScreenProps> = (props) => {
    const { agentReducer, OnAgentAskQuestion } = props;
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        question: '',
        title: ''
    });
    const methods = [
        { title: "Male", value: "Male" },
        { title: "Female", value: "Female" }
    ];

    const clearError = () => {
        setHasError(false);
    };
    const handleSuccess = () => {
        setIsSuccess(false);
        navigation.navigate('Home');
    };

    const QuestionSchema = yup.object().shape({
        title: yup.string()
            .trim()
            .required('Title is required'),
        gender: yup.string()
            .trim()
            .required('Gender is required'),
        question: yup.string()
            .trim()
            .required('Question is required'),
        age: yup.string()
            .trim()
            .required('Age is required'),

    });

    const handleSubmit = async ({ title, question, age, gender }) => {
        setLoading(true);
        try {
            let res = await OnAgentAskQuestion(title, question, gender, age);
            if (res.error) {
                setError(res.error);
                setLoading(false);
                setHasError(true);
            }
            if (res.success) {
                setLoading(false);
                setSuccessMessage("Question Submitted. One of our Doctors will send you a response.");
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
                            <Text style={{ ...styles.headingText }}>Ask a Doctor</Text>
                            <Text style={{ ...styles.subHeadingText }}>
                                Submit a medical complaint to have one of our Doctors respond to you
                            </Text>
                            <View style={{ flex: 1, width: '100%', marginTop: 10, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column' }}>
                                <View style={{ paddingTop: 20, width: '100%' }}>
                                    <View style={styles.form}>
                                        <Formik
                                            initialValues={{
                                                gender: "",
                                                age: '',
                                                title: '',
                                                question: ""
                                            }}
                                            onSubmit={values => handleSubmit(values)}
                                            validationSchema={QuestionSchema}
                                        >
                                            {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                                                <View style={{ width: '100%' }}>
                                                    <Text style={styles.label}>Title</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Title'
                                                        isSecure={false}
                                                        handleChange={handleChange('title')}
                                                        passBlur={handleBlur('title')}
                                                        value={formData.title}
                                                    />
                                                    {errors.title && touched.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
                                                    <Text style={styles.label}>Question</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Question'
                                                        isSecure={false}
                                                        handleChange={handleChange('question')}
                                                        passBlur={handleBlur('question')}
                                                        value={formData.question}
                                                        lines={3}
                                                    />
                                                    {errors.question && touched.question ? <Text style={styles.errorText}>{errors.question}</Text> : null}
                                                    <Text style={styles.label}>Age</Text>
                                                    <TextField
                                                        hasIcon={false}
                                                        label='Age'
                                                        isSecure={false}
                                                        isEmail={false}
                                                        isNumber={true}
                                                        handleChange={handleChange('age')}
                                                        passBlur={handleBlur('age')}
                                                        value={formData.age}
                                                    />
                                                    {errors.age && touched.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
                                                    <Text style={styles.label}>Gender</Text>
                                                    <SelectField
                                                        hasIcon={false}
                                                        label='Gender'
                                                        handleChange={handleChange('gender')}
                                                        options={methods}
                                                        isDisabled={loading}
                                                    />
                                                    {errors.gender && touched.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
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
    agentReducer: state.AgentReducer
});

const AskDoctorScreen = connect(mapToStateProps, { OnAgentAskQuestion })(_AskDoctorScreen);
export default AskDoctorScreen;