import React, { useContext } from "react";
import {
    Text,
    Link,
    HStack,
    Center,
    Heading,
    Switch,
    useColorMode,
    NativeBaseProvider,
    extendTheme,
    VStack,
    Box,
    Button,
    Image,
    AspectRatio,
    Pressable,
} from "native-base";
import { SafeAreaView, View } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { LandingAuthScreenNavigationProp } from "../navigation/auth/types";
import { ButtonWithTitle } from "../components/ButtonWithTitle";
import { COLORS } from "../constants";

// Define the config
const config = {
    useSystemColorMode: false,
    initialColorMode: "light",
};

// extend the theme
export const theme = extendTheme({
    colors: {
        primary: {
            100: '#52A56E',
            200: '#C6C6C6'
        }
    },
    config
});
type MyThemeType = typeof theme;
declare module "native-base" {
    interface ICustomTheme extends MyThemeType { }
}
const LandingScreen = () => {
    const navigation = useNavigation<LandingAuthScreenNavigationProp>();
    const { login } = useContext(AuthContext);
    return (
        <NativeBaseProvider theme={theme}>
            <Center
                _dark={{ bg: "blueGray.900" }}
                _light={{ bg: "primary.100" }}
                px={3}
                flex={1}
                py={4}
                position="relative"
            >
                <VStack space={5} w={'full'} alignItems="center">
                    <Box>
                        <Heading size="2xl" color={'white'} fontWeight={"light"}>Upcycling for a </Heading>
                        <Heading size="2xl" color={'white'} fontWeight={"extrabold"} mb={"10"}>healthier society </Heading>
                    </Box>
                    <VStack w={'full'} space={2}>
                        <ButtonWithTitle
                            noBg={false}
                            loading={false}
                            title={'LOG IN'}
                            width={'100%'}
                            backgroundColor={COLORS.white}
                            color={COLORS.primary}
                            onTap={() => navigation.navigate('UserAuth', {
                                page: "login",
                            })}
                        />
                        <ButtonWithTitle
                            noBg={false}
                            title={'SIGN UP'}
                            loading={false}
                            backgroundColor={'transparent'}
                            bordered={true}
                            color={COLORS.white}
                            onTap={() => navigation.navigate('UserAuth', {
                                page: "signup"
                            })}
                            width={'100%'}
                        />
                    </VStack>
                </VStack>
                <Box safeAreaBottom position={"absolute"} bottom={0} mb={'2'}>
                    <HStack space={2} alignItems="center">
                        <Text color={'primary.200'}>Are you an agent?</Text>
                        <Link onPress={() => navigation.navigate('AgentAuth')}>
                            <Text _light={{ color: 'white' }} _dark={{ color: 'primary.100' }} underline>
                                Login here
                            </Text>
                        </Link>
                    </HStack>

                </Box>
            </Center>
        </NativeBaseProvider>
    );
};

// Color Switch Component
function ToggleDarkMode() {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <HStack space={2} mt={"10"} alignItems="center">
            <Text>Dark</Text>
            <Switch
                isChecked={colorMode === "light"}
                onToggle={toggleColorMode}
                aria-label={
                    colorMode === "light" ? "switch to dark mode" : "switch to light mode"
                }
            />
            <Text>Light</Text>
        </HStack>
    );
}

export default LandingScreen;
