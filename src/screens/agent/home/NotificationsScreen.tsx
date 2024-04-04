import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

import { COLORS, SIZES, FONTS } from '../../../constants';

import { MessageListItem } from "../../../components/MessageListItem";
import ErrorSheet from "../../../components/ErrorSheet";
import ContentSheet from "../../../components/ContentSheet";
import axios from 'axios';

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnLoadAgentMessages, MessageModel, OnReadAgentMessage } from '../../../redux';

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

interface NotificationsScreenProps {
  userReducer: UserState;
  OnLoadAgentMessages: Function;
  OnReadAgentMessage: Function;
}

const _NotificationsScreen: React.FC<NotificationsScreenProps> = (props) => {
  const { userReducer, OnLoadAgentMessages, OnReadAgentMessage } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState<MessageModel>();
  const [hasError, setHasError] = useState(false);
  const [messages, setMessages] = useState<Array<MessageModel>>([]);
  const [showContent, setShowContent] = useState(false);

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
        const res = await OnLoadAgentMessages()

        if (res.error) {
          setLoading(false);
          setError('Unable to load messages');
          setHasError(true);
          return;
        } else {
          if (!mounted) {
            return;
          }
          setMessages(res.messages);
          setLoading(false);
          return;
        }
      } catch (error) {
        setLoading(false);
        setError('Unable to load notifications');
        setHasError(true);
        return;
      }


    })();
    return () => {
      source.cancel();
      mounted = false;
    };
  }, []);

  const showMessage = async (id) => {
    try {
      setLoading(true);
      let currentItem = messages.find((item) => item._id === id);
      if (currentItem) {
        setActiveItem(currentItem);
        setShowContent(true);
      }
      OnReadAgentMessage(id, currentItem?.type)
    } catch (error) {
      setLoading(false);
      setError("Error kindly retry");
      setHasError(true);
    }
  };

  const MessageContent = () => {
    if (activeItem) {
      return (
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 12 }}>
          <Text style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}>Notification</Text>
          <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Date
              </Text>
              <Text style={styles.transactionRecordRight}>{new Date(activeItem.createdAt).toUTCString()}</Text>
            </View>

            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Sender
              </Text>
              <Text style={{ ...styles.transactionRecordRight, fontFamily: FONTS.semiBold, color: COLORS.pallete_deep }}>{activeItem.sender || 'Doctor'}</Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>
                Message
              </Text>
              {activeItem.title ?<Text style={{ ...styles.transactionRecordRight }}>{activeItem.title}: {activeItem.message}</Text>
              :<Text style={{ ...styles.transactionRecordRight }}>{activeItem.message}</Text>}
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
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
          <MessagesList messages={messages} viewMessage={showMessage} />
          {<ContentSheet content={<MessageContent />} open={showContent} closed={closeContent} />}
          <ErrorSheet error={error} open={hasError} closed={clearError} />
      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};


const MessagesList = ({ messages, viewMessage }) => {
  return (
    <View style={{  paddingTop: 30,
      paddingBottom: 30,
      marginBottom: 20,
      paddingHorizontal: 18,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start', }}>
        <View style={{ width: '100%', marginTop: 0 }}>
          {
            messages.map((item: MessageModel) => (
              <MessageListItem
                message={item.message}
                date={item.createdAt}
                sender={item.sender}
                title={item.title}
                read={item.read}
                type={item.type}
                backgroundColor={COLORS.pallete_white}
                tint={COLORS.pallete_cream}
                color={COLORS.dark}
                loading={false}
                key={item._id}
                id={item._id}
                onTap={viewMessage}
              />
            ))
          }
        </View>
    </View>
  );

};

const styles = StyleSheet.create({
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
});

const NotificationsScreen = connect(mapToStateProps, { OnLoadAgentMessages, OnReadAgentMessage })(_NotificationsScreen);
export default NotificationsScreen;