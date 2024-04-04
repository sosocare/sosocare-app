import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
    Spinner
} from "native-base";

interface ButtonProps {
    onTap: Function;
    width: string | number;
    title: string,
    color: string,
    backgroundColor: string,
    tint?: string,
    noBg?: boolean;
    loading: boolean;
    bordered?: boolean;
    leftIcon?: string;
    materialIcon?: boolean;
}

const ListItem: React.FC<ButtonProps> = ({ onTap, materialIcon = false, title, tint = COLORS.fade, bordered = false, color = COLORS.dark, backgroundColor = 'transparent', loading = false, leftIcon = null }) => {

    if (!leftIcon) {
        return (
            <Pressable onPress={() => onTap} style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                backgroundColor: pressed ? tint : backgroundColor,
                width: '100%', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
            })}>
                <Text style={{ fontSize: 16, marginLeft: 0, fontFamily: FONTS.medium, color }}>{title}</Text>
                <View style={{ borderRadius: 6, backgroundColor: 'transparent', padding: 4 }}>
                    <Ionicons name="ios-chevron-forward" style={{ fontSize: 20 }} color={COLORS.gray} />
                </View>
            </Pressable>
        );
    } else {
        return (
            <Pressable onPress={() => onTap()} style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                backgroundColor: pressed ? tint : backgroundColor,
                width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'
            })}>
                <View style={{ borderRadius: 6, backgroundColor: tint, padding: 4 }}>
                    {
                        materialIcon
                            ? <MaterialIcons name={leftIcon} style={{ fontSize: 20 }} color={color} />
                            : <Ionicons name={leftIcon} style={{ fontSize: 20 }} color={color} />
                    }
                </View>
                <Text style={{ fontSize: 16, marginLeft: 12, fontFamily: FONTS.medium, color: color }}>{title}</Text>
                <View style={{ borderRadius: 6, position: 'absolute', right: 0, backgroundColor: 'transparent', padding: 4 }}>
                    <Ionicons name="ios-chevron-forward" style={{ fontSize: 20 }} color={COLORS.gray} />
                </View>
            </Pressable>
        );


    }

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

export { ListItem };