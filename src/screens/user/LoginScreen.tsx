import { View, Text, ImageBackground, Platform, SafeAreaView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthContext } from "../../contexts/AuthContext";
import type { AuthContextType } from "../../contexts/AuthContext";
import { COLORS, SIZES, FONTS } from '../../constants';

import { TextField } from "../../components/TextField";
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import ErrorSheet from "../../components/ErrorSheet";

import { useNavigation } from "@react-navigation/native";
import { UserAuthScreenNavigationProp } from "../../navigation/auth/types";

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnUserLogin, OnLoadWallet, OnLoadInsurance } from '../../redux';

import { Formik } from 'formik';
import * as yup from 'yup';

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

interface UserLoginProps {
  userReducer: UserState;
  OnUserLogin: Function;
  OnLoadWallet: Function;
  OnLoadInsurance: Function;
}

const _LoginScreen: React.FC<UserLoginProps> = (props) => {
  const { OnUserLogin, userReducer, OnLoadWallet,OnLoadInsurance } = props;
  const navigation = useNavigation<UserAuthScreenNavigationProp>();
  const { login }: AuthContextType = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;


  const LoginSchema = yup.object().shape({
    loginId: yup.string().required('Phone or Email is required'),
    password: yup.string().required('Pin is required'),
  });

  const clearError = () => {
    setHasError(false);
  };
  const handleSubmit = async ({ loginId, password }) => {
    setLoading(true);
    try {
      let res = await OnUserLogin(loginId, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        setHasError(true);
      }
      if (res.success) {
        await OnLoadWallet('user', userReducer.user.authToken);
        await OnLoadInsurance('user', userReducer.user.authToken);
        setLoading(false);
        login(userReducer.user.authToken, 'user');
      }

    } catch (e) {
      setError(e);
      setHasError(true);
      setLoading(false);
    }

  };
  return (
    <NativeBaseProvider theme={theme}>

      <SafeAreaView style={styles.container}>
        <ImageBackground source={require("../../../assets/auth-bg.png")} style={styles.container}>

          <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%' }}>
            <View style={{ width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }} >
              <View style={styles.imageContainer}>
                <Image
                  source={require("../../../assets/sosocare_logo.png")}
                  style={styles.headerImage}
                />
              </View>
              <View style={styles.formContainer}>
                <Text style={{ ...styles.headingText }}>Login</Text>
                <Text style={{ ...styles.subHeadingText }}>Enter your login credentials</Text>
                <View style={styles.form}>
                  <Formik
                    initialValues={{
                      loginId: "",
                      password: '',
                    }}
                    onSubmit={values => handleSubmit(values)}
                    validationSchema={LoginSchema}
                  >
                    {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
                     <View style={{width: '100%'}}>
                        <TextField
                          hasIcon={true}
                          icon={'person-outline'}
                          isNumber={false}
                          isPhone={false}
                          label='Email or Phone'
                          isSecure={false}
                          handleChange={handleChange('loginId')}
                          passBlur={handleBlur('loginId')}
                        />
                        {errors.loginId && touched.loginId ? <Text style={styles.errorText}>{errors.loginId}</Text> : null}
                        <TextField
                          hasIcon={true}
                          icon={'lock-open-outline'}
                          label='Pin'
                          isSecure={true}
                          handleChange={handleChange('password')}
                          passBlur={handleBlur('password')}
                        />
                        {errors.password && touched.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                        <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                      </View>
                    )}
                  </Formik>
                </View>
              </View>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 25 }}>
                <Text style={{ fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.dark }}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginLeft: 4 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semiBold }}>Sign up</Text>
                </TouchableOpacity>
              </View>
              <ErrorSheet error={error} open={hasError} closed={clearError} />
            </View>
          </KeyboardAwareScrollView>
        </ImageBackground>
      </SafeAreaView>

    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 0,
    backgroundColor: 'white',
    maxWidth: '100%',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.negative,
    marginTop: -26,
    marginBottom: 10,
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
});


const mapToStateProps = (state: ApplicationState) => ({
  userReducer: state.UserReducer
});

const LoginScreen = connect(mapToStateProps, { OnUserLogin, OnLoadWallet,OnLoadInsurance })(_LoginScreen);
export default LoginScreen;