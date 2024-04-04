import { View, Text, Platform, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { COLORS, SIZES, FONTS } from '../../../constants';

import { TextField } from "../../../components/TextField";
import { AccountNumberField } from "../../../components/AccountNumber";
import SelectField from "../../../components/SelectField";
import { ButtonWithTitle } from "../../../components/ButtonWithTitle";
import ErrorSheet from "../../../components/ErrorSheet";
import SuccessSheet from "../../../components/SuccessSheet";

import { useNavigation } from "@react-navigation/native";
import { ClientDetailsScreenRouteProp, ClientScreenNavigationProp } from "../../../navigation/agent/types";
import { useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';

import { connect } from 'react-redux';
import {
  ApplicationState,
  AgentState,
  OnAgentWithdrawFunds,
  OnLoadAgentClient,
  OnAgentSavePaymentMethod,
  OnLoadBanks,
  OnResolveBank,
  OnLoadWallet,
  WalletModel
} from '../../../redux';
import Wizard, { WizardRef } from 'react-native-wizard';

import { NativeBaseProvider, extendTheme } from "native-base";
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

interface PayClientProps {
  agentReducer: AgentState;
  OnLoadAgentClient: Function;
  OnLoadWallet: Function;
  OnLoadBanks: Function;
  OnResolveBank: Function;
  OnAgentSavePaymentMethod: Function;
  OnAgentWithdrawFunds: Function;
}

const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const _PayClient: React.FC<PayClientProps> = (props) => {
  const { agentReducer, OnLoadAgentClient, OnAgentWithdrawFunds, OnResolveBank, OnAgentSavePaymentMethod, OnLoadWallet, OnLoadBanks } = props;
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const route = useRoute<ClientDetailsScreenRouteProp>();
  const { client } = route.params;

  const [inLoading, setInLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userWallet, setUserWallet] = useState<WalletModel>();

  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNotice, setHasNotice] = useState(false);

  const wizard = useRef<WizardRef>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  interface BankModel {
    title: string;
    value: string;
    id: string;
  }
  const [bank, setBank] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [allBanks, setAllBanks] = useState<Array<BankModel>>([]);
  const [reset, setReset] = useState(false);
  const [bvn, setBVN] = useState('');


  // notice handlers
  const clearError = () => {
    setHasError(false);
    setLoading(false);
  };
  const handleNotice = () => {
    setHasNotice(false);
    setLoading(false);
  };
  const handleSuccess = async () => {
    setIsSuccess(false);
    setLoading(false);
    await OnLoadWallet('agent', agentReducer.agent.authToken);
    navigation.navigate('ClientDetails', { client });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setLoading(true);
        let res = await OnLoadAgentClient(client._id);
        if (res.success) {
          setUserWallet(res.wallet);
          setBank(res.wallet.withdrawal_bank);
          setAccountName(res.wallet.withdrawal_account_name);
          setAccountNumber(res.wallet.withdrawal_account_number);
          setBankCode(res.wallet.withdrawal_account_bank_id);
          setInLoading(false);
        } else if (res.error) {
          setInLoading(false);
          setError(res.error);
          setHasError(true);
        }
        setEmail(client.email || '');
        setPhone(client.phone);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Unable to load Wallet');
        setHasError(true);
        return;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reset]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      try {
        setLoading(true);
        let res = await OnLoadBanks();
        if (res.error) {
          setLoading(false);
          setError('Unable to load banks');
          setHasError(true);
        }
        let banks = res.banks;
        setAllBanks(banks);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Unable to load banks');
        setHasError(true);
        return;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // principal actions
  const addWithdrawalMethod = async () => {
    let bank_code = bankCode;
    if (!bank_code) {
      let activeBank = allBanks.find((item) => item.title === bank);
      bank_code = activeBank!.id;
    }

    if (accountName && accountNumber && bank && bank_code) {
      try {
        setLoading(true);
        let res = await OnAgentSavePaymentMethod(accountNumber, bank_code, bank, accountName, client._id, bvn);
        if (res.error) {
          setLoading(false);
          setError(res.error);
          setHasError(true);
          return;
        }
        wizard.current?.next();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Unable to save payment method. Please try again');
        setHasError(true);
        return;
      }
    } else {
      setLoading(false);
      setError('Kindly fill all fields');
      setHasError(true);
      return;
    }
  };
  const WithdrawFunds = async (amount) => {
    try {
      setLoading(true);
      if (amount < 100) {
        setLoading(false);
        setError('Withdrawal amount must be greater than ₦100');
        setHasError(true);
        return;
      }
      let res = await OnAgentWithdrawFunds(amount, client._id);
      if (res.error) {
        setLoading(false);
        setError(res.error);
        setHasError(true);
        return;
      }
      if (res.success) {
        setLoading(false);
        setSuccessMessage('Your transfer is been processed');
        setIsSuccess(true);
        return;
      }
    } catch (error) {
      setLoading(false);
      setError('Withdrawal failed');
      setHasError(true);
      return;
    }
  };

  // slide1 handlers
  const handleAccountNumber = async (val) => {
    if (val === accountNumber && accountName) return;
    setAccountName('');

    if (val.length > 9 && !loading) {
      setAccountNumber(val);
      try {
        setLoading(true);
        let res = await OnResolveBank(val, bankCode);
        if (res.error) {
          setLoading(false);
          setError('Cannot resolve bank name');
          setHasError(true);
        }
        setAccountName(res.account_name);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Cannot resolve bank name');
        setHasError(true);
        return;
      }
    }
  };
  const updateBank = (val) => {
    if (!allBanks) return;
    let activeBank = allBanks.find((item) => item.value === val);
    if (activeBank) {
      setBankCode(activeBank.id);
      setBank(activeBank.title);
    }
  };

  // slides
  const SetAccount = ({ addWithdrawalMethod, handleAccountNumber, updateBank }) => {
    const resetWithdrawalMethod = () => {
      setAccountName('');
      setAccountNumber('');
      setBank('');
      setBankCode('');
      setReset(prev => !prev);
    };
    let AccountSchema = yup.object().shape({
      account_number: yup.string().required('Account number is required'),
      bank_code: yup.string().required('Bank is required'),
      bank_name: yup.string().required('Bank is required'),
      account_name: yup.string().required('Account name is required'),
    });
    if (!userWallet?.virtual_account_number) {
      AccountSchema = yup.object().shape({
        account_number: yup.string().required('Account number is required'),
        bank_code: yup.string().required('Bank is required'),
        bank_name: yup.string().required('Bank is required'),
        account_name: yup.string().required('Account name is required'),
        bvn: yup.string().required('BVN is required').max(11, "BVN should not be more than 11 digits").min(11, "BVN should not be less than 11 digits"),
      });
    }

    return (
      <View style={{ ...styles.stepContainer }}>
        <Text style={styles.headingText}>Withdrawal Account</Text>
        <View style={{ width: '100%', justifyContent: 'flex-start' }}>
          <Formik
            initialValues={{
              account_number: accountNumber,
              bank_code: bankCode,
              bank_name: bank,
              account_name: accountName,
              bvn: "",
            }}
            onSubmit={values => { }}
            validationSchema={AccountSchema}
          >
            {({ values, errors, handleBlur, touched, handleChange }) => (
              <View style={{ width: '100%', marginBottom: 30 }}>
                <Text style={styles.label}>Withdrawal Bank</Text>
                <SelectField
                  hasIcon={false}
                  label='Select Bank'
                  isDisabled={loading}
                  handleChange={(val) => {
                    handleChange('bank_name')(val);
                    updateBank(val);
                  }}
                  options={allBanks}
                  value={bank}
                />
                {errors.bank_name && touched.bank_name ? <Text style={styles.errorText}>{errors.bank_name}</Text> : null}
                <Text style={styles.label}>Account Number</Text>
                <AccountNumberField
                  label='0123456789'
                  handleChange={(val) => {
                    if (val.toString().length > 9) {
                      handleAccountNumber(val);
                      handleChange('account_number')(val);
                    }
                  }}
                  passBlur={handleBlur('account_number')}
                  value={accountNumber}
                />
                <TouchableOpacity onPress={() => handleAccountNumber(values.account_number)} style={{ marginTop: -20, width: '100%' }} >
                  <Text style={{ textAlign: 'right', fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.primary }}>Resolve account name</Text>
                </TouchableOpacity>
                {errors.account_number && touched.account_number ? <Text style={styles.errorText}>{errors.account_number}</Text> : null}
                <Text style={styles.label}>Account Name</Text>
                <TextField
                  hasIcon={false}
                  isNumber={false}
                  isPhone={false}
                  label='Account Name'
                  isSecure={false}
                  isDisabled={true}
                  handleChange={(val) => {
                    handleChange('account_name')(val);
                    setAccountName(val);
                  }}
                  passBlur={handleBlur('account_name')}
                  value={accountName}
                />
                {errors.account_name && touched.account_name ? <Text style={styles.errorText}>{errors.account_name}</Text> : null}
                {!userWallet?.virtual_account_number && <View>
                  <Text style={styles.label}>BVN</Text>
                  <TextField
                    hasIcon={false}
                    isNumber={true}
                    isPhone={false}
                    label='BVN'
                    isSecure={false}
                    isDisabled={loading}
                    handleChange={(val) => {
                      handleChange('bvn')(val);
                      setBVN(val);
                    }}
                    passBlur={handleBlur('bvn')}
                  />
                  {errors.bvn && touched.bvn ? <Text style={styles.errorText}>{errors.bvn}</Text> : null}
                </View>}
                <View style={{ width: '100%', marginTop: 10 }}>
                  <ButtonWithTitle loading={loading} noBg={false} title={'Continue'} backgroundColor={COLORS.primary} color={COLORS.white} onTap={() => addWithdrawalMethod()} width={'100%'} />
                </View>
                <View style={{ width: '100%', marginTop: 10 }}>
                  <ButtonWithTitle loading={loading} noBg={false} bordered title={'Reset'} backgroundColor={"transparent"} color={COLORS.dark} onTap={resetWithdrawalMethod} width={'100%'} />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </View>
    );
  };
  const Withdraw = () => {
    const [withdrawalAmount, setWithdrawalAmount] = useState(0);

    return (
      <View style={{ ...styles.stepContainer }}>
        <Text style={styles.headingText}>Amount to withdraw (₦)</Text>
        <View style={{ width: '100%', justifyContent: 'flex-start' }}>
          <TextField
            label='Amount'
            handleChange={setWithdrawalAmount}
            isNumber={true}
            prefix={'\u20A6'}
          />
          <ButtonWithTitle
            title={'Withdraw'}
            color={COLORS.white}
            backgroundColor={COLORS.pallete_deep}
            loading={loading}
            onTap={() => WithdrawFunds(withdrawalAmount)}
            width={'100%'}
          />
        </View>
      </View>
    );
  };

  const stepList = [
    {
      content: <SetAccount updateBank={updateBank} handleAccountNumber={handleAccountNumber} addWithdrawalMethod={addWithdrawalMethod} />,
    },
    {
      content: <Withdraw />,
    },
  ];

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
      <KeyboardAwareScrollView extraScrollHeight={keyboardVerticalOffset} style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
        <View style={styles.container}>
          <View style={{ width: '100%', flex: 1 }}>
            <Wizard
              useNativeDriver
              activeStep={0}
              ref={wizard}
              steps={stepList}
              isFirstStep={val => setIsFirstStep(val)}
              isLastStep={val => setIsLastStep(val)}
              currentStep={({ currentStep, isLastStep, isFirstStep }) => {
                setCurrentStep(currentStep);
              }}
            />
          </View>

          <SuccessSheet message={successMessage} open={isSuccess} closed={handleSuccess} />
          <ErrorSheet error={error} open={hasError} closed={clearError} />
        </View>

      </KeyboardAwareScrollView>
      <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1
  },
  label: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray,
    marginBottom: 10
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
  agentReducer: state.AgentReducer,
});

const PayClient = connect(mapToStateProps, { OnLoadAgentClient, OnAgentWithdrawFunds, OnAgentSavePaymentMethod, OnResolveBank, OnLoadWallet, OnLoadBanks })(_PayClient);
export default PayClient;