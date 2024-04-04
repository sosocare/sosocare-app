import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { PlanModel } from '../../../redux';
import { ConfirmPlanScreenRouteProp, ClientScreenNavigationProp } from "../../../navigation/agent/types";
import { useRoute } from '@react-navigation/native';
import { formatCurrency } from "react-native-format-currency";
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { COLORS, FONTS, SIZES } from '../../../constants';

// interface ConfirmPlanProps {
//   plan: PlanModel;
// }
import { useNavigation } from "@react-navigation/native";
import { InsuranceScreenNavigationProp } from "../../../navigation/user/types";
import {
    NativeBaseProvider,
    extendTheme,
    Image,
    Skeleton
} from "native-base";
import { ButtonWithTitle } from '../../../components/ButtonWithTitle';
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


const ConfirmPlan = () => {
    const route = useRoute<ConfirmPlanScreenRouteProp>();
    const { client, plan } = route.params;
    const navigation = useNavigation<ClientScreenNavigationProp>();
    const backgroundImage = BackgroundImageService.GetImage(plan.name);
    const [incomeValueFormattedWithSymbol, incomeValueFormattedWithoutSymbol, incomeSymbol] = formatCurrency({ amount: plan.price / 100, code: "USD" });
    const [planDetails, setPlanDetails] = useState([
        {
            items: 'Hospital Admission',
        },
        {
            items: 'Covers 99% Hospital All Over Nigeria.',
        },
        {
            items: 'Emergency Intensive Care Treatment',
        },
        {
            items: 'Minor Surgeries - With Upper Limit Of N280,000',
        },
        {
            items: 'SCAN: MRI And CT Scan',
        },
    ]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) {
                return;
            }
            if (plan.name === 'Sosocare Basic Plan') {
                setPlanDetails(
                    [
                        {
                            items: 'Malaria Drugs',
                        },
                        {
                            items: 'Malaria Test',
                        },
                        {
                            items: 'Blood Sugar Test',
                        },
                        {
                            items: 'Blood Pressure Test',
                        },
                    ]
                );
            } else if (plan.name === 'Sosocare Gold Plan') {
                setPlanDetails([
                    {
                        items: 'All benefits on Pharmacy and Hospital plans',
                    },
                    {
                        items: 'Malaria Test & Malaria Test',
                    },
                    {
                        items: 'Blood Sugar Test',
                    },
                    {
                        items: 'Blood Pressure Test',
                    },
                    {
                        items: 'Hospital Admission',
                    },
                    {
                        items: 'Covers 99% Hospital All Over Nigeria.',
                    },
                    {
                        items: 'Emergency Intensive Care Treatment',
                    },
                    {
                        items: 'Minor Surgeries - With Upper Limit Of N280,000',
                    },
                    {
                        items: 'SCAN: MRI And CT Scan',
                    },
                ]);
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
                    <View style={{ width: '100%', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: plan.name === 'Sosocare Gold Plan' ? COLORS.pallete_cream : COLORS.fade, marginVertical: 10, backgroundColor: plan.name === 'Sosocare Gold Plan' ? COLORS.pallete_cream : plan.name === 'Sosocare Silver Plan' ? COLORS.pallete_white : COLORS.white, }}>
                        <Image alt={plan.ussd_name} source={backgroundImage} style={{ width: "100%", borderTopLeftRadius: 13, borderTopRightRadius: 8 }} />
                        <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                            <Text style={{ ...styles.insurancePlan, color: COLORS.pallete_deep, textTransform: 'uppercase', flexShrink: 1 }}>{plan.ussd_name}  for {client.first_name} {client.last_name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 18, fontFamily: FONTS.bold, color: COLORS.pallete_deep }}>Price: {'\u20A6'}{incomeValueFormattedWithoutSymbol}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 18, fontFamily: FONTS.bold, color: COLORS.pallete_deep }}>Waste Cost: {plan.waste_price / 1000} {"Kg"}</Text>
                            </View>
                            <View style={{ flexDirection: 'column', marginTop: 24 }}>
                                <Text style={{ fontSize: 18, fontFamily: FONTS.semiBold, color: COLORS.dark, marginBottom: 8 }}>Plan Benefits</Text>
                                {planDetails.map((detail) => (<View key={detail.items} style={{ width: '100%', marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ borderRadius: 6, backgroundColor: COLORS.fade, marginRight: 10, padding: 4, width: 28 }}>
                                        <MaterialIcons name='check-bold' style={{ fontSize: 20 }} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flexDirection: 'row', flex: 1, width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, flex: 5, flexShrink: 1, overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.gray }}>{detail.items}</Text>
                                    </View>
                                </View>))}
                            </View>
                        </View>
                    </View>


                    {plan.name === 'Sosocare Gold Plan'
                        ?
                        <View style={{ width: '100%', marginBottom: 8, marginTop: 20 }}>
                            <Text style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONTS.semiBold, textAlign: 'center' }}>
                                Coming Soon
                            </Text>
                        </View>
                        :
                        <View style={{ width: '100%', marginBottom: 8, marginTop: 20 }}>
                            <ButtonWithTitle
                                title='Buy Plan'
                                backgroundColor={COLORS.primary}
                                color={COLORS.white}
                                onTap={() => navigation.navigate('BuyPlan', { plan, client })}
                                loading={false}
                                width={"100%"}
                            />
                        </View>
                    }


                </View>
            </ScrollView>
            <SafeAreaView style={{ backgroundColor: '#fefefe' }} />
        </NativeBaseProvider>
    );
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
            plan: 'Sosocare Basic Plan',
            img: require('../../../../assets/family_package.png')
        },
        {
            plan: 'Sosocare Silver Plan',
            img: require('../../../../assets/silver_package.png')
        },
        {
            plan: 'Sosocare Gold Plan',
            img: require('../../../../assets/gold_package.png')
        },
    ];
    static GetImage = (plan: string) => {
        const found = BackgroundImageService.images.find(e => e.plan === plan);
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
        marginBottom: 60
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

export default ConfirmPlan;