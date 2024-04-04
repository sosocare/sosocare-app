import { View, Text, ScrollView, SafeAreaView, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../constants';
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import { TransactionListItem } from "../../components/TransactionListItem";
import { WasteLog } from "../../components/WasteLog";
import ErrorSheet from "../../components/ErrorSheet";
import NoticeSheet from "../../components/NoticeSheet";
import ContentSheet from "../../components/ContentSheet";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useNavigation } from "@react-navigation/native";
import { WalletScreenNavigationProp } from "../../navigation/user/types";

import { connect } from 'react-redux';
import { ApplicationState, UserState, WalletState, TransactionModel, WasteLogModel } from '../../redux';
import Collapsible from 'react-native-collapsible';
import { formatCurrency } from "react-native-format-currency";
import axios from 'axios';
import { BASE_URL } from '../../utils';

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

interface WalletScreenProps {
  userReducer: UserState;
  walletReducer: WalletState;
}
const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const _WalletScreen: React.FC<WalletScreenProps> = (props) => {
  const { userReducer, walletReducer } = props;
  const navigation = useNavigation<WalletScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalUnit, setTotalUnit] = useState(0);
  const [wasteLogs, setWasteLogs] = useState<Array<WasteLogModel>>([]);
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<WasteLogModel>();

  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };
  const clearError = () => {
    setHasError(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
    navigation.navigate('FindAgent');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        let existingUser = userReducer.user;
        let wallet = walletReducer.wallet;
        let wastelogs = walletReducer.wastelogs;
        setWasteLogs(wastelogs || []);
        const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: wallet.balance / 100, code: "USD" });
        setCashBalance(valueFormattedWithoutSymbol);
        setTotalWeight(wallet.total_weight / 1000);
        setTotalUnit(wallet.total_unit / 1000);
      } catch (error) {
        return;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);

  const fundWaste = () => {
    setNoticeMessage("Proceed to find the nearest SOSOCARE agents to drop your wastes");
    setHasNotice(true);
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      setRefreshing(true);
      setReload(prev => !prev)
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
              { activeItem.name === 'Batteries'
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
      <ScrollView refreshControl={
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
          <CashBalance balance={cashBalance} onFund={() => navigation.navigate('FundCash')} onWithdraw={() => navigation.navigate('Withdraw')} />
          <WasteBalance showWaste={showWaste} logs={wasteLogs} totalWeight={totalWeight} totalUnit={totalUnit} onFund={() => fundWaste()} onConvert={() => navigation.navigate('Conversion')} />
          <LatestTransactions user={userReducer.user} onViewTransactions={() => navigation.navigate('Transactions')} />
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
          {<ContentSheet content={<WasteContent />} open={showContent} closed={closeContent} />}

        </View>

      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};

const LatestTransactions = ({ onViewTransactions, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [transactions, setTransactions] = useState<Array<TransactionModel>>();
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<TransactionModel>();

  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };

  const clearError = () => {
    setHasError(false);
    setLoading(false);
  };
  useEffect(() => {
    let mounted = true;
    const source = axios.CancelToken.source();
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get<string>(`${BASE_URL}user/transactions/latest`, {
          cancelToken: source.token,
          headers: {
            'Authorization': `Bearer ${user.authToken}`
          }
        });

        let resBody = response.data;

        if (resBody['status'] === 'error') {
          setLoading(false);
          setError('Unable to load transations');
          setHasError(true);
          return { 'error': resBody['message'] };
        } else {
          if (!mounted) {
            return;
          }
          setTransactions(resBody['transactions']);
          setLoading(false);
          return { 'success': resBody['status'] };
        }
      } catch (error) {
        setLoading(false);
        setError('Unable to load transations');
        setHasError(true);
        return;
      }

    })();
    return () => {
      source.cancel();
      mounted = false;
    };

  }, []);
  const showTransaction = async (id) => {
    if (transactions) {
      try {
        setLoading(true);
        let currentItem = transactions.find((item) => item._id === id);
        if (currentItem) {
          setActiveItem(currentItem);
          setShowContent(true);
        }
      } catch (error) {
        setLoading(false);
        setError("Error kindly retry");
        setHasError(true);
      }
    }
  };
  const TransactionContent = () => {
    if (activeItem) {
      const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: activeItem.amount / 100, code: "USD" });
      let formattedAmount = valueFormattedWithoutSymbol;
      return (
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
          <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>Transaction Details</Text>
          <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Date
              </Text>
              <Text style={styles.transactionRecordRight}>{new Date(activeItem.date).toDateString()}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Reference
              </Text>
              <Text style={styles.transactionRecordRight}>{activeItem.reference}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Category
              </Text>
              <Text style={{ ...styles.transactionRecordRight, textTransform: 'capitalize' }}>{activeItem.category}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Amount
              </Text>
              <Text style={{ ...styles.transactionRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{'\u20A6'}{formattedAmount}</Text>
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
                  activeItem.status === 'success'
                    ? { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.pallete_deep, padding: 6 }
                    : activeItem.status === 'failed'
                      ? { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.negative, padding: 6 }
                      : { color: COLORS.pallete_white, justifyContent: 'center', alignItems: 'center', borderRadius: 10, fontSize: SIZES.base, backgroundColor: COLORS.dark, padding: 6 }
                ]}
                >
                  {activeItem.status}
                </Text>
              </View>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Description
              </Text>
              <Text style={{ ...styles.transactionRecordRight }}>{activeItem.description}</Text>
            </View>
          </View>
        </View>
      );
    }
    return (<></>);

  };
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.white, marginBottom: 100 }}>
      <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Recent Transactions</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', marginTop: 0 }}>
          {
            transactions && transactions.map((item: TransactionModel) => (
              <TransactionListItem
                detail={item.category}
                amount={item.amount}
                description={item.description}
                backgroundColor={COLORS.pallete_white}
                tint={COLORS.white}
                color={COLORS.dark}
                loading={false}
                key={item._id}
                id={item._id}
                onTap={showTransaction}
              />
            ))
          }

        </View>
        {<ContentSheet content={<TransactionContent />} open={showContent} closed={closeContent} />}
        <View style={{ marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ButtonWithTitle
            title='View All'
            backgroundColor='transparent'
            noBg={false}
            size='sm'
            color={COLORS.dark}
            loading={false}
            onTap={() => onViewTransactions()}
            width={'100%'}
            bordered
          />
        </View>
      </View>
      <ErrorSheet error={error} open={hasError} closed={clearError} />
    </View>
  );
};
const WasteBalance = ({ onFund, totalUnit, totalWeight, logs, showWaste }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => {
    if (collapsed) setCollapsed(false);
    else setCollapsed(true);
  };
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_white }}>
      <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Recyclables History</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 6 }}>{totalWeight} Kg</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalUnit} Units</Text>
        </View>
        <Collapsible collapsed={collapsed} collapsedHeight={200}>
          <View style={{ width: '100%', marginTop: 20 }}>
            {
              logs.map((item: WasteLogModel) => (
                <WasteLog
                  title={item.name}
                  balance={item.converted_weight / 1000 || 0}
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
        </Collapsible>
        <TouchableOpacity onPress={toggleCollapsed} style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
          {collapsed
            ? <MaterialIcons name='chevron-double-down' style={{ fontSize: 20 }} color={COLORS.dark} />
            : <MaterialIcons name='chevron-double-up' style={{ fontSize: 20 }} color={COLORS.dark} />}
        </TouchableOpacity>

        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ButtonWithTitle
            title='Add More'
            backgroundColor='transparent'
            noBg={false}
            size='sm'
            color={COLORS.dark}
            loading={false}
            onTap={() => onFund()}
            width={'100%'}
            bordered
          />
        </View>
      </View>
    </View>
  );
};
const CashBalance = ({ onFund, onWithdraw, balance }) => {
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_deep }}>
      <Text style={{ ...styles.insuranceHeading, color: '#eeeeee' }}>Cash Balance</Text>
      <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.white, marginBottom: 0 }}>{'\u20A6'} {balance}</Text>
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

const WalletScreen = connect(mapToStateProps, {})(_WalletScreen);
export default WalletScreen;