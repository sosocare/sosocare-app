import { View, Text } from 'react-native';
import React from 'react';
import { COLORS } from '../../constants';
const ChatScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ color: COLORS.dark }}>Agent ChatScreen</Text>
    </View>
  );
};

export default ChatScreen;