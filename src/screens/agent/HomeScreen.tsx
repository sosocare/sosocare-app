import { View, Text, Dimensions, ScrollView, RefreshControl, Platform, SafeAreaView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../constants';

import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import { WasteLog } from "../../components/WasteLog";
import ContentSheet from "../../components/ContentSheet";
import ErrorSheet from "../../components/ErrorSheet";
import NoticeSheet from "../../components/NoticeSheet";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../navigation/agent/types";

import { connect } from 'react-redux';
import { ApplicationState, AgentState, WalletState, LocationModel, WasteLogModel, OnLoadWallet } from '../../redux';
import { formatCurrency } from "react-native-format-currency";
import Collapsible from 'react-native-collapsible';

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

interface HomeScreenProps {
  agentReducer: AgentState;
  walletReducer: WalletState;
  OnLoadWallet: Function;
}
const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const _HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const { agentReducer, walletReducer, OnLoadWallet } = props;
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
  const [totalUnit, setTotalUnit] = useState(0);
  const [wasteLogs, setWasteLogs] = useState<Array<WasteLogModel>>([]);
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<WasteLogModel>();

  const clearError = () => {
    setHasError(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
    navigation.navigate('SetLocation');
  };
  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) {
          return;
        }
        setLoading(true);
        let agent = agentReducer.agent;
        await OnLoadWallet('agent', agentReducer.agent.authToken);
        let wallet = walletReducer.wallet;
        setFirstName(agent.firstName);
        let wastelogs = walletReducer.wastelogs;
        setWasteLogs(wastelogs || []);
        let location: LocationModel = agentReducer.location;
        if (!location.address_state || !location.address_city || !location.address_state || !location.address_zipcode) {
          setNoticeMessage("Kindly proceed to set your location for SOSOCARE clients near you");
          setHasNotice(true);
        }
        const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: wallet.balance / 100, code: "USD" });
        setCashBalance(valueFormattedWithoutSymbol);
        setTotalWeight(wallet.total_weight / 1000);
        setTotalUnit(wallet.total_unit/1000)
        setLoading(false);
        return;
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

  }, [reload, walletReducer.wallet.balance]);

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
  const showWaste = async (id) => {
    try {
      setLoading(true);
      let currentItem = wasteLogs.find((item) => item._id === id);
      if (currentItem) {
        setActiveItem(currentItem);
        setShowContent(true);
      }
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };

  const WasteContent = () => {
    if (activeItem) {
      let price = 0;
      let imageName = 'batteries';
      let title = activeItem.name;
      if (title === 'Batteries') {
        price = 2700;
      } else if (title === 'HDPE') {
        price = 3000;
        imageName = 'hdpe';
      } else if (title === 'Carton') {
        price = 1800;
        imageName = 'carton';
      } else if (title === 'Copper') {
        price = 4000;
      } else if (title === 'Tin') {
        price = 5000;
        imageName = 'tin';
      } else if (title === 'PET') {
        price = 1500;
        imageName = 'pet';
      } else if (title === 'Aluminium') {
        price = 5500;
      } else if (title === 'Steel') {
        price = 6000;
        imageName = 'steel';
      } else if (title === 'Paper') {
        price = 1500;
        imageName = 'paper';
      } else if (title === 'SachetWater') {
        price = 1000;
        imageName = 'sachet_water';
      } else if (title === 'White Nylon') {
        price = 2500;
        imageName = 'white_nylon';
      } else if (title === 'Metal') {
        price = 3000;
        imageName = 'metal';
      }
      const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: ((price / 100) * 100) / 100, code: "USD" });
      let formattedAmount = valueFormattedWithoutSymbol;
      const wasteImage = WasteImageService.GetImage(imageName);
      return (
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
          <Text style={{ ...styles.wasteHeading, color: COLORS.pallete_deep, marginTop: 10 }}>Item Details</Text>
          <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center', marginTop: 20 }}>
            <Image style={{ width: 150, height: 150, resizeMode: 'contain', borderRadius: 75, marginBottom: 16 }} source={wasteImage} />
            <View style={styles.wasteRecord}>
              <Text style={styles.wasteRecordLeft}>
                Name
              </Text>
              <Text style={styles.wasteRecordRight}>{title}</Text>
            </View>
            <View style={styles.wasteRecord}>
              <Text style={styles.wasteRecordLeft}>
                Unit price
              </Text>
              {activeItem.name === 'Batteries'
                ? <Text style={{ ...styles.wasteRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{'\u20A6'}{formattedAmount}/Unit</Text>
                : <Text style={{ ...styles.wasteRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{'\u20A6'}{formattedAmount}/Kg</Text>
              }
            </View>
          </View>
        </View>
      );
    }
    return (<></>);

  };

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
            <Text style={{ fontSize: SIZES.large, fontFamily: FONTS.semiBold, color: COLORS.dark }}>Welcome back Agent {firstName}</Text>
          </View>
          <CashBalance balance={cashBalance} onFund={() => navigation.navigate('FundCash')} onWithdraw={() => navigation.navigate('Withdraw')} />
          <WasteBalance showWaste={showWaste} logs={wasteLogs} totalUnit={totalUnit} totalWeight={totalWeight} />
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
          <ErrorSheet error={error} open={hasError} closed={clearError} />
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
          {<ContentSheet content={<WasteContent />} open={showContent} closed={closeContent} />}
        </View>

      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>

  );
};
const WasteBalance = ({ totalWeight,totalUnit, logs, showWaste }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => {
    if (collapsed) setCollapsed(false);
    else setCollapsed(true);
  };
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_white }}>
      <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Collected Materials</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalWeight} Kg</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalUnit} Units</Text>
        </View>
        {/* <Collapsible collapsed={collapsed} collapsedHeight={200}> */}
          <View style={{ width: '100%', marginTop: 20 }}>
            {
              logs.map((item: WasteLogModel) => (
                <WasteLog
                  title={item.name}
                  balance={item.agent_available_weight / 1000 || 0}
                  backgroundColor={COLORS.white}
                  tint={COLORS.fade}
                  color={COLORS.pallete_deep}
                  loading={false}
                  key={item._id}
                  id={item._id}
                  onTap={showWaste}
                />
              ))
            }


          </View>
        {/* </Collapsible> */}
        {/* <TouchableOpacity onPress={toggleCollapsed} style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
          {collapsed
            ? <MaterialIcons name='chevron-double-down' style={{ fontSize: 20 }} color={COLORS.dark} />
            : <MaterialIcons name='chevron-double-up' style={{ fontSize: 20 }} color={COLORS.dark} />}
        </TouchableOpacity> */}
      </View>
    </View>
  );
};
const CashBalance = ({ balance, onFund, onWithdraw }) => {
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_deep }}>
      <Text style={{ ...styles.insuranceHeading, color: '#eeeeee' }}>Wallet Balance</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', marginBottom: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, width: '100%', marginBottom: 20, color: COLORS.white, textAlign: 'center' }}>{'\u20A6'} {balance}</Text>
          <Text style={{ fontSize: SIZES.small, fontFamily: FONTS.medium, color: COLORS.pallete_cream }}>This is your wallet balance with which you will carry out all your transactions with clients.</Text>
        </View>
      </View>
      <View style={{ width: '100%', marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ButtonWithTitle
          title='Fund'
          backgroundColor='transparent'
          noBg={false}
          size='sm'
          color={COLORS.white}
          loading={false}
          onTap={() => onFund()}
          width={'48%'}
          bordered
        />
        <ButtonWithTitle
          title='Withdraw'
          backgroundColor='transparent'
          noBg={false}
          size='sm'
          color={COLORS.white}
          loading={false}
          onTap={() => onWithdraw()}
          width={'48%'}
          bordered
        />
      </View>
    </View>
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
      img: require('../../../assets/wastes/batteries.png')
    },
    {
      name: 'metal',
      img: require('../../../assets/wastes/metal.png')
    },
    {
      name: 'hdpe',
      img: require('../../../assets/wastes/hdpe.png')
    },
    {
      name: 'tin',
      img: require('../../../assets/wastes/tin.png')
    },
    {
      name: 'carton',
      img: require('../../../assets/wastes/carton.png')
    },
    {
      name: 'sachet_water',
      img: require('../../../assets/wastes/sachet_water.png')
    },
    {
      name: 'white_nylon',
      img: require('../../../assets/wastes/white_nylon.png')
    },
    {
      name: 'paper',
      img: require('../../../assets/wastes/paper.png')
    },
    {
      name: 'steel',
      img: require('../../../assets/wastes/steel.png')
    },
    {
      name: 'pet',
      img: require('../../../assets/wastes/pet.png')
    },
  ];
  static GetImage = (name: string) => {
    const found = WasteImageService.images.find(e => e.name === name);
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
  wasteHeading: {
    fontSize: SIZES.large,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18,
    width: '100%'
  },
  wasteRecord: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.fade,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  wasteRecordLeft: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.pallete_deep,
    flex: 2,
  },
  wasteRecordRight: {
    flex: 5,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    flexShrink: 1
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
  agentReducer: state.AgentReducer,
  walletReducer: state.WalletReducer,
});

const HomeScreen = connect(mapToStateProps, { OnLoadWallet })(_HomeScreen);
export default HomeScreen;