import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';
import IonIcons from '@expo/vector-icons/Ionicons';

interface ButtonProps {
    id: string,
    color: string,
    address: string,
    backgroundColor: string,
    tint?: string,
    description: string;
    onTap?: Function;
}

const AgentListItem: React.FC<ButtonProps> = ({ onTap, id, address, description, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', }) => {

    return (
        <Pressable onPress={onTap ? () => onTap(id) : () => { }} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : backgroundColor,
            overflow: 'hidden',
            width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'
        })}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 4, alignItems: 'center' }}>
                <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 6, padding: 4, width: 28 }}>
                    <IonIcons name='person-outline' style={{ fontSize: 20 }} color={COLORS.pallete_deep} />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Text numberOfLines={1} style={{ fontSize: 16, flexShrink: 1, textAlign: 'left', overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.gray}}>{description}</Text>
                </View>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <View style={{ borderRadius: 6, backgroundColor: tint, marginRight: 6, padding: 4, width: 28 }}>
                    <IonIcons name='ios-location-outline' style={{ fontSize: 20 }} color={COLORS.pallete_deep} />
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Text numberOfLines={1} style={{ fontSize: 16, flexShrink: 1, textAlign: 'left', overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.gray }}>{address}</Text>
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

export { AgentListItem };