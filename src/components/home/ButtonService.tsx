import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFonts, Outfit_400Regular } from '@expo-google-fonts/outfit';

export function ButtonFab() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#33322d" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8} 
      onPress={() => router.push('services')}
      className="absolute bottom-3 right-3 flex-row items-center bg-[#33322d] px-4 py-3 rounded-full shadow-lg z-50"
    >
      <MaterialCommunityIcons name="tools" color="white" size={28} />
      <Text
        className="ml-2 text-white"
        style={{ fontFamily: 'Outfit_400Regular', fontSize: 16 }}
      >
        Meus Serviços
      </Text>
    </TouchableOpacity>
  );
}
