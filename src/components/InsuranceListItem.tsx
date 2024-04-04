import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    Spinner
} from "native-base";

interface ButtonProps {
    detail: string,
    id?: string,
    date: number | 0,
    color: string,
    backgroundColor: string,
    tint?: string,
    loading: boolean;
    plan: string;
    onTap?: Function;
}

const InsuranceListItem: React.FC<ButtonProps> = ({ detail, onTap, id, date, plan, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', loading = false, }) => {
    return (
        <Pressable onPress={onTap ? () => onTap(id) : () => { }} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : backgroundColor,
            overflow: 'hidden',
            width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
        })}>
            <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 10, padding: 4, width: 28 }}>
                <MaterialIcons name='hospital-box-outline' style={{ fontSize: 20 }} color={COLORS.primary} />
            </View>
            <View style={{ flexDirection: 'row', flex: 1, width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ fontSize: 16, flex: 2, fontFamily: FONTS.semiBold, marginRight: 6, color: COLORS.dark }}>{new Date(date).toDateString()}</Text>
                <Text numberOfLines={1} style={{ fontSize: 16, flex: 5, overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.gray }}>{plan}</Text>
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

export { InsuranceListItem };