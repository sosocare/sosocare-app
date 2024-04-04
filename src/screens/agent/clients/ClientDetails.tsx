import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Collapsible from 'react-native-collapsible';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ClientDetailsScreenRouteProp, ClientScreenNavigationProp } from "../../../navigation/agent/types";
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { formatCurrency } from "react-native-format-currency";

import { COLORS, FONTS, SIZES } from '../../../constants';

import NoticeSheet from "../../../components/NoticeSheet";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import { WasteLog } from "../../../components/WasteLog";
import ContentSheet from "../../../components/ContentSheet";
import SelectField from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";

import { connect } from 'react-redux';
import { ApplicationState, AgentState, InsuranceModel, OnLoadAgentClient, WasteLogModel, OnAgentCancelInsurance, OnCancelInsurance } from '../../../redux';
import {
  NativeBaseProvider,
  extendTheme,
  Image,
  Skeleton
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

interface ClientDetailsScreenProps {
  agentReducer: AgentState;
  OnLoadAgentClient: Function;
  OnAgentCancelInsurance: Function;
}

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const _ClientDetails: React.FC<ClientDetailsScreenProps> = (props) => {
  const { agentReducer, OnLoadAgentClient, OnAgentCancelInsurance } = props;
  const route = useRoute<ClientDetailsScreenRouteProp>();
  const { client } = route.params;
  const navigation = useNavigation<ClientScreenNavigationProp>();

  const [inLoading, setInLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalUnit, setTotalUnit] = useState(0);
  const [insurance, setInsurance] = useState<InsuranceModel>();
  const [wasteLogs, setWasteLogs] = useState<Array<WasteLogModel>>([]);
  const [showContent, setShowContent] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [activeItem, setActiveItem] = useState<WasteLogModel>();
  const [imageLoading, setImageLoading] = useState(false);

  const cancelInsurance = async () => {
    // do sth
    await OnAgentCancelInsurance(insurance?._id, client._id);
    setReload(prev => !prev);
  };

  const closePayout = () => {
    setShowPayout(false);
    setLoading(false);
  };
  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };

  const handleNotice = () => {
    setHasNotice(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) {
          return;
        }

        setInLoading(true);
        let res = await OnLoadAgentClient(client._id);
        if (res.success) {
          if (!mounted) {
            return;
          }
          setInsurance(res.insurance);
          const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: res.wallet.balance / 100, code: "USD" });
          setCashBalance(valueFormattedWithoutSymbol);
          setTotalWeight(res.total_weight / 1000);
          setTotalUnit(res.total_unit / 1000);
          setWasteLogs(res.wastelogs);
          if (client.image) setImageLoading(true);
          setInLoading(false);
        } else if (res.error) {
          setInLoading(false);
          setError(res.error);
          setHasError(true);
        }
      } catch (error) {
        setInLoading(false);
        setError(error.message);
        setHasError(true);
        return;
      }

    })();
    return () => {
      mounted = false;
    };
  }, [reload]);

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
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };
  const addWaste = async () => {
    try {
      if (activeItem) {
        setShowContent(false);
        navigation.navigate("AddWaste", { client, material: activeItem });
      }
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };
  const PayoutContent = () => {
    return (
      <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
        <Text style={{ ...styles.wasteHeading, color: COLORS.pallete_deep, marginTop: 10 }}>Select Method to Pay Client</Text>
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center', marginTop: 20 }}>
          <View style={{ width: '100%', flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonWithTitle
              title={'Pay Cash'}
              backgroundColor={COLORS.primary}
              noBg={false}
              color={COLORS.white}
              loading={loading || inLoading}
              onTap={() => {
                setShowPayout(false);
                navigation.navigate('PayCash', { client });
              }}
              width={'100%'}
              bordered
            />
          </View>
          <View style={{ width: '100%', flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonWithTitle
              title={'Pay Online'}
              backgroundColor={COLORS.primary}
              noBg={false}
              color={COLORS.white}
              loading={loading || inLoading}
              onTap={() => {
                setShowPayout(false);
                navigation.navigate('PayClient', { client });
              }}
              width={'100%'}
              bordered
            />
          </View>
        </View>
      </View>
    );
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
            <Image alt={title} style={{ width: 150, height: 150, resizeMode: 'contain', borderRadius: 75, marginBottom: 16 }} source={wasteImage} />
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
              <Text style={{ ...styles.wasteRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{'\u20A6'}{formattedAmount}/Kg</Text>
            </View>
          </View>
        </View>
      );
    }
    return (<></>);

  };
  if (inLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'white', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }
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
          <View style={{ width: '100%', marginBottom: 30, marginTop: 10, paddingBottom: 4, borderBottomColor: COLORS.fade, borderBottomWidth: 1 }}>
            <View style={{ flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderColor: COLORS.primary,
                borderWidth: 2,
                padding: 3,
                marginBottom: 8,
                position: 'relative'
              }}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {loading
                    ? <Skeleton rounded='full' w={'full'} h={'full'} />
                    : !loading && client.image
                      ? <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', width: "100%", height: '100%' }}>
                        <Image alt='Client Image'
                          onLoad={() => setImageLoading(false)} source={{ uri: client.image }}
                          style={{
                            width: '100%',
                            height: '100%',
                            flex: 1,
                            resizeMode: 'cover',
                            borderRadius: 40,
                          }}
                        />
                        <Skeleton position={'absolute'} top={0} zIndex={5} display={imageLoading ? 'flex' : 'none'} rounded='full' w={'full'} h={'full'} />
                      </View>
                      : <Image alt='Client Image' source={require("../../../../assets/blank.png")}
                        style={{
                          width: '100%',
                          height: '100%',
                          flex: 1,
                          resizeMode: 'cover',
                          borderRadius: 40,
                        }}
                      />
                  }

                </View>
              </View>
              <View style={{ justifyContent: 'center', marginLeft: 8, alignItems: 'flex-start' }}>
                <Text style={{ textAlign: 'center', fontSize: SIZES.extraLarge, fontFamily: FONTS.semiBold, color: COLORS.dark }}>{client.first_name} {client.last_name}</Text>
                <Text style={{ textAlign: 'center', fontSize: SIZES.medium, fontFamily: FONTS.bold, color: COLORS.primary }}>{client.soso_id}</Text>
              </View>
            </View>
          </View>
          <InsuranceDetails insurance={insurance} onNavigate={() => navigation.navigate('BuyInsurance', { client })} cancelInsurance={() => cancelInsurance()} onManage={() => navigation.navigate("ClientInsurance", { client })} />
          <CashBalance balance={cashBalance} onFund={() => navigation.navigate('FundCash', { client })} onWithdraw={() => setShowPayout(true)} />
          <WasteBalance showWaste={showWaste} logs={wasteLogs} totalWeight={totalWeight} totalUnit={totalUnit} />
          <NoticeSheet message={noticeMessage} open={hasNotice} closed={handleNotice} />
          {<ContentSheet content={<WasteContent />} hasSecondAction={true} secondActionTitle={"Add"} secondAction={() => addWaste()} open={showContent} closed={closeContent} />}
          {<ContentSheet content={<PayoutContent />} open={showPayout} closed={closePayout} />}
        </View>

      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};

interface DetailsProps {
  insurance: InsuranceModel | undefined | null;
  onNavigate: Function;
  onManage: Function;
  cancelInsurance: Function;
}
const InsuranceDetails: React.FC<DetailsProps> = ({ insurance, onNavigate, onManage, cancelInsurance }) => {
  const [confirmMessage, setConfirmMessage] = useState('');
  const [hasConfirm, setHasConfirm] = useState(false);

  const cancelPlan = () => {
    setConfirmMessage(`Are you sure you want to cancel your current ${insurance?.plan}?`);
    setHasConfirm(true);
  };

  const handleConfirm = async () => {
    setHasConfirm(false);
    await cancelInsurance();
  };

  return (
    <View style={{ width: '100%', flexDirection: 'column' }}>
      <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_deep }}>
        <Text style={styles.insuranceHeading}>Insurance status</Text>
        {insurance && insurance.status === "active"
          ? <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
            <Text style={{ ...styles.insurancePlan, color: COLORS.pallete_cream }}>{insurance.plan}</Text>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white, marginRight: 3 }}>Insurance Code:</Text>
              <Text style={{ fontSize: 16, flexShrink: 1, fontFamily: FONTS.medium, color: COLORS.white }}>{insurance.insurance_provider_id}</Text>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.white, marginRight: 3 }}>Expires:</Text>
              <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.white }}>{new Date(insurance.expiry_date).toDateString()}</Text>
            </View>
          </View>
          :insurance && insurance.status === "enrolled" ?
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

        <NoticeSheet message={confirmMessage} open={hasConfirm} closed={() => handleConfirm()} />
      </View>
      {insurance && <View style={{ width: '100%', flexDirection: 'column' }}>
        {insurance?._id && insurance?.pharmacy?.pharmacyName
          ? <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.white, marginBottom: 10, marginTop: 20, }}>
            <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Primary Pharmacy</Text>
            <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
              <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                <View style={styles.transactionRecord}>
                  <Text style={styles.transactionRecordLeft}>
                    Name
                  </Text>
                  <Text style={styles.transactionRecordRight}>{insurance?.pharmacy.pharmacyName}</Text>
                </View>
                <View style={styles.transactionRecord}>
                  <Text style={styles.transactionRecordLeft}>
                    Address
                  </Text>
                  <Text style={styles.transactionRecordRight}>{insurance?.pharmacy.address}</Text>
                </View>
                <View style={styles.transactionRecord}>
                  <Text style={styles.transactionRecordLeft}>
                    State
                  </Text>
                  <Text style={styles.transactionRecordRight}>{insurance?.pharmacy.state}</Text>
                </View>
                <View style={styles.transactionRecord}>
                  <Text style={styles.transactionRecordLeft}>
                    LGA
                  </Text>
                  <Text style={styles.transactionRecordRight}>{insurance?.pharmacy.lga}</Text>
                </View>
                <View style={{ ...styles.transactionRecord, flexDirection: 'column' }}>
                  <View style={{ width: '100%', marginBottom: 8, marginTop: 18 }}>
                    <ButtonWithTitle
                      title='Change Pharmacy'
                      backgroundColor='transparent'
                      noBg={false}
                      size='sm'
                      color={COLORS.dark}
                      loading={false}
                      onTap={() => onManage()}
                      width={'100%'}
                      bordered
                    />
                  </View>
                  <View style={{ width: '100%' }}>
                    <ButtonWithTitle
                      title='Cancel Subscription'
                      backgroundColor='transparent'
                      noBg={false}
                      size='sm'
                      color={COLORS.negative}
                      loading={false}
                      onTap={() => cancelPlan()}
                      width={'100%'}
                      bordered
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          : insurance?.hospital?.name ?
            <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.white, marginBottom: 30 }}>
              <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Primary Hospital</Text>
              <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      Name
                    </Text>
                    <Text style={styles.transactionRecordRight}>{insurance?.hospital.name}</Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      Address
                    </Text>
                    <Text style={styles.transactionRecordRight}>{insurance?.hospital.address}</Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      State
                    </Text>
                    <Text style={styles.transactionRecordRight}>{insurance?.hospital.state}</Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      LGA
                    </Text>
                    <Text style={styles.transactionRecordRight}>{insurance?.hospital.localGovt}</Text>
                  </View>
                  <View style={{ ...styles.transactionRecord, flexDirection: 'column' }}>
                    <View style={{ width: '100%', marginBottom: 8, marginTop: 18 }}>
                      <ButtonWithTitle
                        title='Change Hospital'
                        backgroundColor='transparent'
                        noBg={false}
                        size='sm'
                        color={COLORS.dark}
                        loading={false}
                        onTap={() => onManage()}
                        width={'100%'}
                        bordered
                      />
                    </View>
                    <View style={{ width: '100%' }}>
                      <ButtonWithTitle
                        title='Cancel Subscription'
                        backgroundColor='transparent'
                        noBg={false}
                        size='sm'
                        color={COLORS.negative}
                        loading={false}
                        onTap={() => cancelPlan()}
                        width={'100%'}
                        bordered
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            : <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.white, marginBottom: 30 }}>
              <Text style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}>Primary Care Center</Text>
              <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      Name
                    </Text>
                    <Text style={styles.transactionRecordRight}>Not selected</Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>
                      Address
                    </Text>
                    <Text style={styles.transactionRecordRight}>Not selected</Text>
                  </View>
                  <View style={{ ...styles.transactionRecord, flexDirection: 'column' }}>
                    <View style={{ width: '100%', marginBottom: 8, marginTop: 18 }}>
                      <ButtonWithTitle
                        title='Select Care Center'
                        backgroundColor='transparent'
                        noBg={false}
                        size='sm'
                        color={COLORS.dark}
                        loading={false}
                        onTap={() => onManage()}
                        width={'100%'}
                        bordered
                      />
                    </View>
                    <View style={{ width: '100%' }}>
                      <ButtonWithTitle
                        title='Cancel Subscription'
                        backgroundColor='transparent'
                        noBg={false}
                        size='sm'
                        color={COLORS.negative}
                        loading={false}
                        onTap={() => cancelPlan()}
                        width={'100%'}
                        bordered
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
        }
      </View>}
    </View>
  );
};
const CashBalance = ({ onFund, onWithdraw, balance }) => {
  return (
    <View style={{ ...styles.insuranceContainer, borderWidth: 1, borderColor: COLORS.fade, backgroundColor: COLORS.pallete_deep }}>
      <Text style={{ ...styles.insuranceHeading, color: '#eeeeee' }}>Wallet Balance</Text>
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
            title='Payout'
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
const WasteBalance = ({ totalWeight, totalUnit, logs, showWaste }) => {
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
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalWeight} Kg</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.insurancePlan, fontSize: SIZES.extraLarge + 10, color: COLORS.dark, marginBottom: 0 }}>{totalUnit} Units</Text>
        </View>
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
    const found = WasteImageService.images.find(e => e.name === name);
    return found ? found.img : null;
  };
}

const styles = StyleSheet.create({
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
  agentReducer: state.AgentReducer
});

const ClientDetails = connect(mapToStateProps, { OnLoadAgentClient, OnAgentCancelInsurance })(_ClientDetails);
export default ClientDetails;