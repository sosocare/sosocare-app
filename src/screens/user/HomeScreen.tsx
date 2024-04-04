import { View, Text, ScrollView, SafeAreaView, StyleSheet, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../constants';

import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import NoticeSheet from "../../components/NoticeSheet";

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../navigation/user/types";

import { connect } from 'react-redux';
import { ApplicationState, UserState, WalletState, InsuranceState, LocationModel, InsuranceModel } from '../../redux';
import { formatCurrency } from "react-native-format-currency";

import {
  NativeBaseProvider,
  extendTheme
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

interface HomeScreenProps {
  userReducer: UserState;
  walletReducer: WalletState;
  insuranceReducer: InsuranceState;
}

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const _HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const { userReducer, walletReducer, insuranceReducer } = props;
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [insurance, setInsurance] = useState<InsuranceModel>();

  const clearError = () => {
    setHasError(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
    navigation.navigate('SetLocation');
  };
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) {
          return;
        }
        setLoading(true);
        let existingUser = userReducer.user;
        let wallet = walletReducer.wallet;
        let insurance = insuranceReducer.insurance;
        if (!mounted) {
          return;
        }
        setFirstName(existingUser.firstName);
        setInsurance(insurance);
        const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: wallet.balance / 100, code: "USD" });
        setCashBalance(valueFormattedWithoutSymbol);
        setTotalWeight(wallet.total_weight / 1000);
        let location: LocationModel = userReducer.location;
        if (!location.address_state || !location.address_city) {
          setNoticeMessage("Kindly proceed to set your location to receive insurance and agent services close to you");
          setHasNotice(true);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message);
        setHasError(true);
        return;
      }

    })();
    return () => {
      mounted = false;
    };
  }, [reload]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      setRefreshing(true);
      setReload(prev => !prev);
      wait(2000).then(() => setRefreshing(false));
    })();

    return () => {
      mounted = false;
    };

  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <View style={styles.container}>
          <View style={{ width: '100%', marginVertical: 30 }}>
            <Text style={{ fontSize: SIZES.large, fontFamily: FONTS.semiBold, color: COLORS.dark }}>Welcome back {firstName}</Text>
          </View>
          <InsuranceDetails insurance={insurance} onNavigate={() => navigation.navigate('InsuranceStack')} />
          <WalletBalance cashBalance={cashBalance} total_weight={totalWeight} onNavigate={() => navigation.navigate('WalletStack')} />
          <View style={{ width: '100%', marginBottom: 10, }}>
            <ButtonWithTitle
              title='Supported Hospitals'
              backgroundColor={COLORS.pallete_deep}
              color={'white'}
              onTap={() => navigation.navigate('FindHospitals')}
              loading={false}
              width={'100%'}
            />
          </View>
          <View style={{ width: '100%' }}>
            <ButtonWithTitle
              title='Supported Pharmacies'
              backgroundColor={COLORS.pallete_deep}
              color={'white'}
              onTap={() => navigation.navigate('FindPharmacies')}
              loading={false}
              width={'100%'}
            />
          </View>
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
        </View>

      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>

  );
};

interface DetailsProps {
  insurance: InsuranceModel | undefined | null;
  onNavigate: Function;
}
const InsuranceDetails: React.FC<DetailsProps> = ({ insurance, onNavigate }) => {
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_deep }}>
      <Text style={styles.insuranceHeading}>Insurance status</Text>
      {insurance && insurance.status === "active"
        ? <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
          <Text style={{...styles.insurancePlan, color: COLORS.pallete_cream}}>{insurance.plan}</Text>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white, marginRight: 3 }}>Insurance Code:</Text>
            <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white }}>{insurance.insurance_provider_id}</Text>
          </View>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.white, marginRight: 3 }}>Expires:</Text>
            <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.white }}>{new Date(insurance.expiry_date).toDateString()}</Text>
          </View>
          <View style={{ width: '100%', marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonWithTitle
              title='Manage'
              backgroundColor='transparent'
              noBg={false}
              size='sm'
              color='white'
              loading={false}
              onTap={onNavigate}
              width={'100%'}
              bordered
            />
          </View>
        </View>
        : insurance && insurance.status === "enrolled" ?
        <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
            <Text style={{ ...styles.insurancePlan, color: COLORS.pallete_cream }}>{insurance.plan}</Text>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white, marginRight: 3 }}>Status:</Text>
              <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white }}>Pending confirmation</Text>
            </View>
          </View>
        : <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
          <Text style={{ width: '100%', textAlign: 'center', fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.pallete_cream }}>
            No active Insurance subscriptions
          </Text>
          <View style={{ width: '100%', marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonWithTitle
              title='Buy Insurance'
              backgroundColor='transparent'
              noBg={false}
              size='sm'
              color='white'
              loading={false}
              onTap={onNavigate}
              width={'100%'}
              bordered
            />
          </View>

        </View>
      }
    </View>
  );
};
const WalletBalance = ({ onNavigate, cashBalance, total_weight }) => {
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_white }}>
      <Text style={{ ...styles.insuranceHeading, color: '#666666' }}>Wallet Balance</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, color: COLORS.dark, marginBottom: 0 }}>{'\u20A6'} {cashBalance}</Text>
        </View>
        <View style={{ width: '100%', marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <ButtonWithTitle
            title='Manage'
            backgroundColor='transparent'
            noBg={false}
            size='sm'
            color={COLORS.dark}
            loading={false}
            onTap={() => onNavigate()}
            width={'100%'}
            bordered
          />
        </View>
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
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18
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
    paddingBottom: 100
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
  walletReducer: state.WalletReducer,
  insuranceReducer: state.InsuranceReducer
});

const HomeScreen = connect(mapToStateProps, {})(_HomeScreen);
export default HomeScreen;