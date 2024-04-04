import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants';
import {
    Spinner
} from "native-base";

interface ButtonProps {
    onTap: Function;
    width: string | number;
    title: string,
    color: string,
    backgroundColor: string,
    noBg?: boolean;
    loading: boolean;
    bordered?: boolean;
    size?: string
}

const ButtonWithTitle: React.FC<ButtonProps> = ({ onTap, width, title, noBg = false, bordered = false, color = COLORS.dark, backgroundColor = 'transparent', loading = false, size = 'md' }) => {

    if (noBg) {
        return (
            <TouchableOpacity disabled={loading} style={[styles.btn, { width, backgroundColor: 'transparent', paddingVertical: size === 'md' ? 24 : size === 'sm' ? 12 : 0  }, loading && styles.loading]}
                onPress={() => onTap()}
            >
                {loading
                    ? <Spinner color={color} />
                    : <Text style={{ fontSize: 16, color, fontFamily: FONTS.semiBold }}>{title}</Text>
                }
            </TouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity disabled={loading} style={[styles.btn, { width, backgroundColor, paddingVertical: size === 'md' ? 24 : size === 'sm' ? 12 : 0 }, bordered && { borderColor: color, borderWidth: 1 }, loading && styles.loading]}
                onPress={() => onTap()}
            >
                {loading
                    ? <Spinner color={color} />
                    : <Text style={{ fontSize: 16, color, fontFamily: FONTS.semiBold }}>{title}</Text>
                }
            </TouchableOpacity>
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

export { ButtonWithTitle };