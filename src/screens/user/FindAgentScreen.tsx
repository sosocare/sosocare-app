import { View, Text, Platform, SafeAreaView, StyleSheet, Linking } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Formik } from 'formik';
import * as yup from 'yup';
import * as Location from 'expo-location';

import { COLORS, SIZES, FONTS } from '../../constants';

import { TextField } from "../../components/TextField";
import SelectField from "../../components/SelectField";
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import ErrorSheet from "../../components/ErrorSheet";
import { AgentListItem } from "../../components/AgentListItem";
import ContentSheet from "../../components/ContentSheet";

import axios from 'axios';
import { BASE_URL } from '../../utils';

import { connect } from 'react-redux';
import { ApplicationState, UserState, LocationModel, AgentModel } from '../../redux';
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

interface FindAgentScreenProps {
  userReducer: UserState;
}

interface CustomAgentModel extends AgentModel {
  address_city: string;
  address_street: string;
  address_state: string;
  first_name: string;
  last_name: string;
  address_lat: string;
  address_long: string;
}

const _FindAgentScreen: React.FC<FindAgentScreenProps> = (props) => {
  const { userReducer } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);

  const [showContent, setShowContent] = useState(false);

  const wizard = useRef<WizardRef>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

  const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
  const [addressState, setAddressState] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [street, setStreet] = useState('');
  const [displayAddress, setDisplayAddress] = useState("Waiting for Current Location");
  const [agents, setAgents] = useState<Array<CustomAgentModel>>([]);
  const [activeAgent, setActiveAgent] = useState<CustomAgentModel>();

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
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required'),
  });

  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };
  const clearError = () => {
    setHasError(false);
    setLoading(false);
  };

  const findAgents = async () => {
    try {
      setLoading(true);
      const configurationObject = {
        method: 'post',
        url: `${BASE_URL}user/agents/find`,
        data: {
          city: city,
          state: addressState
        }
      };
      const response = await axios(configurationObject);

      let resBody = response.data;
      // console.log("agents: ", response.data);

      if (resBody['status'] === 'error') {
        setLoading(false);
        setError("Error loading agents");
        setHasError(true);
        return;
      } else {
        setAgents(resBody.agents.agents);
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
    await findAgents();
    wizard.current!.next();
  };
  const showAgent = async (id) => {
    try {
      setLoading(true);
      let currentItem = agents.find((item) => item._id === id);
      if (currentItem) {
        setActiveAgent(currentItem);
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
      let existingLocation: LocationModel = userReducer.location;
      if (existingLocation.address_city && existingLocation.address_state) {
        setAddress({
          region: existingLocation.address_state,
          city: existingLocation.address_city,
          street: existingLocation.address_street,
          district: '',
          country: existingLocation.address_country,
          streetNumber: '',
          subregion: '',
          postalCode: '',
          name: '',
          isoCountryCode: '',
          timezone: ''
        });
        setAddressState(existingLocation.address_state);
        setCity(existingLocation.address_city);
        setStreet(existingLocation.address_street || '');
        return;
      }
      if (addressState && addressState !== '') return;
      setLoading(true);
      try {
        if (!mounted) {
          return;
        }
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Permission to access location is not granted');
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
          let addressResponse: any = await Location.reverseGeocodeAsync({ latitude, longitude });
          for (let item of addressResponse) {
            setLoading(false);
            setAddress(item);
            // onUpdateLocation(item)
            let currentAddress = `${item.name},${item.street}, ${item.postalCode}, ${item.country}`;
            setDisplayAddress(currentAddress);
            setAddressState(item.region);
            setCity(item.city);
            setStreet(item.street);
            return;
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
      if (!addressState || addressState === '') return;
      if (!mounted) {
        return;
      }
      setLoading(true);
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

  const openAddressOnMap = (label, lat, lng, address) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    // const url = Platform.select({
    //   ios: `${scheme}${label}@${latLng}`,
    //   android: `${scheme}${latLng}(${label})`,
    // });
    const url = Platform.select({
      ios: `maps://?daddr=${address}`,
      android: "https://www.google.com/maps/search/?api=1&query=" + address,
    });
    Linking.openURL(url!);
  };

  const Main = ({ handleSubmit }) => {
    return (
      <View style={{ ...styles.stepContainer }}>
        <View style={{ flex: 2, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require("../../../assets/location.png")} alt={'Search Image'} style={{ resizeMode: 'contain', marginBottom: 0 }} w={'2/5'} />
        </View>

        <View style={styles.formContainer}>
          <Text style={{ ...styles.headingText }}>Find Agents</Text>
          <Text style={{ ...styles.subHeadingText }}>
            Find the nearest SOSOCARE Agents near you
          </Text>
          <View style={styles.form}>
            <Formik

              initialValues={{
                state: addressState,
                street: street,
                city: city,
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
                  <SelectField
                    hasIcon={false}
                    label='City'
                    handleChange={(val) => {
                      handleChange('city')(val);
                      setCity(val);
                    }}
                    options={cities}
                    value={city}
                    isDisabled={loading ? true : city && city !== '' ? false : addressState && addressState !== '' ? false : true}
                  />
                  {errors.city && touched.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                  <TextField
                    hasIcon={false}
                    isNumber={false}
                    isPhone={false}
                    label='Street'
                    isSecure={false}
                    isDisabled={loading ? true : street && street !== '' ? false : city && city !== '' ? false : true}
                    handleChange={handleChange('street')}
                    passBlur={handleBlur('street')}
                    value={street}
                  />
                  {errors.street && touched.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
                  <ButtonWithTitle loading={loading} noBg={false} title={'Search'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                </View>
              )}
            </Formik>
          </View>
        </View>
      </View>
    );
  };
  const Results = ({ viewAgent }) => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Results</Text>
        <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ width: '100%', marginTop: 0, marginBottom: 60 }}>
            {
              agents.length > 0 ?
                agents.map((item: CustomAgentModel) => (
                  <AgentListItem
                    backgroundColor={COLORS.pallete_white}
                    tint={COLORS.fade}
                    color={COLORS.dark}
                    key={item._id}
                    id={item._id}
                    onTap={viewAgent}
                    description={`${item.first_name} ${item.last_name}`}
                    address={`${item.address_street}, ${item.address_city}, ${item.address_state}`}
                  />
                ))
                : <Text style={{ fontSize: 16, marginVertical: 60, fontFamily: FONTS.medium, color: COLORS.pallete_deep, textAlign: 'center' }}>No agent Found for this location</Text>
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
      </View>
    );

  };

  const stepList = [
    {
      content: <Main handleSubmit={() => handleMain()} />,
    },
    {
      content: <Results viewAgent={showAgent} />,
    },
  ];

  const AgentContent = () => {
    const activeItem = activeAgent;
    if (activeItem) {
      return (
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
          <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>Agent Details</Text>
          <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Name
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.first_name} {activeItem.last_name}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                State
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.address_state}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                City
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.address_city}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Street
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.address_street}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Contact
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.phone}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Status
              </Text>
              <View style={[
                styles.transactionRecordRight, { justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }]}
              >
                <Text style={[
                  { maxWidth: 50 },
                  { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.pallete_deep, padding: 6 }
                ]}
                >
                  Available
                </Text>
              </View>
            </View>
            {/* <View style={{ width: '100%', marginTop: 10 }}>
              <ButtonWithTitle
                title={"View on map"}
                color={COLORS.pallete_deep}
                bordered
                backgroundColor={'transparent'}
                loading={false}
                width={'100%'}
                onTap={() => openAddressOnMap(`SOSOCARE Agent ${activeItem.first_name} ${activeItem.last_name}`, activeItem.address_lat, activeItem.address_long, `${activeItem.address_street} ${activeItem.address_city} ${activeItem.address_state}`)}
              />
            </View> */}
          </View>
        </View>
      );
    }
    return (<></>);

  };

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
            {<ContentSheet content={<AgentContent />} open={showContent} closed={closeContent} />}
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


const mapToStateProps = (state: ApplicationState) => ({
  userReducer: state.UserReducer,
  walletReducer: state.WalletReducer
});

const FindAgentScreen = connect(mapToStateProps, {})(_FindAgentScreen);
export default FindAgentScreen;