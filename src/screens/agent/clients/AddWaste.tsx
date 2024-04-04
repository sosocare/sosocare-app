import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { formatCurrency } from "react-native-format-currency";

import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import NoticeSheet from "../../../components/NoticeSheet";

import { COLORS, FONTS, SIZES } from '../../../constants';
import { getPrice } from "../../../utils/index";

import { Formik } from 'formik';
import * as yup from 'yup';

import { ClientScreenNavigationProp, ClientAddWasteScreenRouteProp } from "../../../navigation/agent/types";
import { useNavigation } from "@react-navigation/native";

import { connect } from 'react-redux';
import { ApplicationState, AgentState, OnLoadWallet, OnAddUserWaste, WalletState } from '../../../redux';
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

interface AddWasteProps {
  agentReducer: AgentState;
  OnLoadWallet: Function;
  OnAddUserWaste: Function;
  walletReducer: WalletState;
}

const _AddWaste: React.FC<AddWasteProps> = (props) => {
  const route = useRoute<ClientAddWasteScreenRouteProp>();
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const { agentReducer, OnLoadWallet, walletReducer, OnAddUserWaste } = props;
  const { client, material } = route.params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const [totalAmount, setTotalAmount] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) {
          return;
        }
        const res = getPrice(material.name);
        setUnitPrice(res.price);
        let wallet = walletReducer.wallet;
        const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: wallet.balance / 100, code: "USD" });
        setCashBalance(valueFormattedWithoutSymbol);

      } catch (error) {
        setError(error.message);
        setHasError(true);
        return;
      }

    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = async () => {
    setIsSuccess(false);
    await OnLoadWallet('agent', agentReducer.agent.authToken);
    navigation.navigate('ClientDetails', { client });
  };
  const handleNotice = () => {
    setHasNotice(false);
    setLoading(false);
  };

  const setPrice = async (val: number) => {
    const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: ((unitPrice * val / 100) * 100) / 100, code: "USD" });
    setTotalPrice(valueFormattedWithoutSymbol);
  };

  const AddWasteSchema = yup.object().shape({
    waste: yup.string().required('Material name is required'),
    amount: yup.string().required('Material amount is required'),
  });

  const handleSubmit = async ({ waste, amount }) => {
    setLoading(true);
    try {
      let res = await OnAddUserWaste(waste, amount, client._id);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        setHasError(true);
      }
      if (res.success) {
        setLoading(false);
        setSuccessMessage('Material Added');
        setIsSuccess(true);
      }

    } catch (e) {
      setError(e.message);
      setHasError(true);
      setLoading(false);
    }


  };

  const res = getPrice(material.name);
  const wasteImage = WasteImageService.GetImage(res.imageName);


  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: 'white' }} />
      <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
        <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'white' }} >
          <View style={styles.container}>
            <View style={{ width: '100%', marginVertical: 30 }}>
              <Text style={{ fontSize: SIZES.large, fontFamily: FONTS.semiBold, color: COLORS.dark }}>Client {client.first_name} {client.last_name}</Text>
            </View>
            <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
              <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center', marginTop: 20 }}>
                <View style={{ ...styles.formContainer, alignItems: 'center' }}>
                  <Image alt={material.name} style={{ width: 150, height: 150, resizeMode: 'contain', borderRadius: 75, marginBottom: 16 }} source={wasteImage} />
                  <Text style={{ ...styles.subHeadingText }}>
                    Select the amount Submitted by client
                  </Text>
                  <View style={styles.form}>
                    <Formik
                      initialValues={{
                        waste: material.name,
                        amount: totalAmount
                      }}
                      onSubmit={values => {
                        handleSubmit(values);
                      }}
                      validationSchema={AddWasteSchema}
                    >
                      {({ errors, touched, handleChange, handleSubmit, values }) => (
                        <View style={{ width: '100%' }}>
                          <Text style={styles.label}>Material</Text>
                          <TextField
                            isNumber={true}
                            label='Material'
                            isSecure={false}
                            isDisabled={true}
                            handleChange={handleChange('waste')}
                            value={material.name}
                          />
                          {errors.waste && touched.waste ? <Text style={styles.errorText}>{errors.waste}</Text> : null}
                          <Text style={styles.label}>Amount   <Text style={{ fontSize: SIZES.medium - 4, fontFamily: FONTS.medium, color: COLORS.pallete_deep }}>(Your Balance: {'\u20A6'}{cashBalance})</Text></Text>
                          <TextField
                            isNumber={false}
                            label='Total'
                            isSecure={false}
                            isDisabled={true}
                            handleChange={() => { }}
                            prefix={'₦'}
                            value={totalPrice}
                          />
                          <Text style={styles.label}>Weight (Kg) or Units</Text>
                          <TextField
                            isNumber={true}
                            label='Weight (Kg) or Units'
                            isSecure={false}
                            isDisabled={loading}
                            handleChange={async (val) => {
                              handleChange('amount')(val);
                              setPrice(val);
                            }}
                          />

                          <ButtonWithTitle loading={loading} noBg={false} title={'Submit'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={handleSubmit} width={'100%'} />
                        </View>
                      )}
                    </Formik>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
          <ErrorSheet error={error} open={hasError} closed={clearError} />
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
        </View>
      </KeyboardAwareScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );

};

// RETURN IMAGE PATH SERVICE
interface WasteImage {
  name: string;
  img: any;
}
class WasteImageService {
  private static images: Array<WasteImage> = [
    {
      name: 'batteries',
      img: require('../../../../assets/wastes/batteries.png')
    },
    {
      name: 'metal',
      img: require('../../../../assets/wastes/metal.png')
    },
    {
      name: 'hdpe',
      img: require('../../../../assets/wastes/hdpe.png')
    },
    {
      name: 'tin',
      img: require('../../../../assets/wastes/tin.png')
    },
    {
      name: 'carton',
      img: require('../../../../assets/wastes/carton.png')
    },
    {
      name: 'sachet_water',
      img: require('../../../../assets/wastes/sachet_water.png')
    },
    {
      name: 'white_nylon',
      img: require('../../../../assets/wastes/white_nylon.png')
    },
    {
      name: 'paper',
      img: require('../../../../assets/wastes/paper.png')
    },
    {
      name: 'steel',
      img: require('../../../../assets/wastes/steel.png')
    },
    {
      name: 'pet',
      img: require('../../../../assets/wastes/pet.png')
    },
  ];
  static GetImage = (name: string) => {
    const found = WasteImageService.images.find(e => e.name == name);
    return found ? found.img : null;
  };
}

const styles = StyleSheet.create({
  insuranceContainer: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingTop: 30,
    paddingBottom: 10,
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
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18
  },
  formContainer: {
    flex: 5,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 30
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
  insurancePlan: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 6
  },
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
  agentReducer: state.AgentReducer,
  walletReducer: state.WalletReducer
});

const AddWaste = connect(mapToStateProps, { OnLoadWallet, OnAddUserWaste })(_AddWaste);
export default AddWaste;