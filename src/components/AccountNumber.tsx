import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text
} from 'react-native';
import { COLORS, SIZES, FONTS } from "../constants";
import Ionicons from '@expo/vector-icons/Ionicons';

interface AccountNumberFieldProps {
    label: string;
    value?: string | null | undefined;
    isDisabled?: boolean;
    handleChange: Function;
    passBlur?: Function;
}

export const AccountNumberField: React.FC<AccountNumberFieldProps> = ({
    handleChange,
    passBlur = () => { },
    label,
    isDisabled = false,
    value
}) => {
    const [focus, setFocus] = useState(false);
    const [defaultValue, setValue] = useState('');
    useEffect(() => {
        if (value) {
            setValue(value);
            // handleChange(value);
        }
    }, [value]);

    return (
        <View style={styles.container}>
            <TextInput
                placeholder={label}
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                defaultValue={defaultValue && defaultValue}
                keyboardType={'numeric'}
                onChangeText={(text) => handleChange(text)}
                onFocus={() => setFocus(true)}
                onEndEditing={() => setFocus(false)}
                onBlur={(text) => passBlur(text)}
                editable={!isDisabled}
                focusable={!isDisabled}
                style={[styles.accountNumberField, { borderColor: focus ? COLORS.primary : COLORS.gray, borderWidth: focus ? 2 : 1, opacity: isDisabled ? 0.4 : 1 }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        height: 66,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 30
    },
    iconContainer: {
        flexDirection: 'row',
        height: 66,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 20,
        width: '100%'
    },
    iconAccountNumberField: {
        flex: 1,
        height: 50,
        fontSize: SIZES.medium,
        fontFamily: FONTS.medium,
        color: COLORS.dark,
    },
    accountNumberField: {
        flex: 1,
        height: 50,
        fontSize: SIZES.medium,
        fontFamily: FONTS.medium,
        color: COLORS.dark,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 20,
        width: '100%'
    },
    label: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.semiBold,
        color: COLORS.gray,
        marginBottom: 10
    }
});
