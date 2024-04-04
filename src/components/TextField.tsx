import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Platform
} from 'react-native';
import { COLORS, SIZES, FONTS } from "../constants";
import Ionicons from '@expo/vector-icons/Ionicons';

interface TextFieldProps {
    label: string;
    icon?: string | null;
    value?: string | null | undefined;
    isSecure?: boolean;
    isNumber?: boolean;
    isPhone?: boolean;
    isEmail?: boolean;
    hasIcon?: boolean;
    isDisabled?: boolean;
    hide?: boolean;
    handleChange: Function;
    passBlur?: Function;
    prefix?: string;
    lines?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
    isSecure = false,
    handleChange,
    passBlur = () => { },
    label,
    isNumber = false,
    isEmail = false,
    isPhone = false,
    icon = 'person',
    hasIcon = false,
    isDisabled = false,
    lines = 1,
    value,
    prefix
}) => {
    const [isPassword, setIsPassword] = useState(false);
    const [focus, setFocus] = useState(false);
    const [hidden, setHidden] = useState(false);

    const [defaultValue, setValue] = useState('');

    useEffect(() => {
        if (value) {
            setValue(value);
            handleChange(value);
        }
    }, [value]);
    useEffect(() => {
        setIsPassword(isSecure);
        setHidden(isSecure);
    }, []);
    if (prefix) {
        return (
            <View style={[styles.iconContainer, { borderColor: focus ? COLORS.primary : COLORS.gray, borderWidth: focus ? 2 : 1, opacity: isDisabled ? 0.4 : 1 }]}>
                <Text style={{
                    marginRight: 3, fontSize: SIZES.medium,
                    fontFamily: FONTS.medium,
                    color: COLORS.gray,
                    height: 50,
                    marginTop: Platform.OS === 'android'? 0:  30,
                    textAlignVertical: 'center',
                    textAlign: 'center',
                    alignSelf: 'center'
                }}>{prefix}</Text>
                <TextInput
                    placeholder={label}
                    autoCapitalize="none"
                    defaultValue={defaultValue || undefined}
                    // autoComplete={isPhone ? 'tel' : isEmail ? 'email' : 'name'}
                    keyboardType={isPhone ? 'phone-pad' : isNumber ? 'numeric' : 'default'}
                    secureTextEntry={hidden}
                    onChangeText={(text) => handleChange(text)}
                    onFocus={() => setFocus(true)}
                    onEndEditing={() => setFocus(false)}
                    onBlur={(text) => {
                        passBlur(text);
                    }}
                    editable={!isDisabled}
                    focusable={!isDisabled}
                    style={{ ...styles.iconTextField, width: '90%', opacity: isDisabled ? 0.4 : 1 }}
                    placeholderTextColor={COLORS.gray}
                />
                {isPassword && hidden
                    ? <Ionicons name={'eye-sharp'} onPress={() => setHidden(false)} style={{ width: '5%', fontSize: SIZES.large, marginRight: 10, padding: 0 }} color={COLORS.dark} />
                    : isPassword && !hidden
                        ? <Ionicons name={'eye-off'} onPress={() => setHidden(true)} style={{ width: '5%', fontSize: SIZES.large, marginRight: 10, padding: 0 }} color={COLORS.dark} />
                        : null
                }
            </View>
        );
    }
    if (hasIcon && icon !== null) {
        return (
            <View style={[styles.iconContainer, { borderColor: focus ? COLORS.primary : COLORS.gray, borderWidth: focus ? 2 : 1, opacity: isDisabled ? 0.4 : 1 }]}>
                <Ionicons name={icon || 'person'} style={{ width: '5%', fontSize: SIZES.medium, marginRight: 10, padding: 0 }} color={COLORS.dark} />
                <TextInput
                    placeholder={label}
                    autoCapitalize="none"
                    defaultValue={defaultValue || undefined}
                    // autoComplete={isPhone ? 'tel' : isEmail ? 'email' : 'name'}
                    keyboardType={isPhone ? 'phone-pad' : isNumber ? 'numeric' : 'default'}
                    secureTextEntry={hidden}
                    onChangeText={(text) => handleChange(text)}
                    onFocus={() => setFocus(true)}
                    onEndEditing={() => setFocus(false)}
                    onBlur={(text) => {
                        passBlur(text);
                    }}
                    editable={!isDisabled}
                    focusable={!isDisabled}
                    style={{ ...styles.iconTextField, width: '90%', opacity: isDisabled ? 0.4 : 1 }}
                    placeholderTextColor={COLORS.gray}
                />
                {isPassword && hidden
                    ? <Ionicons name={'eye-sharp'} onPress={() => setHidden(false)} style={{ width: '5%', fontSize: SIZES.large, marginRight: 10, padding: 0 }} color={COLORS.dark} />
                    : isPassword && !hidden
                        ? <Ionicons name={'eye-off'} onPress={() => setHidden(true)} style={{ width: '5%', fontSize: SIZES.large, marginRight: 10, padding: 0 }} color={COLORS.dark} />
                        : null
                }
            </View>
        );
    }
    return (
        <View style={{...styles.container, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <TextInput
                placeholder={label}
                placeholderTextColor={COLORS.gray}
                autoCapitalize="none"
                defaultValue={defaultValue || undefined}
                // autoComplete={isPhone ? 'tel' : isEmail ? 'email' : 'name'}
                keyboardType={isPhone ? 'phone-pad' : isNumber ? 'numeric' : 'default'}
                secureTextEntry={isPassword}
                onChangeText={(text) => handleChange(text)}
                onFocus={() => setFocus(true)}
                onEndEditing={() => setFocus(false)}
                onBlur={(text) => passBlur(text)}
                editable={!isDisabled}
                focusable={!isDisabled}
                numberOfLines={lines}
                multiline={lines > 1 ? true: false}

                style={[styles.textField, {flexShrink: 1, borderColor: focus ? COLORS.primary : COLORS.gray, borderWidth: focus ? 2 : 1, opacity: isDisabled ? 0.4 : 1 }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        minHeight: 66,
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
    iconTextField: {
        flex: 1,
        height: 60,
        fontSize: SIZES.medium,
        fontFamily: FONTS.medium,
        color: COLORS.dark,
    },
    textField: {
        flex: 1,
        minHeight: 60,
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
