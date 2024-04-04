import { View, Text, ScrollView, SafeAreaView, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../constants';
import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import { TextField } from "../../components/TextField";
import { AgentListItem } from "../../components/AgentListItem";
import ErrorSheet from "../../components/ErrorSheet";
import NoticeSheet from "../../components/NoticeSheet";
import ContentSheet from "../../components/ContentSheet";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useNavigation } from "@react-navigation/native";
import { ClientScreenNavigationProp } from "../../navigation/agent/types";

import { connect } from 'react-redux';
import { ApplicationState, AgentState, OnLoadClients, CustomUserModel } from '../../redux';
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

const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};


interface ClientsScreenProps {
  agentReducer: AgentState;
  OnLoadClients: Function;
}
const _ClientsScreen: React.FC<ClientsScreenProps> = (props) => {
  const { agentReducer, OnLoadClients } = props;
  const navigation = useNavigation<ClientScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);
  const [clients, setClients] = useState<Array<CustomUserModel>>([]);
  const [displayClients, setDisplayClients] = useState<Array<CustomUserModel>>([]);
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<CustomUserModel>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setLoading(true);
        const res = await OnLoadClients();

        if (res.error) {
          setLoading(false);
          setError('Unable to clients');
          setHasError(true);
          return;
        } else {
          if (!mounted) {
            return;
          }
          setClients(res.clients);
          setDisplayClients(res.clients);
          setLoading(false);
          return;
        }

      } catch (error) {
        setLoading(false);
        setError('Unable to load clients');
        setHasError(true);
        return;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);


  const closeContent = () => {
    setShowContent(false);
    setLoading(false);
  };

  const clearError = () => {
    setHasError(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
  };

  const openClientDetails = async () => {
    if (activeItem) {
      setShowContent(false);
      navigation.navigate('ClientDetails', {
        client: activeItem
      });
    }
  };
  const showClient = async (id) => {
    try {
      setLoading(true);
      let currentItem = clients.find((item) => item._id == id);
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

  const ClientContent = () => {
    if (activeItem) {
      return (
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
          <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>User Details</Text>
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
                  Activated
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return (<></>);

  };
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      let group = clients;
      if (searchText && searchText.trim() !== "") {
        let results: Array<CustomUserModel> = [];
        for (let j = 0; j < group.length; j++) {
          if (searchingFunc(group[j], searchText)) {
            results.push(group[j]);
          }
        }
        setDisplayClients(results);
      } else {
        setDisplayClients(clients);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchText]);


  const searchingFunc = (obj, value) => {
    for (let key in obj) {
      if (
        !Number.isInteger(obj[key]) &&
        !(typeof obj[key] === "object") &&
        !(typeof obj[key] === "boolean")
      ) {
        if (obj[key].toLowerCase().indexOf(value.toLowerCase()) != -1) {
          return true;
        }
      }
    }
    return false;
  };
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
      <View style={{ ...styles.container, justifyContent: 'center' }}>
        <View style={{ width: '100%', justifyContent: 'center', paddingBottom: 0, borderBottomColor: COLORS.gray, borderBottomWidth: .5 }}>
          <View style={{ width: '100%' }}>
            <TextField
              handleChange={(val) => setSearchText(val)}
              label='Search clients'
              icon={'search'}
              isDisabled={loading}
              hasIcon
            />
          </View>

        </View>
        <View style={{ flex: 1, width: '100%', paddingTop: 10, justifyContent: 'center', alignItems: 'center' }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            style={{ flex: 1, width: '100%' }}>
            {
              displayClients.length > 0 ?
                displayClients.map((item: CustomUserModel) => (
                  <AgentListItem
                    backgroundColor={COLORS.pallete_white}
                    tint={COLORS.fade}
                    color={COLORS.dark}
                    key={item._id}
                    id={item._id}
                    onTap={showClient}
                    description={`${item.first_name} ${item.last_name}`}
                    address={`${item.address_street}, ${item.address_city}, ${item.address_state}`}
                  />
                ))
                :
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, flex: 1, width: '100%', fontFamily: FONTS.medium, color: COLORS.pallete_deep, textAlign: 'center' }}>No Client Found</Text>
                </View>
            }
          </ScrollView>
        </View>
        <View style={{ width: '100%', justifyContent: 'center', paddingTop: 10, marginBottom: 6 }}>
          <ButtonWithTitle
            title='Serve External Client'
            backgroundColor={COLORS.pallete_cream}
            color={COLORS.pallete_deep}
            loading={loading}
            onTap={() => navigation.navigate('ExternalClient')}
            width={'100%'}
            size={'sm'}
          />
        </View>
        <View style={{ width: '100%', justifyContent: 'center', paddingTop: 0, marginBottom: 60 }}>
          <ButtonWithTitle
            title='Register New Client'
            backgroundColor={COLORS.pallete_deep}
            color={COLORS.pallete_white}
            loading={loading}
            onTap={() => navigation.navigate('NewClient')}
            width={'100%'}
            size={'sm'}
          />
        </View>
        {<ContentSheet content={<ClientContent />} hasSecondAction={true} secondActionTitle={"View Client"} secondAction={() => openClientDetails()} open={showContent} closed={closeContent} />}
        <ErrorSheet error={error} open={hasError} closed={clearError} />
      </View>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
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
  agentReducer: state.AgentReducer
});

const ClientsScreen = connect(mapToStateProps, { OnLoadClients })(_ClientsScreen);
export default ClientsScreen;