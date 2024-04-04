import { View, Text } from 'react-native';
import React, { useEffect } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import {
    Actionsheet,
    useDisclose
} from "native-base";

import { ButtonWithTitle } from './ButtonWithTitle';
import { COLORS, FONTS } from '../constants';



const SuccessSheet = ({ message, open, closed }) => {
    const {
        isOpen,
        onOpen,
        onClose
    } = useDisclose();
    useEffect(() => {
        if (open) onOpen();
    }, [open]);
    const close = () => {
        closed();
        onClose();
    };
    return (
        <Actionsheet safeAreaBottom isOpen={isOpen} onClose={close} style={{ width: '100%' }}>
            <Actionsheet.Content>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="ios-checkmark-circle" style={{ fontSize: 66, marginRight: 0, padding: 0 }} color={COLORS.primary} />
                </View>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', paddingHorizontal: 6, color: COLORS.primary, fontSize: 14, fontFamily: FONTS.medium, marginTop: 18 }}>{message}</Text>
                </View>

                <Actionsheet.Item onPress={onClose} style={{ width: '100%', marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <ButtonWithTitle loading={false} title={'OK'} backgroundColor={'transparent'} bordered color={COLORS.primary} width={'100%'} onTap={close} />
                    </View>
                </Actionsheet.Item>
            </Actionsheet.Content>
        </Actionsheet>
    );
};

export default SuccessSheet;