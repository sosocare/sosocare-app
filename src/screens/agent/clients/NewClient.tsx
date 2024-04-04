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
import { ApplicationState, AgentState, LocationModel, CustomUserModel } from '../../../redux';

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
}

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

const _Newclient: React.FC<UserSignUpProps> = (props) => {
  const { agentReducer } = props;
  const navigation = useNavigation<ClientScreenNavigationProp>();

  const wizard = useRef<WizardRef>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTitle, setStepTitle] = useState('Register new Client');
  const [client, setClient] = useState<CustomUserModel>();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: '',
    token: '',
    password: '',
    state: '',
    city: '',
    street: '',
  });

  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
    if (client) {
      navigation.navigate('ClientDetails', { client });
    } else {
      navigation.navigate('Clients');
    }
  };


  const checkEmail = async (email: string) => {
    try {
      const configurationObject = {
        method: 'post',
        url: `${BASE_URL}user/check-email`,
        data: {
          email
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
  const sendOTP = async (phone: string) => {
    try {
      const configurationObject = {
        method: 'post',
        url: `${BASE_URL}user/send-otp`,
        data: {
          phone
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
  const register = async (
    // firstName: string,
    // lastName: string,
    // email: string,
    phone: string,
    // password: string,
    // state: string,
    // city: string,
    // street: string,
  ) => {
    try {
      const response = await axios.post<string>(`${BASE_URL}agent/user`, {
        // email,
        phone,
        // password,
        // first_name: firstName,
        // last_name: lastName,
        // address_state: state,
        // address_city: city,
        // address_street: street,
      }, {
        headers: {
          'Authorization': `Bearer ${agentReducer.agent.authToken}`
        }
      });

      let resBody = response.data;
      if (resBody['status'] === 'error') {
        return { 'error': resBody['message'] };
      } else {
        setClient(resBody['client']);
        return { 'success': resBody['status'] };
      }
    } catch (error) {
      return { 'error': error };
    }
  };

  const handleSubmit1 = async ({ firstName, lastName, state, city, street }) => {
    setLoading(true);
    setFormData(prev => Object.assign(prev, { firstName, lastName, state, city, street }));
    wizard.current!.next();
    setLoading(false);
  };
  const handleSubmit2 = async ({ phone }) => {
    setLoading(true);
    setFormData(prev => Object.assign(prev, { phone }));

    // let res1 = await checkEmail(email);
    // if (res1.success === 'success') {
    let res = await sendOTP(phone);
    if (res.success === 'success') {
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
  };
  const handleSubmit3 = async ({ token }) => {
    setLoading(true);
    try {
      setFormData(prev => Object.assign(prev, { token }));

      let res = await verifyOTP(formData.phone, token);
      if (res.success) {
        let values = formData;
        let res2 = await register(values.phone);
        setLoading(false);
        if (res2.success) {
          setSuccessMessage('Client Registered');
          setIsSuccess(true);
        } else if (res2.error) {
          setError(res2.error);
          setHasError(true);
        } else {
          setError("Error kindly retry");
          setHasError(true);
        }

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
  const stepList = [
    // {
    //   content: <Step1 handleSubmit1={handleSubmit1} agent={agentReducer} loading={loading} formData={formData} />,
    // },
    {
      content: <Step2 handleSubmit2={handleSubmit2} loading={loading} formData={formData} />,
    },
    {
      content: <Step3 handleSubmit3={handleSubmit3} loading={loading} />,
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
                  <Text style={{ ...styles.subHeadingText, marginLeft: currentStep > 0 ? 33 : 0 }}>Step {currentStep + 1} of 2</Text>
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
const Step1 = ({ handleSubmit1, loading, formData, agent }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [addressState, setAddressState] = useState(formData.state);
  const [city, setCity] = useState(formData.city);
  const [cities, setCities] = useState([]);
  const [street, setStreet] = useState(formData.street);
  const clearError = () => {
    setHasError(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }

      if (addressState && addressState !== '') return;
      let existingLocation: LocationModel = agent.location;
      if (existingLocation.address_city && existingLocation.address_state) {
        setAddressState(existingLocation.address_state);
        setCity(existingLocation.address_city);
        setStreet(existingLocation.address_street || '');
        return;
      }
      setLocalLoading(true);
      try {
        if (!mounted) {
          return;
        }
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Permission to access location is not granted');
          setHasError(true);
          setLocalLoading(false);
        }

        let location: any = await Location.getCurrentPositionAsync({});

        const { coords } = location;

        if (coords) {
          const { latitude, longitude } = coords;
          if (!mounted) {
            return;
          }
          let addressResponse: any = await Location.reverseGeocodeAsync({ latitude, longitude });
          for (let item of addressResponse) {
            setLocalLoading(false);
            // onUpdateLocation(item)
            let currentAddress = `${item.name},${item.street}, ${item.postalCode}, ${item.country}`;
            setAddressState(item.region);
            setCity(item.city);
            setStreet(item.street);
            return;
          }

          setLocalLoading(false);
        } else {
          //notify user something went wrong with location
          setError("Could't get location automatically");
          setHasError(true);
          setLocalLoading(false);
        }

      } catch (error) {
        if (!mounted) {
          return;
        }
        setError(error.message);
        setHasError(true);
        setLocalLoading(false);
        return;
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
      setLocalLoading(true);
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
          setLocalLoading(false);
          return;
        } else {
          setError("Unable to get cities for this state");
          setHasError(true);
          setLocalLoading(false);
        }

      } catch (error) {
        if (!mounted) {
          return;
        }
        if (axios.isCancel(error)) {
        } else {
          setError(error.message || "Unable to get cities for this state");
          setHasError(true);
          setLocalLoading(false);
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

  const Step1Schema = yup.object().shape({
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
      .required('Last Name is required'),
    state: yup.string().required('State is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required'),

  });
  return (
    <Formik
      initialValues={{
        firstName: formData.firstName,
        lastName: formData.lastName,
        state: formData.state || addressState,
        street: formData.street || street,
        city: formData.city || city,
      }}
      onSubmit={values => handleSubmit1(values)}
      validationSchema={Step1Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: '100%' }}>
          <TextField
            hasIcon={false}
            label='First name'
            isSecure={false}
            handleChange={handleChange('firstName')}
            passBlur={handleBlur('firstName')}
            isDisabled={loading || localLoading}
            value={formData.firstName}
          />
          {errors.firstName && touched.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          <TextField
            hasIcon={false}
            label='Last name'
            isSecure={false}
            handleChange={handleChange('lastName')}
            passBlur={handleBlur('lastName')}
            isDisabled={loading || localLoading}
            value={formData.lastName}
          />
          {errors.lastName && touched.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          <SelectField
            hasIcon={false}
            label='State'
            handleChange={async (val) => {
              handleChange('state')(val);
              setAddressState(val);
            }}
            options={states}
            value={addressState}
            isDisabled={loading || localLoading}
          />
          {errors.state && touched.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          <SelectField
            hasIcon={false}
            label='City'
            handleChange={async (val) => {
              handleChange('city')(val);
              setCity(val);
            }}
            options={cities}
            value={city}
            isDisabled={loading || localLoading ? true : city && city !== '' ? false : addressState && addressState !== '' ? false : true}
          />
          {errors.city && touched.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          <TextField
            hasIcon={false}
            isNumber={false}
            isPhone={false}
            label='Street'
            isSecure={false}
            isDisabled={loading || localLoading ? true : street && street !== '' ? false : city && city !== '' ? false : true}
            handleChange={handleChange('street')}
            passBlur={handleBlur('street')}
            value={street}
          />
          {errors.street && touched.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}

          <ButtonWithTitle loading={loading || localLoading} noBg={false} title={'Continue'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
          <ErrorSheet error={error} open={hasError} closed={clearError} />
        </View>
      )}
    </Formik>
  );
};
const Step2 = ({ handleSubmit2, loading, formData }) => {
  const Step2Schema = yup.object().shape({
    phone: yupSequentialStringSchema(
      [
        yup.string().required('Phone Number is required'),
        yup.string().matches(/^\S*$/, 'Please provied phone mumber without spaces and dashes in format like +xxxxxxxxxxxx'),
        yup.string().phone('Please enter valid phone number')
      ],
      resetFormError
    ),
    // email: yupSequentialStringSchema(
    //   [
    //     yup.string().required('Email is required'),
    //     yup.string().email('Invalid email format')
    //   ],
    //   resetFormError
    // ),
    // password: yup.string().required('Password is required').min(8, 'Password must be alteast 8 characters'),
    // confirmPassword: yup
    //   .string()
    //   .oneOf([yup.ref('password'), null], 'Passwords must match')
    //   .required('Password is Required'),
  });
  return (
    <Formik
      initialValues={{
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.password,
        email: formData.email,
      }}
      onSubmit={values => handleSubmit2(values)}
      validationSchema={Step2Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: '100%' }}>
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
          {/* <TextField
            hasIcon={false}
            label='Email'
            isSecure={false}
            isEmail={true}
            handleChange={handleChange('email')}
            passBlur={handleBlur('email')}
            value={formData.email}
          />
          {errors.email && touched.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          <TextField
            hasIcon={false}
            label='Password'
            isSecure={true}
            handleChange={handleChange('password')}
            passBlur={handleBlur('password')}
            value={formData.password}
          />
          {errors.password && touched.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          <TextField
            hasIcon={false}
            label='Confirm Password'
            isSecure={true}
            handleChange={handleChange('confirmPassword')}
            passBlur={handleBlur('confirmPassword')}
            value={formData.password}
          />
          {errors.confirmPassword && touched.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null} */}

          <ButtonWithTitle loading={loading} noBg={false} title={'Continue'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
        </View>
      )}
    </Formik>

  );
};
const Step3 = ({ handleSubmit3, loading }) => {
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
      onSubmit={values => handleSubmit3(values)}
      validationSchema={Step3Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 14, color: COLORS.dark, fontFamily: FONTS.medium, marginVertical: 6 }}>An OTP has been sent to the provided phone number kindly verify phone number by providing OTP below</Text>
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
// export default Newclient;

const mapToStateProps = (state: ApplicationState) => ({
  agentReducer: state.AgentReducer
});

const Newclient = connect(mapToStateProps, {})(_Newclient);
export default Newclient;