import {
  View,
  Text,
  Pressable,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Formik } from "formik";
import * as yup from "yup";
import "yup-phone";
// import Wizard
import Wizard, { WizardRef } from "react-native-wizard";

import { useNavigation } from "@react-navigation/native";
import { UserAuthScreenNavigationProp } from "../../navigation/auth/types";

import { yupSequentialStringSchema } from "../../utils/yup-utils";
import { COLORS, SIZES, FONTS } from "../../constants";

import { TextField } from "../../components/TextField";
import { ButtonWithTitle } from "../../components/ButtonWithTitle";

import axios from "axios";
import { BASE_URL } from "../../utils";
import ErrorSheet from "../../components/ErrorSheet";
import SuccessSheet from "../../components/SuccessSheet";

const keyboardVerticalOffset = Platform.OS === "ios" ? 20 : 0;
let resetFormError: () => void;

import { NativeBaseProvider, extendTheme } from "native-base";
// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "light",
};

// extend the theme
export const theme = extendTheme({
  colors: {
    primary: {
      100: "#52A56E",
      200: "#C6C6C6",
    },
  },
  config,
});
type MyThemeType = typeof theme;
declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}

const SignupScreen = () => {
  const navigation = useNavigation<UserAuthScreenNavigationProp>();

  const wizard = useRef<WizardRef>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTitle, setStepTitle] = useState("Sign Up");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    token: "",
    password: "",
  });

  const [signUpMethod, setSignUpMethod] = useState("email");

  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
    navigation.navigate("Login");
  };

  const checkEmail = async (email: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/check-email`,
        data: {
          email,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;

      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const checkPhone = async (phone: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/check-phone`,
        data: {
          phone,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;

      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const sendOTP = async (phone: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/send-otp`,
        data: {
          phone,
        },
      };
      const response = await axios(configurationObject);
      let resBody = response.data;

      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const verifyOTP = async (phone: string, token: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/verify-phone`,
        data: {
          phone,
          token,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const verifyEmailOTP = async (email: string, token: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/verify-email`,
        data: {
          email,
          token,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const register = async (phone: string, password: string) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/register-with-phone`,
        data: {
          phone,
          pin: password,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };
  const registerWithEmail = async (
    email: string,
    first_name: string,
    last_name: string,
    phone: string,
    password: string
  ) => {
    try {
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}user/register-with-email`,
        data: {
          email,
          first_name,
          last_name,
          phone,
          password,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      if (resBody["status"] === "error") {
        return { error: resBody["message"] };
      } else {
        return { success: resBody["status"] };
      }
    } catch (error) {
      return { error: error };
    }
  };

  const startSignUp = async (method: string) => {
    setSignUpMethod(method);
    wizard.current!.next();
  };
  const handleSubmit1 = async ({ firstName, lastName, email }) => {
    setLoading(true);
    setFormData((prev) => Object.assign(prev, { firstName, lastName, email }));
    let res = await checkEmail(email);
    if (res.success === "success") {
      wizard.current!.next();
    } else if (res.error) {
      setError(res.error);
      setHasError(true);
    } else {
      setError("Error kindly retry");
      setHasError(true);
    }
    setLoading(false);
  };
  const handleSubmit2 = async ({ phone, password }) => {
    setLoading(true);
    setFormData((prev) => Object.assign(prev, { phone, password }));
    // Directly proceed to the next step
    wizard.current!.next();
    // if (signUpMethod === "phone") {
    //   let res = await sendOTP(phone);
    //   if (res.success === "success") {
    //     wizard.current!.next();
    //   } else if (res.error) {
    //     setError(res.error);
    //     setHasError(true);
    //   } else {
    //     setError("Error kindly retry");
    //     setHasError(true);
    //   }
    // } else {
    //   let res = await checkPhone(phone);
    //   if (res.success === "success") {
    //     wizard.current!.next();
    //   } else if (res.error) {
    //     setError(res.error);
    //     setHasError(true);
    //   } else {
    //     setError("Error kindly retry");
    //     setHasError(true);
    //   }
    // }
    setLoading(false);
  };

  // const handleSubmit3 = async ({ token }) => {
  //   setLoading(true);
  //   try {
  //     setFormData((prev) => Object.assign(prev, { token }));

  //     if (signUpMethod === "phone") {
  //       let res = await verifyOTP(formData.phone, token);
  //       if (res.success) {
  //         let values = formData;
  //         let res2 = await register(values.phone, values.password);
  //         setLoading(false);
  //         if (res2.success) {
  //           setSuccessMessage("Registered Successfully. Continue to Login");
  //           setIsSuccess(true);
  //         } else if (res2.error) {
  //           setError(res2.error);
  //           setHasError(true);
  //         } else {
  //           setError("Error kindly retry");
  //           setHasError(true);
  //         }
  //       } else if (res.error) {
  //         setError(res.error);
  //         setHasError(true);
  //       } else {
  //         setError("Error kindly retry");
  //         setHasError(true);
  //       }
  //     } else {
  //       let res = await verifyEmailOTP(formData.email, token);
  //       if (res.success) {
  //         let values = formData;
  //         let res2 = await registerWithEmail(
  //           values.email,
  //           values.firstName,
  //           values.lastName,
  //           values.phone,
  //           values.password
  //         );
  //         setLoading(false);
  //         if (res2.success) {
  //           setSuccessMessage("Registered Successfully. Continue to Login");
  //           setIsSuccess(true);
  //         } else if (res2.error) {
  //           setError(res2.error);
  //           setHasError(true);
  //         } else {
  //           setError("Error kindly retry");
  //           setHasError(true);
  //         }
  //       } else if (res.error) {
  //         setError(res.error);
  //         setHasError(true);
  //       } else {
  //         setError("Error kindly retry");
  //         setHasError(true);
  //       }
  //     }
  //     setLoading(false);
  //   } catch (e) {
  //     console.log(e);
  //     setError("Error kindly retry");
  //     setHasError(true);
  //   }
  //   setLoading(false);
  // };

  const handleSubmit3 = async ({ token }) => {
    setLoading(true);
    try {
      // Set the token in the form data
      setFormData((prev) => ({ ...prev, token }));
  
      // Proceed to registration directly without OTP verification
      let values = formData;
      let res;
      if (signUpMethod === "phone") {
        res = await register(values.phone, values.password);
      } else {
        res = await registerWithEmail(
          values.email,
          values.firstName,
          values.lastName,
          values.phone,
          values.password
        );
      }
  
      setLoading(false);
  
      // Handle the registration response
      if (res.success) {
        setSuccessMessage("Registered Successfully. Continue to Login");
        setIsSuccess(true);
      } else if (res.error) {
        setError(res.error);
        setHasError(true);
      } else {
        setError("Error kindly retry");
        setHasError(true);
      }
    } catch (error) {
      console.log(error);
      setError("Error kindly retry");
      setHasError(true);
      setLoading(false);
    }
  };
  

  const stepList = [
    // {
    //   content: (
    //     <Step0
    //       withPhone={() => startSignUp("phone")}
    //       withEmail={() => startSignUp("email")}
    //       loading={loading}
    //     />
    //   ),
    // },
    {
      content:
        signUpMethod === "phone" ? (
          <Step2
            handleSubmit2={handleSubmit2}
            formData={formData}
            loading={loading}
          />
        ) : (
          <Step1
            handleSubmit1={handleSubmit1}
            formData={formData}
            loading={loading}
          />
        ),
    },
    {
      content: (
        <Step2
          handleSubmit2={handleSubmit2}
          formData={formData}
          loading={loading}
        />
      ),
    },
    {
      content: (
        <Step3
          handleSubmit3={handleSubmit3}
          loading={loading}
          signUpMethod={signUpMethod}
        />
      ),
    },
  ];

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require("../../../assets/auth-bg.png")}
          style={styles.container}
        >
          <KeyboardAwareScrollView
            extraScrollHeight={keyboardVerticalOffset}
            style={{ flex: 1, width: "100%" }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={require("../../../assets/sosocare_logo.png")}
                  style={styles.headerImage}
                />
              </View>

              <View style={styles.formContainer}>
                <Text style={{ ...styles.headingText }}>{stepTitle}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {currentStep > 0 ? (
                    <Pressable
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                      onPress={() => wizard.current!.prev()}
                    >
                      <Ionicons
                        name="ios-chevron-back"
                        style={{
                          ...styles.subHeadingText,
                          fontSize: 20,
                          marginLeft: 0,
                          color: COLORS.primary,
                        }}
                        color={COLORS.primary}
                      />
                      <Text
                        style={{
                          ...styles.subHeadingText,
                          color: COLORS.primary,
                          marginLeft: 0,
                        }}
                      >
                        Back
                      </Text>
                    </Pressable>
                  ) : null}
                  <Text
                    style={{
                      ...styles.subHeadingText,
                      marginLeft: currentStep > 0 ? 33 : 0,
                    }}
                  >
                    Step {currentStep + 1} of {signUpMethod === "email" ? 3 : 3}
                  </Text>
                </View>

                <View style={styles.form}>
                  <View>
                    <Wizard
                      ref={wizard}
                      steps={stepList}
                      isFirstStep={(val) => setIsFirstStep(val)}
                      isLastStep={(val) => setIsLastStep(val)}
                      currentStep={({
                        currentStep,
                        isLastStep,
                        isFirstStep,
                      }) => {
                        setCurrentStep(currentStep);
                      }}
                    />
                  </View>
                </View>

              </View>

              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 25,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FONTS.semiBold,
                    color: COLORS.dark,
                  }}
                >
                  Already registered?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={{ marginLeft: 4 }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 14,
                      fontFamily: FONTS.semiBold,
                    }}
                  >
                    Log in
                  </Text>
                </TouchableOpacity>
              </View>

              <SuccessSheet
                message={successMessage}
                open={isSuccess}
                closed={handleSuccess}
              />
              <ErrorSheet error={error} open={hasError} closed={clearError} />

            </View>

          </KeyboardAwareScrollView>
        </ImageBackground>
      </SafeAreaView>
    </NativeBaseProvider>
  );
};

const Step0 = ({ withPhone, withEmail, loading }) => {
  return (
    <View style={{ width: "100%", marginTop: "20%", marginBottom: "10%" }}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <ButtonWithTitle
          loading={loading}
          noBg={false}
          title={"Sign up with Phone"}
          backgroundColor={COLORS.primary}
          color={COLORS.white}
          onTap={withPhone}
          width={"100%"}
        />
      </View>

      <ButtonWithTitle
        loading={loading}
        noBg={false}
        title={"Sign up with Email"}
        backgroundColor={COLORS.pallete_white}
        color={COLORS.dark}
        onTap={withEmail}
        width={"100%"}
      />
    </View>
  );
};

const Step1 = ({ handleSubmit1, loading, formData }) => {
  const Step1Schema = yup.object().shape({
    firstName: yup
      .string()
      .trim()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .matches(/[A-Za-z ]{1,32}/, "Only alphabets are allowed")
      .required("First Name is required"),
    lastName: yup
      .string()
      .trim()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .matches(/[A-Za-z ]{1,32}/, "Only alphabets are allowed")
      .required("Last Name is required"),
    email: yupSequentialStringSchema(
      [
        yup.string().required("Email is required"),
        yup.string().email("Invalid email format"),
      ],
      resetFormError
    ),
  });
  return (
    <Formik
      initialValues={{
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }}
      onSubmit={(values) => handleSubmit1(values)}
      validationSchema={Step1Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: "100%" }}>
          <TextField
            hasIcon={false}
            label="First name"
            isSecure={false}
            handleChange={handleChange("firstName")}
            passBlur={handleBlur("firstName")}
            value={formData.firstName}
          />
          {errors.firstName && touched.firstName ? (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          ) : null}
          <TextField
            hasIcon={false}
            label="Last name"
            isSecure={false}
            handleChange={handleChange("lastName")}
            passBlur={handleBlur("lastName")}
            value={formData.lastName}
          />
          {errors.lastName && touched.lastName ? (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          ) : null}
          <TextField
            hasIcon={false}
            label="Email"
            isSecure={false}
            isEmail={true}
            handleChange={handleChange("email")}
            passBlur={handleBlur("email")}
            value={formData.email}
          />
          {errors.email && touched.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
          <ButtonWithTitle
            loading={loading}
            noBg={false}
            title={"Continue"}
            backgroundColor={COLORS.primary}
            color={COLORS.white}
            onTap={handleSubmit}
            width={"100%"}
          />
        </View>
      )}
    </Formik>
  );
};

const Step2 = ({ handleSubmit2, loading, formData }) => {
  const Step2Schema = yup.object().shape({
    phone: yupSequentialStringSchema(
      [
        yup.string().required("Phone Number is required"),
        yup
          .string()
          .matches(
            /^\S*$/,
            "Please provied phone mumber without spaces and dashes in format like 08012345678"
          ),
        yup.string().phone("Please enter valid phone number"),
      ],
      resetFormError
    ),
    password: yup
      .string()
      .required("Pin is required")
      .min(4, "Password must be at least 4 characters")
      .max(4, "Password must not be more than 4 characters"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Pins must match")
      .required("Pin is Required"),
  });
  return (
    <Formik
      initialValues={{
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.password,
      }}
      onSubmit={(values) => handleSubmit2(values)}
      validationSchema={Step2Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: "100%" }}>
          <TextField
            hasIcon={false}
            isNumber={true}
            isPhone={true}
            label="Phone Number"
            isSecure={false}
            handleChange={handleChange("phone")}
            passBlur={handleBlur("phone")}
            value={formData.phone}
          />
          {errors.phone && touched.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}
          <TextField
            hasIcon={true}
            label="Pin"
            icon={"lock-open-outline"}
            isSecure={true}
            handleChange={handleChange("password")}
            passBlur={handleBlur("password")}
            value={formData.password}
          />
          {errors.password && touched.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
          <TextField
            hasIcon={true}
            icon={"lock-open-outline"}
            label="Confirm Pin"
            isSecure={true}
            handleChange={handleChange("confirmPassword")}
            passBlur={handleBlur("confirmPassword")}
            value={formData.password}
          />
          {errors.confirmPassword && touched.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}

          <ButtonWithTitle
            loading={loading}
            noBg={false}
            title={"Continue"}
            backgroundColor={COLORS.primary}
            color={COLORS.white}
            onTap={handleSubmit}
            width={"100%"}
          />
        </View>
      )}
    </Formik>
  );
};

const Step3 = ({ handleSubmit3, loading, signUpMethod }) => {
  const Step3Schema = yup.object().shape({
    token: yup.string().trim().min(4, "Too Short!").max(6, "Too Long!"),
  });
  return (
    <Formik
      initialValues={{
        token: "",
      }}
      onSubmit={(values) => handleSubmit3(values)}
      validationSchema={Step3Schema}
    >
      {({ errors, handleBlur, touched, handleChange, handleSubmit }) => (
        <View style={{ width: "100%" }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.dark,
              fontFamily: FONTS.medium,
              marginVertical: 6,
            }}
          >
            An OTP has been sent to your{" "}
            {signUpMethod === "phone" ? "phone number" : "email"} kindly verify
            your {signUpMethod === "phone" ? "phone number" : "email"} by
            providing OTP below
          </Text>
          <TextField
            hasIcon={false}
            isNumber={true}
            isPhone={false}
            label="----"
            isSecure={false}
            handleChange={handleChange("token")}
            passBlur={handleBlur("token")}
          />
          {errors.token && touched.token ? (
            <Text style={styles.errorText}>{errors.token}</Text>
          ) : null}
          <ButtonWithTitle
            loading={loading}
            noBg={false}
            title={"Submit"}
            backgroundColor={COLORS.primary}
            color={COLORS.white}
            onTap={handleSubmit}
            width={"100%"}
          />
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    backgroundColor: "white",
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerImage: {
    resizeMode: "contain",
    width: "60%",
    marginVertical: 80,
  },
  formContainer: {
    width: "100%",
    flexDirection: "column",
    paddingHorizontal: 24,
  },
  form: {
    width: "100%",
    flexDirection: "column",
  },
  headingText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.heading,
    color: COLORS.dark,
    marginBottom: SIZES.font,
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

export default SignupScreen;
