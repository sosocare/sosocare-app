import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { formatCurrency } from "react-native-format-currency";
import Carousel from "react-native-snap-carousel";

import { COLORS, SIZES, FONTS } from "../../constants";

import { ButtonWithTitle } from "../../components/ButtonWithTitle";
import { InsuranceListItem } from "../../components/InsuranceListItem";
import NoticeSheet from "../../components/NoticeSheet";
import ErrorSheet from "../../components/ErrorSheet";
import SuccessSheet from "../../components/SuccessSheet";
import ContentSheet from "../../components/ContentSheet";
import MaterialIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { BASE_URL } from "../../utils";

import { useNavigation } from "@react-navigation/native";
import { InsuranceScreenNavigationProp } from "../../navigation/user/types";

import { connect } from "react-redux";
import {
  ApplicationState,
  UserState,
  InsuranceState,
  PlanModel,
  InsuranceModel,
  OnLoadInsurance,
  OnCancelInsurance,
} from "../../redux";

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
      100: "#52A56E",
      200: "#C6C6C6",
    },
  },
  config,
});
type MyThemeType = typeof theme;
declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}

interface InsuranceScreenProps {
  userReducer: UserState;
  insuranceReducer: InsuranceState;
  OnLoadInsurance: Function;
  OnCancelInsurance: Function;
}

const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
const deviceWidth = Dimensions.get("screen").width;
const _InsuranceScreen: React.FC<InsuranceScreenProps> = (props) => {
  const { userReducer, insuranceReducer, OnLoadInsurance, OnCancelInsurance } =
    props;
  const navigation = useNavigation<InsuranceScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const [insurance, setInsurance] = useState<InsuranceModel>();
  const [plans, setPlans] = useState<Array<PlanModel>>();
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [hasConfirm, setHasConfirm] = useState(false);

  const clearError = () => {
    setHasError(false);
  };
  const handleConfirm = async () => {
    // do sth
    await OnCancelInsurance(insuranceReducer.insurance._id);
    await OnLoadInsurance("user", userReducer.user.authToken);
    setHasConfirm(false);
    setReload((prev) => !prev);
    setHasConfirm(false);
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
        await OnLoadInsurance("user", existingUser.authToken);
        let insurance = insuranceReducer.insurance;
        let plans = insuranceReducer.plans;
        if (!mounted) {
          return;
        }
        setInsurance(insurance);
        setPlans(plans);
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
      setReload((prev) => !prev);
      wait(2000).then(() => setRefreshing(false));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const openPlan = (id) => {
    const selectedPlan = plans!.find((item) => item._id === id);
    if (selectedPlan) {
      navigation.navigate("Plan", { plan: selectedPlan });
    }
  };

  const cancelPlan = () => {
    setConfirmMessage(
      `Are you sure you want to cancel your current ${insurance?.plan}?`
    );
    setHasConfirm(true);
  };

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style={{ backgroundColor: "#fefefe" }} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <View style={styles.container}>
          <InsuranceDetails
            insurance={insurance}
            onManage={() => navigation.navigate("ManageInsurance")}
          />

          {insurance && insurance._id && insurance.pharmacy?.name ? (
            <View
              style={{
                ...styles.insuranceContainer,
                borderWidth: 1,
                borderColor: COLORS.fade,
                backgroundColor: COLORS.white,
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  ...styles.insuranceHeading,
                  color: COLORS.pallete_deep,
                }}
              >
                Primary Pharmacy
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    marginTop: 20,
                  }}
                >
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Name</Text>
                    <Text style={styles.transactionRecordRight}>
                      {insurance?.pharmacy.name}
                    </Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Address</Text>
                    <Text style={styles.transactionRecordRight}>
                      {insurance?.pharmacy.address}
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.transactionRecord,
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{ width: "100%", marginBottom: 8, marginTop: 18 }}
                    >
                      <ButtonWithTitle
                        title="Change Pharmacy"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.dark}
                        loading={false}
                        onTap={() => navigation.navigate("ManageInsurance")}
                        width={"100%"}
                        bordered
                      />
                    </View>
                    <View style={{ width: "100%" }}>
                      <ButtonWithTitle
                        title="Cancel Subscription"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.negative}
                        loading={false}
                        onTap={() => cancelPlan()}
                        width={"100%"}
                        bordered
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : insurance?.hospital?.name ? (
            <View
              style={{
                ...styles.insuranceContainer,
                borderWidth: 1,
                borderColor: COLORS.fade,
                backgroundColor: COLORS.white,
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  ...styles.insuranceHeading,
                  color: COLORS.pallete_deep,
                }}
              >
                Primary Hospital
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    marginTop: 20,
                  }}
                >
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Name</Text>
                    <Text style={styles.transactionRecordRight}>
                      {insurance?.hospital.name}
                    </Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Address</Text>
                    <Text style={styles.transactionRecordRight}>
                      {insurance?.hospital.address}
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.transactionRecord,
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{ width: "100%", marginBottom: 8, marginTop: 18 }}
                    >
                      <ButtonWithTitle
                        title="Change Hospital"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.dark}
                        loading={false}
                        onTap={() => navigation.navigate("ManageInsurance")}
                        width={"100%"}
                        bordered
                      />
                    </View>
                    <View style={{ width: "100%" }}>
                      <ButtonWithTitle
                        title="Cancel Subscription"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.negative}
                        loading={false}
                        onTap={() => cancelPlan()}
                        width={"100%"}
                        bordered
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : insurance &&
            insurance._id &&
            !insurance?.pharmacy?.name &&
            !insurance?.hospital?.name ? (
            <View
              style={{
                ...styles.insuranceContainer,
                borderWidth: 1,
                borderColor: COLORS.fade,
                backgroundColor: COLORS.white,
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  ...styles.insuranceHeading,
                  color: COLORS.pallete_deep,
                }}
              >
                Primary Care Center
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    marginTop: 20,
                  }}
                >
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Name</Text>
                    <Text style={styles.transactionRecordRight}>
                      Not selected
                    </Text>
                  </View>
                  <View style={styles.transactionRecord}>
                    <Text style={styles.transactionRecordLeft}>Address</Text>
                    <Text style={styles.transactionRecordRight}>
                      Not selected
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.transactionRecord,
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{ width: "100%", marginBottom: 8, marginTop: 18 }}
                    >
                      <ButtonWithTitle
                        title="Select Care Center"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.dark}
                        loading={false}
                        onTap={() => navigation.navigate("ManageInsurance")}
                        width={"100%"}
                        bordered
                      />
                    </View>
                    <View style={{ width: "100%" }}>
                      <ButtonWithTitle
                        title="Cancel Subscription"
                        backgroundColor="transparent"
                        noBg={false}
                        size="sm"
                        color={COLORS.negative}
                        loading={false}
                        onTap={() => cancelPlan()}
                        width={"100%"}
                        bordered
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
          {!insurance && plans && (
            <View
              style={{
                ...styles.insuranceContainer,
                width: deviceWidth,
                borderRadius: 0,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                borderWidth: 1,
                borderColor: COLORS.fade,
                backgroundColor: COLORS.white,
                marginBottom: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  width: "100%",
                  fontFamily: FONTS.semiBold,
                  color: COLORS.dark,
                  marginBottom: 10,
                }}
              >
                Insurance Plans
              </Text>

              <View
                style={{
                  marginVertical: 10,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <InsurancePlans plans={plans} onNavigate={openPlan} />
              </View>
            </View>
          )}
          <InsuranceHistory user={userReducer.user} onViewHistory={() => {}} />
          <ErrorSheet error={error} open={hasError} closed={() => {}} />
          <NoticeSheet
            message={confirmMessage}
            open={hasConfirm}
            closed={() => handleConfirm()}
          />
        </View>
      </ScrollView>
      <SafeAreaView style={{ backgroundColor: "#fefefe" }} />
    </NativeBaseProvider>
  );
};

interface DetailsProps {
  insurance: InsuranceModel | undefined | null;
  onManage: Function;
}
const InsuranceDetails: React.FC<DetailsProps> = ({ insurance, onManage }) => {
  return (
    <View
      style={{
        ...styles.insuranceContainer,
        borderWidth: 1,
        borderColor: COLORS.fade,
        backgroundColor: COLORS.pallete_deep,
      }}
    >
      <Text style={styles.insuranceHeading}>Insurance status</Text>
      {insurance && insurance.status === "active" ? (
        <View
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ ...styles.insurancePlan, color: COLORS.pallete_cream }}
          >
            {insurance.plan}
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                flexShrink: 1,
                fontFamily: FONTS.medium,
                color: COLORS.white,
                marginRight: 3,
              }}
            >
              Insurance Code:
            </Text>
            <Text
              style={{
                fontSize: 16,
                flexShrink: 1,
                fontFamily: FONTS.medium,
                color: COLORS.white,
              }}
            >
              {insurance.insurance_provider_id}
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONTS.medium,
                color: COLORS.white,
                marginRight: 3,
              }}
            >
              Expires:
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONTS.medium,
                color: COLORS.white,
              }}
            >
              {new Date(insurance.expiry_date).toDateString()}
            </Text>
          </View>
        </View>
      ) : insurance && insurance.status === "enrolled" ? (
        <View
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ ...styles.insurancePlan, color: COLORS.pallete_cream }}
          >
            {insurance.plan}
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                flexShrink: 1,
                fontFamily: FONTS.medium,
                color: COLORS.white,
                marginRight: 3,
              }}
            >
              Status:
            </Text>
            <Text
              style={{
                fontSize: 16,
                flexShrink: 1,
                fontFamily: FONTS.medium,
                color: COLORS.white,
              }}
            >
              Pending confirmation
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: 14,
              fontFamily: FONTS.semiBold,
              color: COLORS.pallete_cream,
            }}
          >
            No active Insurance subscriptions. Select an Insurance plan Below to
            continue.
          </Text>
        </View>
      )}
    </View>
  );
};

type MyProps = { plans: Array<PlanModel>; onNavigate: Function };
type MyState = { activeIndex: number; carouselItems: Array<PlanModel> };
const planDetails = {
  0: [
    {
      items: "Telemedicine",
    },
    {
      items: "Malaria Tests",
    },
    {
      items: "Malaria Drugs",
    },
    {
      items: "Typhoid Drugs",
    },
    {
      items: "Heart Check",
    },
    {
      items: "Diabetes Check",
    },
    {
      items: "Cough & Cattarh Drugs",
    },
    {
      items: "Pain Killer Drugs",
    },
  ],
  1: [
    {
      items: "Basic Plan Benefits",
    },
    {
      items: "Minor Surgery",
    },
    {
      items: "Hospital Card",
    },
    {
      items: "Out-Patient Care",
    },
  ],
  2: [
    {
      items: "Basic + MicroInsurance Benefits",
    },
    {
      items: "Hospitalizations",
    },
  ],
};
export class InsurancePlans extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      carouselItems: props.plans,
    };
  }

  _renderItem = ({ item, index }) => {
    const backgroundImage = BackgroundImageService.GetImage(item.name);
    const [
      incomeValueFormattedWithSymbol,
      incomeValueFormattedWithoutSymbol,
      incomeSymbol,
    ] = formatCurrency({ amount: item.price / 100, code: "USD" });
    return (
      <View
        key={item._id}
        style={{
          width: "100%",
          borderRadius: 15,
          overflow: "hidden",
          borderWidth: 1,
          borderColor:
            item.name === "Sosocare Gold Plan"
              ? COLORS.pallete_cream
              : COLORS.fade,
          marginVertical: 10,
          backgroundColor:
            item.name === "Sosocare Gold Plan"
              ? COLORS.pallete_cream
              : item.name === "Sosocare Silver Plan"
              ? COLORS.pallete_white
              : COLORS.white,
        }}
      >
        <Image
          source={backgroundImage}
          style={{
            width: "100%",
            borderTopLeftRadius: 13,
            borderTopRightRadius: 8,
          }}
        />
        <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text
            style={{
              ...styles.insurancePlan,
              color: COLORS.pallete_deep,
              textTransform: "uppercase",
              flexShrink: 1,
            }}
          >
            {item.ussd_name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: FONTS.bold,
                color: COLORS.pallete_deep,
              }}
            >
              Price: {"\u20A6"}
              {incomeValueFormattedWithoutSymbol}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: FONTS.bold,
                color: COLORS.pallete_deep,
              }}
            >
              Waste Cost: {item.waste_price / 1000} {"Kg"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 24,
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <ButtonWithTitle
              size="sm"
              title="View"
              width={"100%"}
              onTap={() => this.props.onNavigate(item._id)}
              backgroundColor={"transparent"}
              color={COLORS.pallete_deep}
              bordered
              loading={false}
            />
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <Carousel
        layout={"default"}
        vertical={false}
        // ref={ref => this.carousel = ref}
        data={this.state.carouselItems}
        renderItem={this._renderItem}
        sliderWidth={deviceWidth}
        itemWidth={deviceWidth * 0.8}
        onSnapToItem={(index) => this.setState({ activeIndex: index })}
      />
    );
  }
}

export class OnboardingInsurancePlans extends React.Component<
  MyProps,
  MyState
> {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      carouselItems: props.plans,
    };
  }

  _renderItem = ({ item, index }) => {
    const backgroundImage = BackgroundImageService.GetImage(item.name);

    const [
      incomeValueFormattedWithSymbol,
      incomeValueFormattedWithoutSymbol,
      incomeSymbol,
    ] = formatCurrency({ amount: item.price / 100, code: "USD" });
    return (
      <View
        key={item._id}
        style={{
          width: "100%",
          borderRadius: 15,
          overflow: "hidden",
          borderWidth: 1,
          borderColor:
            item.name === "Sosocare Gold Plan"
              ? COLORS.pallete_cream
              : COLORS.fade,
          marginVertical: 10,
          backgroundColor:
            item.name === "Sosocare Gold Plan"
              ? COLORS.pallete_cream
              : item.name === "Sosocare Silver Plan"
              ? COLORS.pallete_white
              : COLORS.white,
        }}
      >
        <Image
          source={backgroundImage}
          style={{
            width: "100%",
            borderTopLeftRadius: 13,
            borderTopRightRadius: 8,
          }}
        />
        <View style={{ paddingHorizontal: 14, paddingVertical: 10, display: "flex" }}>
          <Text
            style={{
              ...styles.insurancePlan,
              color: COLORS.pallete_deep,
              textTransform: "uppercase",
              flexShrink: 1,
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: FONTS.bold,
                color: COLORS.pallete_deep,
              }}
            >
              Price per: {"\u20A6"}
              {incomeValueFormattedWithoutSymbol}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: FONTS.bold,
                color: COLORS.pallete_deep,
              }}
            >
              Waste Cost: {item.waste_price / 1000} {"Kg"}
            </Text>
          </View>
          <View style={{minHeight: 300}}>
          {/* {planDetails[index].map((detail) => ( */}
          {(planDetails[index] || []).map((detail) => (
            <View
              key={detail.items}
              style={{
                width: "100%",
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  borderRadius: 6,
                  backgroundColor: COLORS.fade,
                  marginRight: 10,
                  padding: 4,
                  width: 28,
                }}
              >
                <MaterialIcons
                  name="check-bold"
                  style={{ fontSize: 20 }}
                  color={COLORS.primary}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  width: "90%",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    flex: 5,
                    flexShrink: 1,
                    overflow: "hidden",
                    fontFamily: FONTS.medium,
                    color: COLORS.gray,
                  }}
                >
                  {detail.items}
                </Text>
              </View>
            </View>
          ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 24,
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <ButtonWithTitle
              size="sm"
              title="Proceed"
              width={"100%"}
              onTap={() => this.props.onNavigate(item._id)}
              backgroundColor={"transparent"}
              color={COLORS.pallete_deep}
              bordered
              loading={false}
            />
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <Carousel
        layout={"default"}
        vertical={false}
        // ref={ref => this.carousel = ref}
        data={this.state.carouselItems}
        renderItem={this._renderItem}
        sliderWidth={deviceWidth}
        itemWidth={deviceWidth * 0.8}
        onSnapToItem={(index) => this.setState({ activeIndex: index })}
      />
    );
  }
}

const InsuranceHistory = ({ onViewHistory, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasError, setHasError] = useState(false);
  const [history, setHistory] = useState<Array<InsuranceModel>>();
  const [showContent, setShowContent] = useState(false);
  const [activeItem, setActiveItem] = useState<InsuranceModel>();

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
        const response = await axios.get<string>(
          `${BASE_URL}user/insurance/latest`,
          {
            cancelToken: source.token,
            headers: {
              Authorization: `Bearer ${user.authToken}`,
            },
          }
        );

        let resBody = response.data;

        if (resBody["status"] === "error") {
          setLoading(false);
          setError("Unable to load transations");
          setHasError(true);
          return { error: resBody["message"] };
        } else {
          if (!mounted) {
            return;
          }
          setHistory(resBody["insurances"]);
          setLoading(false);
          return { success: resBody["status"] };
        }
      } catch (error) {
        setLoading(false);
        setError("Unable to load Insurance History");
        setHasError(true);
        return;
      }
    })();
    return () => {
      source.cancel();
      mounted = false;
    };
  }, []);

  const showInsurance = async (id) => {
    if (history) {
      try {
        setLoading(true);
        let currentItem = history.find((item) => item._id === id);
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
  const InsuranceContent = () => {
    if (activeItem) {
      return (
        <View
          style={{
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{ ...styles.transactionHeading, color: COLORS.pallete_deep }}
          >
            Insurance Details
          </Text>
          <View
            style={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              marginTop: 20,
            }}
          >
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>Activation Date</Text>
              <Text style={styles.transactionRecordRight}>
                {new Date(activeItem.activation_date).toDateString()}
              </Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>Expiry Date</Text>
              <Text style={styles.transactionRecordRight}>
                {new Date(activeItem.expiry_date).toDateString()}
              </Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>Reference</Text>
              <Text style={styles.transactionRecordRight}>
                {activeItem.payment_ref}
              </Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>Plan</Text>
              <Text
                style={{
                  ...styles.transactionRecordRight,
                  textTransform: "capitalize",
                }}
              >
                {activeItem.plan}
              </Text>
            </View>
            <View style={styles.transactionRecord}>
              <Text style={styles.transactionRecordLeft}>Status</Text>
              <View
                style={[
                  styles.transactionRecordRight,
                  {
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flexDirection: "row",
                  },
                ]}
              >
                <Text
                  style={[
                    { maxWidth: 50 },
                    activeItem.status === "active" ||
                    activeItem.status === "renewed"
                      ? {
                          color: COLORS.pallete_white,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 10,
                          fontSize: SIZES.base,
                          backgroundColor: COLORS.pallete_deep,
                          padding: 6,
                        }
                      : activeItem.status === "failed"
                      ? {
                          color: COLORS.pallete_white,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 10,
                          fontSize: SIZES.base,
                          backgroundColor: COLORS.negative,
                          padding: 6,
                        }
                      : {
                          color: COLORS.pallete_white,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 10,
                          fontSize: SIZES.base,
                          backgroundColor: COLORS.dark,
                          padding: 6,
                        },
                  ]}
                >
                  {activeItem.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return <></>;
  };
  if (history?.length === undefined || history?.length < 1) {
    return <></>;
  } else {
    return (
      <View
        style={{
          ...styles.insuranceContainer,
          borderWidth: 1,
          borderColor: COLORS.fade,
          backgroundColor: COLORS.white,
          marginBottom: 100,
        }}
      >
        <Text
          style={{ ...styles.insuranceHeading, color: COLORS.pallete_deep }}
        >
          Insurance History
        </Text>
        <View
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <View style={{ width: "100%", marginTop: 0 }}>
            {history &&
              history.map((item: InsuranceModel) => (
                <InsuranceListItem
                  detail={item.plan}
                  date={item.activation_date}
                  plan={item.plan}
                  backgroundColor={COLORS.pallete_white}
                  tint={COLORS.white}
                  color={COLORS.dark}
                  loading={false}
                  key={item._id}
                  id={item._id}
                  onTap={showInsurance}
                />
              ))}
          </View>
          {
            <ContentSheet
              content={<InsuranceContent />}
              open={showContent}
              closed={closeContent}
            />
          }
          {/* <View style={{ marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ButtonWithTitle
            title='View All'
            backgroundColor='transparent'
            noBg={false}
            size='sm'
            color={COLORS.dark}
            loading={false}
            onTap={() => { }}
            width={'100%'}
            bordered
          />
        </View> */}
        </View>
        <ErrorSheet error={error} open={hasError} closed={() => {}} />
      </View>
    );
  }
};

// IMAGE INTERFACE
interface BgImage {
  plan: string;
  img: any;
}
// RETURN IMAGE PATH SERVICE
class BackgroundImageService {
  private static images: Array<BgImage> = [
    {
      plan: "Sosocare Basic Plan",
      // img: require("../../../assets/famaily_package.png"),
      img: require("../../../assets/silver_package.png"),
    },
    {
      plan: "Sosocare Silver Plan",
      img: require("../../../assets/silver_package.png"),
    },
    {
      plan: "Sosocare Gold Plan",
      img: require("../../../assets/gold_package.png"),
    },
  ];
  static GetImage = (plan: string) => {
    const found = BackgroundImageService.images.find((e) => e.plan === plan);
    return found ? found.img : null;
  };
}

const styles = StyleSheet.create({
  transactionHeading: {
    fontSize: SIZES.large,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18,
    width: "100%",
  },
  transactionRecord: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
    flexShrink: 1,
  },
  insuranceContainer: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingTop: 30,
    paddingBottom: 10,
    marginBottom: 20,
    paddingHorizontal: 18,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    borderTopEndRadius: 15,
    elevation: 5,
    shadowColor: "rgb(230, 235, 243)",
    shadowOffset: { width: 4, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  insuranceHeading: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 18,
  },
  insurancePlan: {
    fontSize: SIZES.extraLarge,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 6,
  },
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fefefe",
    paddingHorizontal: 24,
    marginTop: 30,
  },
  imageBg: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.heading,
    color: COLORS.dark,
    marginBottom: SIZES.font,
    textAlign: "center",
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
    textAlign: "center",
  },
});

const mapToStateProps = (state: ApplicationState) => ({
  userReducer: state.UserReducer,
  insuranceReducer: state.InsuranceReducer,
});

const InsuranceScreen = connect(mapToStateProps, {
  OnLoadInsurance,
  OnCancelInsurance,
})(_InsuranceScreen);
export default InsuranceScreen;
