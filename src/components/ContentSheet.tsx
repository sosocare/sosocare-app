import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
    Actionsheet,
    useDisclose
} from "native-base";
import { ButtonWithTitle } from './ButtonWithTitle';
import { COLORS } from '../constants';

const voidFunction = () => {}

const ContentSheet = ({ open, closed, content, hasSecondAction=false, secondAction=voidFunction, secondActionTitle='' }) => {
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
                {content}
                {hasSecondAction && <Actionsheet.Item onPress={onClose} style={{ width: '100%', marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <ButtonWithTitle loading={false} title={secondActionTitle ? secondActionTitle : ''} backgroundColor={'transparent'} bordered color={COLORS.primary} width={'100%'} onTap={() => {
                            onClose()
                            return secondAction();
                        }} />
                    </View>
                </Actionsheet.Item>}
                <Actionsheet.Item onPress={onClose} style={{ width: '100%', marginTop: hasSecondAction ? 0 : 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <ButtonWithTitle loading={false} title={'CLOSE'} backgroundColor={'transparent'} bordered color={COLORS.dark} width={'100%'} onTap={close} />
                    </View>
                </Actionsheet.Item>
            </Actionsheet.Content>
        </Actionsheet>
    );
};

export default ContentSheet;