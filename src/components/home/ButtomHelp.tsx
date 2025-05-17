import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type ButtomHelpProps = {
  onPress: () => void;
  fontRegular?: string;
  fontBold?: string;
};
export function ButtomHelp({ onPress, fontRegular, fontBold }: ButtomHelpProps) {
  const router = useRouter();
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      style={{ paddingHorizontal: 16, marginTop: 16 }}
    >
      <Pressable
        style={{
          backgroundColor: '#FACC15',
          paddingVertical: 16,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4
        }}
        onPress={() => router.push('requisicao')}
      >
        <FontAwesome name="handshake-o" size={20} color="black" />
        <Text style={{ color: 'black', fontSize: 16, marginLeft: 8, fontFamily: fontBold }}>
          Solicitar um HELP
        </Text>
      </Pressable>
    </Animatable.View>
  );
}
