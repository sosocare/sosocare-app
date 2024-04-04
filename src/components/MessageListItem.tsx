import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { COLORS, FONTS } from '../constants';

interface ButtonProps {
    message: string,
    sender?: string,
    id?: string,
    date: string,
    color: string,
    backgroundColor: string,
    tint?: string,
    title?: string,
    type?: string,
    loading: boolean;
    read: boolean;
    onTap?: Function;
}

const MessageListItem: React.FC<ButtonProps> = ({ message, onTap, id, title, sender, read, type, tint = COLORS.fade, color = COLORS.dark, backgroundColor = 'transparent', loading = false, }) => {
    return (
        <Pressable onPress={onTap ? () => onTap(id) : () => { }} style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            backgroundColor: pressed ? tint : read ?  backgroundColor : type === 'answer'? COLORS.pallete_green :!read ? tint : backgroundColor,
            overflow: 'hidden',
            width: '100%', position: 'relative', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'
        })}>
            <View style={{ borderRadius: 20, backgroundColor: type === 'answer'? COLORS.white : tint, marginRight: 10, padding: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: COLORS.primary, fontSize: 20, fontFamily: FONTS.semiBold, textAlign: 'center' }}>{sender ? sender.charAt(0) : 'D'}</Text>
            </View>
            <View style={{ flexDirection: 'column', flex: 1, width: '90%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text numberOfLines={1} style={{ fontSize: 16, width: '100%', fontFamily: FONTS.semiBold, marginRight: 6, color: type === 'answer'? COLORS.white : COLORS.dark }}>{sender ? sender : 'Doctor'}</Text>
                {type === 'answer' ?
                    <Text numberOfLines={1} style={{ fontSize: 16, width: '100%', overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.white }}>{title? title + ": " : ""}{message}</Text>

                    : <Text numberOfLines={1} style={{ fontSize: 16, width: '100%', overflow: 'hidden', fontFamily: FONTS.medium, color: COLORS.gray }}>{message}</Text>}
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

export { MessageListItem };