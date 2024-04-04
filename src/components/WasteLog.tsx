import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
    onTap?: Function;
}

const WasteLog: React.FC<ButtonProps> = ({ onTap, id, title, balance, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', loading = false, }) => {

    return (
        <Pressable onPress={onTap ? () => onTap(id) : () => { }} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : backgroundColor,
            width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
        })}>
            <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 6, padding: 4 }}>
                <MaterialIcons name='recycle-variant' style={{ fontSize: 20 }} color={COLORS.primary} />
            </View>
            <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: color }}>{title}</Text>
                {title === "Batteries"
                    ? <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: color }}>{balance} Units</Text>
                    : <Text style={{ fontSize: 16, fontFamily: FONTS.medium, color: color }}>{balance} Kg</Text>}
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

export { WasteLog };