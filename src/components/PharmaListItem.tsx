import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ButtonProps {
    code: string,
    color: string,
    address: string,
    backgroundColor: string,
    tint?: string,
    name: string;
    onTap?: Function;
}

const PharmaListItem: React.FC<ButtonProps> = ({ onTap, code, address, name, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', }) => {

    return (
        <Pressable onPress={onTap ? () => onTap(code) : () => { }} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : backgroundColor,
            overflow: 'hidden',
            width: '100%', position: 'relative', paddingHorizontal: 12, paddingVertical: 18, borderRadius: 10, marginBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'
        })}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, alignItems: 'flex-start' }}>
                <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 8, padding: 4, width: 28 }}>
                    <MaterialIcons name='hospital-building' style={{ fontSize: 20 }} color={COLORS.pallete_deep} />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, flexShrink: 1, textAlign: 'left', overflow:'hidden', paddingRight: 8, fontFamily: FONTS.medium, color: COLORS.gray}}>{name}</Text>
                </View>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 8, padding: 4, width: 28 }}>
                    <MaterialIcons name='hospital-marker' style={{ fontSize: 20 }} color={COLORS.pallete_deep} />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, flexShrink: 1, textAlign: 'left', overflow:'hidden', paddingRight: 8, fontFamily: FONTS.medium, color: COLORS.gray }}>{address}</Text>
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

export { PharmaListItem };