import React from 'react';
import { Spinner, VStack, Center } from 'native-base';
import { COLORS } from '../constants';

const Loading = ({ height = 16 }) => {
    return (
        <VStack
            size="lg"
            height={height}
            width="100%"
            justifyContent="center"
            alignItems="center"
            mt="10"
        >
            <Center flex={1} px="3">
                <Spinner color={COLORS.primary} size="lg" />
            </Center>
        </VStack>
    );
};

export default Loading;
