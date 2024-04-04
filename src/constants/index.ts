export const COLORS = {
    primary: "#52A56E",
    screenBg: "#050613",
    secondary: "#F2BA53",
    white: '#FFFFFF',
    gray: "#7C7C7C",
    negative: '#FF0E00',
    positive: '#18AB15',
    fade: '#eeeeee',
    dark: '#181725',
    pallete_white: '#F6FBF4',
    pallete_cream: '#F5DF99',
    pallete_green: '#5FD068',
    pallete_deep: '#4B8673'
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    heading: 26
};

export const FONTS = {
    bold: "PoppinsBold",
    semiBold: "PoppinsSemiBold",
    medium: "PoppinsMedium",
    regular: "PoppinsRegular",
    light: "PoppinsLight",
    interBold: "InterBold",
    interSemiBold: "InterSemiBold",
    interMedium: "InterMedium",
    interRegular: "InterRegular",
    interLight: "InterLight",
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    medium: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
    },
    dark: {
        shadowColor: COLORS.gray,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,

        elevation: 14,
    },
};
