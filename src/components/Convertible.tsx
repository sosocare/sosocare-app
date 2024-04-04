import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatCurrency } from "react-native-format-currency";
import {
    Spinner
} from "native-base";

interface ButtonProps {
    title: string,
    id: string,
    balance: number | 0,
    color: string,
    backgroundColor: string,
    tint?: string,
    loading: boolean;
    onTap: Function;
}

const Convertible: React.FC<ButtonProps> = ({ id, title, balance, onTap, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', loading = false, }) => {
    const [amount, setAmount] = useState(0);
    useEffect(() => {
        let price = 0;
        if (title === 'Batteries') {
            price = 2700;
        } else if (title === 'HDPE') {
            price = 3000;
        } else if (title === 'Carton') {
            price = 1800;
        } else if (title === 'Copper') {
            price = 4000;
        } else if (title === 'Tin') {
            price = 5000;
        } else if (title === 'PET') {
            price = 1500;
        } else if (title === 'Aluminium') {
            price = 5500;
        } else if (title === 'Steel') {
            price = 6000;
        } else if (title === 'Paper') {
            price = 1500;
        } else if (title === 'SachetWater') {
            price = 1000;
        } else if (title === 'White Nylon') {
            price = 2500;
        } else if (title === 'Metal') {
            price = 3000;
        }
        const [valueFormattedWithSymbol, valueFormattedWithoutSymbol, symbol] = formatCurrency({ amount: (price / 100 * balance * 100) / 100, code: "USD" });
        setAmount(valueFormattedWithoutSymbol);
    }, []);
    return (
        <Pressable onPress={() => onTap(id, amount)} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : backgroundColor,
            width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
        })}>
            <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 6, padding: 4 }}>
                <MaterialIcons name='recycle-variant' style={{ fontSize: 20 }} color={color} />
            </View>
            <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: color }}>{title}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {title === 'Batteries'
                        ? <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.gray, marginRight: 3 }}>{balance} Units</Text>
                        : <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.gray, marginRight: 3 }}>{balance} Kg</Text>}
                    <Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: COLORS.gray }}> for <Text style={{ fontSize: 16, color: COLORS.primary }}>{'\u20A6'}{amount}</Text></Text>
                </View>
            </View>

        </Pressable>
    );

};


const styles = StyleSheet.create({
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    loading: {
        opacity: 0.7
    }

});

export { Convertible };