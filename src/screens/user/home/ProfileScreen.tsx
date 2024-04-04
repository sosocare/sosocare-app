import { View, Text, Pressable, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';

import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";
import { ListItem } from "../../../components/ListItem";
import Ionicons from '@expo/vector-icons/Ionicons';

import { COLORS, FONTS, SIZES } from '../../../constants';
import { BASE_URL } from '../../../utils';

import { connect } from 'react-redux';
import { ApplicationState, UserState, OnUserLogout, OnUserUpdateProfileImage } from '../../../redux';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { useNavigation } from "@react-navigation/native";
import { HomeScreenNavigationProp } from "../../../navigation/user/types";
import { AuthContext } from "../../../contexts/AuthContext";
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

interface ProfileScreenProps {
  userReducer: UserState;
  OnUserLogout: Function;
  OnUserUpdateProfileImage: Function;
}
const _ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
  const { userReducer, OnUserLogout, OnUserUpdateProfileImage } = props;
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [imageUrl, setImageUrl] = useState('');

  const { logout } = useContext(AuthContext);
  const logUserOut = async () => {
    try {
      let res = await OnUserLogout();
      if (res.error) {
        setError(res.error);
        setHasError(true);
      }
      if (res.success) {
        logout();
      }

    } catch (e) {
      setError(e.message);
      setHasError(true);
    }
    logout();
  };

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const clearError = () => {
    setHasError(false);
  };
  const handleSuccess = () => {
    setIsSuccess(false);
  };

  const openImagePickerAsync = async () => {

    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }
      let pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (pickerResult.canceled) {
        console.log("Canceled")
        return;
      }
      setLoading(true);
      let token = userReducer.user.authToken;
      if (!token) {
        return;
      }
      if (!pickerResult.canceled) {
        let localUri = pickerResult.assets[0].uri;
        console.log(pickerResult.assets[0].uri, pickerResult)
        let filename = localUri.split('/').pop();
        let fileType = localUri.substring(localUri.lastIndexOf(":") + 1, localUri.lastIndexOf(";")).split("/").pop();

        const res = await FileSystem.uploadAsync(`${BASE_URL}user/upload-profile-image`, localUri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'image',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        let out = JSON.parse(res.body);
        if (out.status === 'error') {
          setError(out.message);
          setLoading(false);
          setHasError(true);
        }
        if (out.status === 'success') {
          setLoading(false);
          setSuccessMessage("Image uploaded");
          setImageUrl(out.image);
          setImageLoading(true);
          await OnUserUpdateProfileImage(out.image);
          setIsSuccess(true);
        }
      }
    } catch (error) {
      if (error.message === "JSON Parse error: Unrecognized token '<'") {
        setError("File too large");
        setHasError(true);
        setLoading(false);
      } else {
        setError(error.message);
        setHasError(true);
        setLoading(false);
      }

    }

  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setLoading(true);
        if (!mounted) {
          return;
        }
        let existingUser = userReducer.user;
        let existingImage = existingUser.image;
        setImageUrl(existingImage || '');
        setFirstName(existingUser.firstName);
        setLastName(existingUser.lastName);
        if (existingImage) setImageLoading(true);
        setLoading(false);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setLoading(false);
        return;
      }

    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: 'white' }} />
      <ScrollView style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <View style={styles.mainContainer}>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderColor: COLORS.pallete_green,
                borderWidth: 2,
                padding: 3,
                marginBottom: 8,
                position: 'relative'
              }}>
                <Pressable
                  disabled={loading || imageLoading}
                  onPress={() => openImagePickerAsync()}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  })}
                >
                  {loading
                    ? <Skeleton rounded='full' w={'full'} h={'full'} />
                    : !loading && imageUrl
                      ? <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', width: "100%", height: '100%' }}>
                        <Image alt='Profile Image'
                          onLoad={() => setImageLoading(false)} source={{ uri: imageUrl }}
                          style={{
                            width: '100%',
                            height: '100%',
                            flex: 1,
                            resizeMode: 'cover',
                            borderRadius: 60,
                          }}
                        />
                        <Skeleton position={'absolute'} top={0} zIndex={5} display={imageLoading ? 'flex' : 'none'} rounded='full' w={'full'} h={'full'} />
                      </View>
                      : <Image alt='Profile Image' source={require("../../../../assets/blank.png")}
                        style={{
                          width: '100%',
                          height: '100%',
                          flex: 1,
                          resizeMode: 'cover',
                          borderRadius: 60,
                        }}
                      />
                  }

                </Pressable>
                <Pressable
                  disabled={loading || imageLoading}
                  onPress={() => openImagePickerAsync()}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : loading ? 0.7 : 1,
                    // backgroundColor: pressed ? tint: backgroundColor,
                    position: 'absolute', justifyContent: 'center', alignItems: 'center', right: 3, bottom: 0, backgroundColor: COLORS.pallete_deep, width: 40, height: 40, borderRadius: 20, padding: 3
                  })}
                >
                  <Ionicons name={'ios-camera-outline'} style={{ fontSize: 24 }} color={'white'} />
                </Pressable>
              </View>
              <Text style={{ textAlign: 'center', marginBottom: 0, fontSize: SIZES.extraLarge, fontFamily: FONTS.semiBold, color: COLORS.dark }}>{firstName} {lastName}</Text>
              <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: SIZES.large, fontFamily: FONTS.bold, color: COLORS.primary }}>{userReducer.user.soso_id}</Text>
              <View style={{ width: '40%', justifyContent: 'center', alignItems: 'center' }}>
                <ButtonWithTitle loading={false} title={'Edit Profile'} size={'sm'} backgroundColor={COLORS.pallete_deep} onTap={() => navigation.navigate("EditProfile")} bordered={false} width={'100%'} color={'white'} noBg={false} />
              </View>
            </View>
            <View style={{ flex: 2, width: '100%', marginTop: 30, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column' }}>
              <View style={{ ...styles.section }}>
                <ListItem
                  title='Settings'
                  backgroundColor='white'
                  color={COLORS.dark}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => navigation.navigate('EditProfile')}
                  width={'100%'}
                  leftIcon={'ios-settings-outline'}
                />
                <ListItem
                  title='Location'
                  backgroundColor='white'
                  color={COLORS.dark}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => navigation.navigate('SetLocation')}
                  width={'100%'}
                  leftIcon={'ios-location-outline'}
                />
                <ListItem
                  title='Change Pin'
                  backgroundColor='white'
                  color={COLORS.dark}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => navigation.navigate('ChangePassword')}
                  width={'100%'}
                  leftIcon={'ios-lock-open-outline'}
                />
              </View>
              <View style={{ ...styles.section }}>
                <ListItem
                  title='Help'
                  backgroundColor='white'
                  color={COLORS.dark}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => navigation.navigate('Support')}
                  width={'100%'}
                  leftIcon={'ios-help-circle-outline'}
                />
                <ListItem
                  title='Ask a Doctor'
                  backgroundColor='white'
                  color={COLORS.primary}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => navigation.navigate("AskDoctor")}
                  width={'100%'}
                  leftIcon={'doctor'}
                  materialIcon={true}
                />
                <ListItem
                  title='Log out'
                  backgroundColor='white'
                  color={COLORS.negative}
                  tint={COLORS.fade}
                  loading={false}
                  onTap={() => logUserOut()}
                  width={'100%'}
                  leftIcon={'ios-log-out-outline'}
                />
              </View>
            </View>
          </View>
          <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
          <ErrorSheet error={error} open={hasError} closed={clearError} />
        </View>
      </ScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fefefe',
    paddingHorizontal: 24,
    marginTop: 30
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#d9d9d9'
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
  userReducer: state.UserReducer
});

const ProfileScreen = connect(mapToStateProps, { OnUserLogout, OnUserUpdateProfileImage })(_ProfileScreen);
export default ProfileScreen;