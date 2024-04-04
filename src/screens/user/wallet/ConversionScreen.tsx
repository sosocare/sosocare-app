import { View, Text, Dimensions, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../../constants';
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import { Convertible } from "../../../components/Convertible";
import ErrorSheet from "../../../components/ErrorSheet";
import NoticeSheet from "../../../components/NoticeSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome5';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/user/types";
import { formatCurrency } from "react-native-format-currency";

import { connect } from 'react-redux';
import { ApplicationState, UserState, WalletState, OnConvertItem, WasteLogModel, OnLoadWallet, OnConvertAllItems } from '../../../redux';

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

interface ConversionScreenProps {
  userReducer: UserState;
  walletReducer: WalletState;
  OnConvertItem: Function;
  OnConvertAllItems: Function;
  OnLoadWallet: Function;
}

const _ConversionScreen: React.FC<ConversionScreenProps> = (props) => {
  const { userReducer, walletReducer, OnConvertItem, OnConvertAllItems, OnLoadWallet } = props;
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeAllMessage, setNoticeAllMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [hasAllNotice, setHasAllNotice] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [wasteLogs, setWasteLogs] = useState<Array<WasteLogModel>>([]);
  const [convertibles, setConvertibles] = useState<Array<WasteLogModel>>([]);
  const [total, setTotal] = useState(0);

  const clearError = () => {
    setHasError(false);
    setLoading(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
    setLoading(false);
    navigation.navigate('SetLocation');
  };
  const handleSuccess = async () => {
    setIsSuccess(false);
    await OnLoadWallet('user', userReducer.user.authToken)
    await load();
    setLoading(false);
    // navigation.navigate('Login');
  };

  const load = async () => {
    try {
      let existingUser = userReducer.user;
      let wallet = walletReducer.wallet;
      let wastelogs = walletReducer.wastelogs;
      setWasteLogs(wastelogs || []);

      let converts: Array<WasteLogModel> = [];
      let preTotal = 0;
      let totalWeight = 0;
      for (let i = 0; i < wastelogs.length; i++) {
        let currentLog = wastelogs[i];
        if (currentLog.available_weight > 1000) {
          converts.push(currentLog);
          totalWeight += currentLog.available_weight;
          let price = 0;
          let title = currentLog.name;
          if (title === 'Batteries') {
            price = 2700;
          } else if (title === 'HDPE') {
            price = 3000;
          } else if (title === 'Carton') {
            price = 1800;
          } else if (title === 'Copper') {
            price = 4000;
          } else if (title === 'Tin') {
            price = 5000;
          } else if (title === 'PET') {
            price = 1500;
          } else if (title === 'Aluminium') {
            price = 5500;
          } else if (title === 'Steel') {
            price = 6000;
          } else if (title === 'Paper') {
            price = 1500;
          } else if (title === 'SachetWater') {
            price = 1000;
          } else if (title === 'White Nylon') {
            price = 2500;
          } else if (title === 'Metal') {
            price = 3000;
          }
          let subTotal = price / 100 * (currentLog.available_weight / 1000);
          preTotal += subTotal;
        }
      }
      setConvertibles(converts);
      const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: (preTotal * 100)/100, code: "USD" });
      setTotal(valueFormattedWithoutSymbol);
      setTotalWeight(totalWeight / 1000);
    } catch (error) {
      return;
    }
  };
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      await load();

    })();
    return () => {
      mounted = false;
    };

  }, []);

  const preConvertItem = async (id, amount) => {
    try {
      setLoading(true);
      let currentItem = convertibles.find((item) => item._id === id);
      setActiveItem(id);
      if (currentItem) {
        setNoticeMessage(`Convert your stored ${currentItem.name} of ${currentItem.available_weight / 1000} for ₦${amount}`);
        setHasNotice(true);
      }
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };
  const preConvertAll = async () => {
    try {
      setLoading(true);
      setNoticeAllMessage(`Convert your all Items of ${totalWeight} for ₦${total}`);
      setHasAllNotice(true);
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };
  const readyConvertAll = async () => {
    setHasAllNotice(false);
    try {
      setLoading(true);
      let res = await OnConvertAllItems('user');
      if (res.success === 'success') {
        setSuccessMessage('All Recyclables converted');
        setIsSuccess(true);
      } else if (res.error) {
        setError(res.error);
        setHasError(true);
      } else {
        setError("Error kindly retry");
        setHasError(true);
      }

    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };
  const readyConvertItem = async () => {
    setHasNotice(false);
    let actItem = convertibles.find((item) => item._id === activeItem);
    if (actItem) {
      let id = actItem.recyclable;
      try {
        setLoading(true);

        let res = await OnConvertItem(id, 'user');
        if (res.success === 'success') {
          setSuccessMessage('Weight Converted to Cash');
          setIsSuccess(true);
        } else if (res.error) {
          setError(res.error);
          setHasError(true);
        } else {
          setError("Error kindly retry");
          setHasError(true);
        }


      } catch (error) {
        setLoading(false);
        setError("Error kindly retry");
        setHasError(true);
      }
    }
  };

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 60 }}>
            <MaterialIcons name='recycle' style={{ fontSize: 80 }} color={COLORS.dark} />
            <MaterialIcons name='forward' style={{ fontSize: 45, marginHorizontal: 20 }} color={COLORS.gray} />
            <FontAwesome name='money-bill-wave' style={{ fontSize: 70 }} color={COLORS.primary} />
          </View>
          <WasteBalance logs={convertibles} convertItem={preConvertItem} totalWeight={totalWeight} />

          <View style={{ width: '100%', flexDirection: 'row', marginBottom: 100, justifyContent: 'space-between', alignItems: 'center' }}>
            {convertibles.length > 0 ?
              <ButtonWithTitle
                title={'Convert All for ₦' + total}
                backgroundColor={COLORS.primary}
                noBg={false}
                color={COLORS.white}
                loading={loading}
                onTap={() => preConvertAll()}
                width={'100%'}
                bordered
              /> : null}
          </View>
          <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
          <ErrorSheet error={error} open={hasError} closed={clearError} />
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={readyConvertItem} />
          <NoticeSheet message={noticeAllMessage} open={hasAllNotice} closed={readyConvertAll} />
        </View>

      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};

const WasteBalance = ({ totalWeight, logs, convertItem }) => {
  return (
    <View style={{ ...styles.insuranceContainer,  borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_white }}>
      <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep, textAlign: 'center' }}>Convertible Items</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalWeight} Kg</Text>
        </View>
        {logs.length > 0
          ? <View style={{ width: '100%', marginTop: 20 }}>
            {
              logs.map((item: WasteLogModel) => (
                <Convertible
                  onTap={(id, amount) => convertItem(id, amount)}
                  title={item.name}
                  balance={item.available_weight / 1000 || 0}
                  backgroundColor={COLORS.white}
                  tint={COLORS.fade}
                  color={COLORS.pallete_deep}
                  loading={false}
                  id={item._id}
                  key={item._id}
                />
              ))
            }


          </View>
          : <View style={{ width: '100%', marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: SIZES.medium, fontFamily: FONTS.medium, color: COLORS.pallete_deep, textAlign: 'center' }}>
              No convertible items available. Take your wastes to the nearest SOSOCARE Agent to increase your balance.
            </Text>

          </View>
        }
      </View>
    </View>
  );
};

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
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18,
    textAlign: 'center',
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

const ConversionScreen = connect(mapToStateProps, { OnConvertItem, OnLoadWallet, OnConvertAllItems })(_ConversionScreen);
export default ConversionScreen;