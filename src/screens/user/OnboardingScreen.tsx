import React, { useEffect, useState, useRef } from "react";
// external libraries
import axios from "axios";
import * as Location from "expo-location";
import { formatCurrency } from "react-native-format-currency";
import { Paystack } from "react-native-paystack-webview";
// import Wizard
import Wizard, { WizardRef } from "react-native-wizard";
// components
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
  ActivityIndicator,
} from "react-native";

//   external componenets
import { TextField } from "../../components/TextField";
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import SelectField from "../../components/SelectField";
import ErrorSheet from "../../components/ErrorSheet";
import SuccessSheet from "../../components/SuccessSheet";
import NoticeSheet from "../../components/NoticeSheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from "@expo/vector-icons/Ionicons";
// formik
import { Formik } from "formik";
import * as yup from "yup";
import "yup-phone";

//   native base and themes
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

//   redux
import { connect } from "react-redux";
import { OnboardingInsurancePlans } from "./InsuranceScreen";
import {
  PlanModel,
  OnLoadPlans,
  InsuranceState,
  ApplicationState,
  OnBuyInsuranceOnboarding,
  OnGetPayStackKey,
} from "../../redux";

//   navigations
import { useNavigation } from "@react-navigation/native";
import { UserAuthScreenNavigationProp } from "../../navigation/auth/types";

//   presets
import { yupSequentialStringSchema } from "../../utils/yup-utils";
import { COLORS, SIZES, FONTS } from "../../constants";
import { BASE_URL } from "../../utils";
const keyboardVerticalOffset = Platform.OS === "ios" ? 20 : 0;
let resetFormError: () => void;
const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

// props
interface OnboardingScreenProps {
  OnLoadPlans: Function;
  insuranceReducer: InsuranceState;
  OnGetPayStackKey: Function;
  OnBuyInsuranceOnboarding: Function;
}
const _OnboardingScreen: React.FC<OnboardingScreenProps> = (props) => {
  const {
    OnLoadPlans,
    insuranceReducer,
    OnGetPayStackKey,
    OnBuyInsuranceOnboarding,
  } = props;
  
  const navigation = useNavigation<UserAuthScreenNavigationProp>();

  // check email and phone
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

  // state
  const [plans, setPlans] = useState<Array<PlanModel>>();

  const [activePlan, setActivePlan] = useState<PlanModel>();
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    token: "",
    password: "",
  });

  // wizard
  const wizard = useRef<WizardRef>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTitle, setStepTitle] = useState("Select a Plan");
  const selectPlan = (id) => {
    const selectedPlan = plans!.find((item) => item._id === id);
    setStepTitle("Fill in your details");
    wizard.current!.next();
    setActivePlan(selectedPlan);
  };
  const handleSubmit1 = async ({
    firstName,
    lastName,
    email,
    phone,
    password,
  }) => {
    setLoading(true);
    try {
      setFormData((prev) =>
        Object.assign(prev, { firstName, lastName, email, phone, password })
      );

      let res = await checkEmail(email);
      if (res.success === "success") {
        let res2 = await checkPhone(phone);
        if (res2.success === "success") {
          setLoading(false);
          setStepTitle("Make payment");
          wizard.current!.next();
        } else if (res2.error) {
          setLoading(false);
          setError(res2.error);
          setHasError(true);
        } else {
          setLoading(false);
          setError("Error kindly retry");
          setHasError(true);
        }
      } else if (res.error) {
        setLoading(false);
        setError(res.error);
        setHasError(true);
      } else {
        setLoading(false);
        setError("Error kindly retry");
        setHasError(true);
      }
    } catch (err) {
      console.log("step 2: ", err);
    }
  };

  const onPaymentSuccess = () => {
    setSuccessMessage(
      "Congratulations. Your account has been created and your subscription activated. Login to access your account."
    );
    setIsSuccess(true);
  };
  const stepList = [
    {
      content: <FirstStep plans={plans} selectPlan={selectPlan} />,
    },
    {
      content: (
        <SecondStep
          loading={loading}
          formData={formData}
          handleSubmit1={handleSubmit1}
        />
      ),
    },
    {
      content: (
        <ThirdStep
          externalLoading={loading}
          formData={formData}
          OnBuyInsuranceOnboarding={OnBuyInsuranceOnboarding}
          OnGetPayStackKey={OnGetPayStackKey}
          plan={activePlan}
          onPaymentSuccess={onPaymentSuccess}
        />
      ),
    },
  ];

  // alert modals
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
    navigation.navigate("Login");
  };

  // sign up
  const [signUpMethod, setSignUpMethod] = useState("email");

  // paystack

  // first loads
  useEffect(() => {
    let mounted = true;
    const source = axios.CancelToken.source();
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setFirstLoading(true);
        await OnLoadPlans();
        let plans = insuranceReducer.plans;
        if (!mounted) {
          return;
        }
        setPlans(plans);
        setFirstLoading(false);
      } catch (error) {
        setFirstLoading(false);
        setError("Unable to load Insurance Plans");
        setHasError(true);
        return;
      }
    })();
    return () => {
      source.cancel();
      mounted = false;
    };
  }, [reload]);
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
                    Step {currentStep + 1} of 3
                  </Text>
                </View>

                <View style={styles.form}>
                  {firstLoading ? (
                    <View
                      style={{
                        flex: 1,
                        height: 500,
                        maxHeight: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                    <ActivityIndicator size={"large"} />
                    </View>
                  ) : (
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
                  )}
                </View>

              </View>

              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 25,
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

// steps
const Step0 = ({}) => {
  return (
    <View style={{ width: "100%", marginTop: "20%", marginBottom: "10%" }}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <ButtonWithTitle
          loading={false}
          noBg={false}
          title={"Sign up with Phone"}
          backgroundColor={COLORS.primary}
          color={COLORS.white}
          onTap={() => {}}
          width={"100%"}
        />
      </View>
      <ButtonWithTitle
        loading={false}
        noBg={false}
        title={"Sign up with Email"}
        backgroundColor={COLORS.pallete_white}
        color={COLORS.dark}
        onTap={() => {}}
        width={"100%"}
      />
    </View>
  );
};


const FirstStep = ({ plans, selectPlan }) => {
  return (
    <View style={{ width: "100%" }}>
      <View style={{ marginVertical: 10, width: "100%", alignItems: "center" }}>
        <OnboardingInsurancePlans plans={plans} onNavigate={selectPlan} />
      </View>
    </View>
  );
};

const SecondStep = ({ handleSubmit1, loading, formData }) => {
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.password,
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
            <Text style={styles.errorText}>{errors.firstName.toString()}</Text>
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
            <Text style={styles.errorText}>{errors.lastName.toString()}</Text>
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
            <Text style={styles.errorText}>{errors.email.toString()}</Text>
          ) : null}
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
            <Text style={styles.errorText}>{errors.phone.toString()}</Text>
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
            <Text style={styles.errorText}>{errors.password.toString()}</Text>
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
            <Text style={styles.errorText}>
              {errors.confirmPassword.toString()}
            </Text>
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

const ThirdStep = ({
  onPaymentSuccess,
  plan,
  externalLoading,
  OnGetPayStackKey,
  formData,
  OnBuyInsuranceOnboarding,
}) => {
  const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
  const [addressState, setAddressState] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [displayAddress, setDisplayAddress] = useState(
    "Waiting for Current Location"
  );
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
    onPaymentSuccess();
    // payment done emit
  };
  const handleNotice = () => {
    setHasNotice(false);
    setLoading(false);
  };

  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [duration, setDuration] = useState("1 month");
  const [payingWithPayStack, setPayingWithPayStack] = useState(false);
  const [paystackKey, setPaystackKey] = useState("");
  const [verifying, setVerifying] = useState(false);
  const durations = [
    { title: "1 month", value: "1 month" },
    { title: "3 months", value: "3 months" },
    { title: "6 months", value: "6 months" },
    { title: "1 year", value: "12 months" },
  ];
  const [hospitals, setHospitals] = useState<Array<HospitalModel>>([]);
  const [optionsHospitals, setOptionsHospitals] = useState<
    Array<SelectHospitalModel>
  >([]);
  const [pharmas, setPharmas] = useState<Array<PharmaModel>>([]);
  const [optionsPharmas, setOptionsPharmas] = useState<
    Array<SelectPharmaModel>
  >([]);
  const [activePharma, setActivePharma] = useState<PharmaModel>();
  const [activeHospital, setActiveHospital] = useState<HospitalModel>();
  const methods = [
    { title: "Wallet", value: "Wallet" },
    { title: "Paystack", value: "Paystack" },
  ];

  const findHospitals = async (state, lga) => {
    try {
      setLoading(true);
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}hospitals`,
        data: {
          state: state ? state : addressState,
          lga: lga ? lga : city,
        },
      };
      const response = await axios(configurationObject);
      let resBody = response.data;

      if (resBody["status"] === "error") {
        setLoading(false);
        setError("Error loading hospitals");
        setHasError(true);
        return;
      } else {
        setHospitals(resBody.hospitals);
        let thisHosps: SelectHospitalModel[] = [];
        for (let i = 0; i < resBody.hospitals.length; i++) {
          let hops: HospitalModel = resBody.hospitals[i];
          thisHosps.push({
            title: `${hops.name}`,
            value: hops.name,
          });
        }
        setOptionsHospitals(thisHosps);
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

  const findPharmas = async (state, lga) => {
    try {
      setLoading(true);
      const configurationObject = {
        method: "post",
        url: `${BASE_URL}pharmacies`,
        data: {
          state: state ? state : addressState,
          lga: lga ? lga : city,
        },
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      if (resBody["status"] === "error") {
        setLoading(false);
        setError("Error loading pharmacies");
        setHasError(true);
        return;
      } else {
        setPharmas(resBody.pharmacies);
        let thisPhams: SelectPharmaModel[] = [];
        for (let i = 0; i < resBody.pharmacies.length; i++) {
          let pharm: PharmaModel = resBody.pharmacies[i];
          thisPhams.push({
            title: pharm.name,
            value: pharm.name,
          });
        }
        setOptionsPharmas(thisPhams);
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
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      if (addressState && addressState !== "") return;
      setLoading(true);
      try {
        if (!mounted) {
          return;
        }
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError("Permission to access location is not granted");
          setHasError(true);
          setLoading(false);
        }

        let location: any = await Location.getCurrentPositionAsync({});

        const { coords } = location;

        if (coords) {
          const { latitude, longitude } = coords;
          if (!mounted) {
            return;
          }
          let addressResponse: any = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          let region = "";
          let lga = "";
          for (let item of addressResponse) {
            setLoading(false);
            region = item.region;
            lga = item.city;
            setAddress(item);
            // onUpdateLocation(item)
            let currentAddress = `${item.name},${item.street}, ${item.postalCode}, ${item.country}`;
            setDisplayAddress(currentAddress);
            setAddressState(item.region);
            setCity(item.city);
            return
          }
          if (plan.name === "Sosocare Basic Plan") {
            await findPharmas(region, lga);
          } else if (plan.name === "Sosocare Silver Plan") {
            await findHospitals(region, lga);
          } else {
            await findPharmas(region, lga);
            await findHospitals(region, lga);
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
        if (error.message.toLowerCase().includes("location")) {
          setError("Permission to access location is not granted");
        }
        setHasError(true);
        setLoading(false);
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
      if (!addressState || addressState === "") return;
      if (!mounted) {
        return;
      }
      setLoading(true);
      try {
        if (!mounted) {
          return;
        }
        const configurationObject = {
          method: "get",
          url: `${BASE_URL}cities?state=${addressState.toLowerCase()}`,
          cancelToken: source.token,
        };
        const response = await axios(configurationObject);

        let resBody = response.data;
        if (!mounted) {
          return;
        }
        if (resBody["cities"]) {
          let allCities = resBody["cities"].map((item) => {
            return { title: item.title, value: item.title };
          });
          setCities(allCities);
          let isExist = allCities.find((item) => item.title === city);
          if (!isExist) {
            let defaultCity = allCities[0].title;
            setCity(defaultCity);
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
  useEffect(() => {
    const source = axios.CancelToken.source();
    let mounted = true;
    (async () => {
      if (!city || city === "") return;
      if (!mounted) {
        return;
      }
      setLoading(true);
      try {
        if (!mounted) {
          return;
        }
        if (plan.name === "Sosocare Basic Plan") {
          await findPharmas(addressState, city);
        } else if (plan.name === "Sosocare Silver Plan") {
          await findHospitals(addressState, city);
        } else {
          await findPharmas(addressState, city);
          await findHospitals(addressState, city);
        }
        setLoading(false);
      } catch (error) {
        if (!mounted) {
          return;
        }
        
        setLoading(false);
      }
    })();
    return () => {
      source.cancel();
      mounted = false;
    };
  }, [city]);


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

  const PurchaseSchema = yup.object().shape({
    duration: yup.string().required("Duration is required"),
    payment_method: yup.string().required("Payment Method is required"),
    amount: yup.string().required(),
    state: yup.string().required("State is required"),
    city: yup.string().required("City is required"),
    centre: yup
      .string()
      .required(
        `Preferred ${
          plan.name === "Sosocare Basic Plan" ? "Pharmacy" : "Hospital"
        } is required`
      ),
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      let multiplier = parseInt(duration.charAt(0));
      let totalPrice = plan.price * multiplier;
      setPaymentAmount(((totalPrice / 100) * 100) / 100);
      const [
        incomeValueFormattedWithSymbol,
        incomeValueFormattedWithoutSymbol,
        incomeSymbol,
      ] = formatCurrency({ amount: totalPrice / 100, code: "USD" });
      setTotalAmount(incomeValueFormattedWithoutSymbol);
    })();

    return () => {
      mounted = false;
    };
  }, [duration]);

  const handlePayError = () => {
    setLoading(false);
    setPayingWithPayStack(false);
    setError("Payment Error");
    setHasError(true);
  };
  const handlePayDone = async (reference) => {
    try {
      setVerifying(true);
      setLoading(false);

      let res = await OnBuyInsuranceOnboarding(
        plan._id,
        duration,
        "paystack",
        reference,
        formData,
        addressState,
        city,
        activePharma,
        activeHospital
      );
      if (res.pending) {
        setVerifying(false);
        setLoading(false);
        setPayingWithPayStack(false);
        setHasNotice(true);
        setNoticeMessage(
          "Confirmation pending. Your Insurance will be activated once we confirm your payment"
        );
        return;
      }
      if (res.error) {
        setVerifying(false);
        setLoading(false);
        setPayingWithPayStack(false);
        setError(res.error);
        setHasError(true);
        return;
      }
      if (res.success) {
        setVerifying(false);
        setLoading(false);
        setPayingWithPayStack(false);
        setSuccessMessage(
          "Congratulations, you now have Insurance cover at all of our partner facilities."
        );
        setIsSuccess(true);
        return;
      }
    } catch (error) {
      setVerifying(false);
      setLoading(false);
      setPayingWithPayStack(false);
      setError(error.message);
      setHasError(true);
      return;
    }
  };
  const handleSubmit = async ({ duration, centre }) => {
    try {
      setLoading(true);
      setActiveHospital(centre)
      setActivePharma(centre)
      let res = await OnGetPayStackKey();
      if (res.success) {
        setPaystackKey(res.paystack_public);
        setLoading(false);
        setPayingWithPayStack(true);
        return;
      } else {
        setLoading(false);
        setError(
          "Unable to connect to Paystack, check your network and kindly try again"
        );
        setHasError(true);
        return;
      }
    } catch (error) {
      setLoading(false);
      setError(
        "Unable to connect to Paystack, check your network and kindly try again"
      );
      setHasError(true);
      return;
    }
  };

  if (verifying) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          height: 500
        }}
      >
        <ActivityIndicator size={"large"} />
        <Text
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: SIZES.large,
            fontFamily: FONTS.semiBold,
            color: COLORS.pallete_deep,
          }}
        >
          Verifying transaction
        </Text>
      </View>
    );
  } else if (payingWithPayStack) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Paystack
          paystackKey={paystackKey}
          amount={paymentAmount}
          billingEmail={formData.email}
          onCancel={(e) => {
            handlePayError();
            // handle response here
          }}
          onSuccess={(res) => {
            handlePayDone(res?.transactionRef?.reference);
            // handle response here
          }}
          autoStart={true}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.form}>
        <Formik
          initialValues={{
            duration: "1 month",
            payment_method: "Wallet",
            amount: totalAmount,
            centre: "",
            state: addressState,
            city: city,
          }}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
          validationSchema={PurchaseSchema}
        >
          {({ errors, touched, handleChange, handleSubmit, values }) => (
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>Duration</Text>
              <SelectField
                hasIcon={false}
                label="Duration"
                handleChange={(val) => {
                  handleChange("duration")(val);
                  setDuration(val);
                }}
                options={durations}
                isDisabled={false}
                value={values.duration}
              />
              {errors.duration && touched.duration ? (
                <Text style={styles.errorText}>
                  {errors.duration.toString()}
                </Text>
              ) : null}
              <Text style={styles.label}>Total Amount</Text>
              <TextField
                isNumber={true}
                prefix={"\u20A6"}
                label="Amount"
                isSecure={false}
                isDisabled={true}
                handleChange={handleChange("amount")}
                value={totalAmount.toString()}
              />
              <Text style={styles.label}>State</Text>
              <SelectField
                hasIcon={false}
                label="State"
                handleChange={(val) => {
                  handleChange("state")(val);
                  setAddressState(val);
                }}
                options={states}
                value={addressState}
                isDisabled={loading}
              />
              {errors.state && touched.state ? (
                <Text style={styles.errorText}>{errors.state}</Text>
              ) : null}
              <Text style={styles.label}>LGA/City</Text>
              <SelectField
                hasIcon={false}
                label="City"
                handleChange={(val) => {
                  handleChange("city")(val);
                  setCity(val);
                }}
                options={cities}
                value={city}
                isDisabled={
                  loading
                    ? true
                    : city && city !== ""
                    ? false
                    : addressState && addressState !== ""
                    ? false
                    : true
                }
              />
              {errors.city && touched.city ? (
                <Text style={styles.errorText}>{errors.city}</Text>
              ) : null}

              {plan.name === "Sosocare Basic Plan" && (
                <View>
                  <Text style={styles.label}>Preferred Pharmacy</Text>
                  <SelectField
                    hasIcon={false}
                    label="Preferred Pharmacy"
                    handleChange={handleChange("centre")}
                    options={optionsPharmas}
                    isDisabled={
                      loading ? true : pharmas.length < 1 ? true : false
                    }
                  />
                  {errors.centre && touched.centre ? (
                    <Text style={styles.errorText}>{errors.centre}</Text>
                  ) : null}
                </View>
              )}
              {plan.name === "Sosocare Silver Plan" && (
                <View>
                  <Text style={styles.label}>Preferred Hospital</Text>
                  <SelectField
                    hasIcon={false}
                    label="Preferred Hospital"
                    handleChange={handleChange("centre")}
                    options={optionsHospitals}
                    isDisabled={
                      loading ? true : hospitals.length < 1 ? true : false
                    }
                  />
                  {errors.centre && touched.centre ? (
                    <Text style={styles.errorText}>{errors.centre}</Text>
                  ) : null}
                </View>
              )}
              <ButtonWithTitle
                loading={loading}
                noBg={false}
                title={"Pay with Paystack"}
                backgroundColor={COLORS.primary}
                color={COLORS.white}
                onTap={handleSubmit}
                width={"100%"}
              />
            </View>
          )}
        </Formik>
        <SuccessSheet
          message={successMessage}
          open={isSuccess}
          closed={handleSuccess}
        />
        <ErrorSheet error={error} open={hasError} closed={clearError} />
        <NoticeSheet
          message={noticeMessage}
          open={hasNotice}
          closed={handleNotice}
        />
      </View>
    );
  }
};

interface HospitalModel {
  name: string;
  address: string;
}

interface PharmaModel {
  email: string;
  phone: string;
  name: string;
  state: string;
  lga: string;
  address: string;
}
interface SelectPharmaModel {
  title: string;
  value: string;
}
interface SelectHospitalModel {
  title: string;
  value: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    backgroundColor: "white",
    width: "100%",
  },
  label: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray,
    marginBottom: 10,
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

const mapToStateProps = (state: ApplicationState) => ({
  insuranceReducer: state.InsuranceReducer,
});

const OnboardingScreen = connect(mapToStateProps, {
  OnLoadPlans,
  OnGetPayStackKey,
  OnBuyInsuranceOnboarding,
})(_OnboardingScreen);

export default OnboardingScreen;
