import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';
import { yupSequentialStringSchema } from "../../../utils/yup-utils";

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnUserUpdate } from '../../../redux';

import { Formik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/user/types";

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

interface EditProfileScreenProps {
  userReducer: UserState;
  OnUserUpdate: Function;
}
let resetFormError: () => void;
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _EditProfileScreen: React.FC<EditProfileScreenProps> = (props) => {
  const { userReducer, OnUserUpdate } = props;
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: '',
  });

  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
    navigation.navigate('Home');
  };

  const AccountSchema = yup.object().shape({
    firstName: yup.string()
      .trim()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .matches(/[A-Za-z ]{1,32}/, 'Only alphabets are allowed')
      .required('First Name is required'),
    lastName: yup.string()
      .trim()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .matches(/[A-Za-z ]{1,32}/, 'Only alphabets are allowed')
      .required('First Name is required'),
    phone: yupSequentialStringSchema(
      [
        yup.string().required('Phone Number is required'),
        yup.string().matches(/^\S*$/, 'Please provied phone mumber without spaces and dashes in format like +xxxxxxxxxxxx'),
        yup.string().phone('Please enter valid phone number')
      ],
      resetFormError
    ),
    email: yupSequentialStringSchema(
      [
        yup.string().required('Email is required'),
        yup.string().email('Invalid email format')
      ],
      resetFormError
    ),
  });

  const handleSubmit = async ({ firstName, lastName, email, phone }) => {
    setLoading(true);
    try {
      let res = await OnUserUpdate({ first_name: firstName, last_name: lastName, email: email, phone: phone });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        setHasError(true);
      }
      if (res.success) {
        setLoading(false);
        setSuccessMessage("Profile updated");
        setIsSuccess(true);
      }

    } catch (e) {
      setError(e.message);
      setHasError(true);
      setLoading(false);
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
        if (!mounted) {
          return;
        }
        let existingDetails = userReducer.user;
        setFormData({
          firstName: existingDetails.firstName || '',
          lastName: existingDetails.lastName || '',
          email: existingDetails.email || '',
          phone: existingDetails.phone || '',
        });
        setLoading(false);

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
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                      }}
                      onSubmit={values => handleSubmit(values)}
                      validationSchema={AccountSchema}
                    >
                      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                        <View style={{ width: '100%' }}>
                          <Text style={styles.label}>First name</Text>
                          <TextField
                            hasIcon={false}
                            label='First name'
                            isSecure={false}
                            handleChange={handleChange('firstName')}
                            passBlur={handleBlur('firstName')}
                            value={formData.firstName}
                          />
                          {errors.firstName && touched.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                          <Text style={styles.label}>Last name</Text>
                          <TextField
                            hasIcon={false}
                            label='Last name'
                            isSecure={false}
                            handleChange={handleChange('lastName')}
                            passBlur={handleBlur('lastName')}
                            value={formData.lastName}
                          />
                          {errors.lastName && touched.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                          <Text style={styles.label}>Email</Text>
                          <TextField
                            hasIcon={false}
                            label='Email'
                            isSecure={false}
                            isEmail={true}
                            handleChange={handleChange('email')}
                            passBlur={handleBlur('email')}
                            value={formData.email}
                          />
                          {errors.email && touched.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                          <Text style={styles.label}>Phone number</Text>
                          <TextField
                            hasIcon={false}
                            isNumber={true}
                            isPhone={true}
                            label='Phone Number'
                            isSecure={false}
                            handleChange={handleChange('phone')}
                            passBlur={handleBlur('phone')}
                            value={formData.phone}
                          />
                          {errors.phone && touched.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
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

const EditProfileScreen = connect(mapToStateProps, { OnUserUpdate })(_EditProfileScreen);
export default EditProfileScreen;