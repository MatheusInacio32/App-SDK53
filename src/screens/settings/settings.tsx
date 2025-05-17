// src/screens/settings/Settings.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const { width, height } = Dimensions.get('window');

  const handleLogout = useCallback(async () => {
    await AsyncStorage.multiRemove(['authToken', 'userId']);
    router.replace('login');
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <View className="flex-row justify-between items-center mb-2 mt-8">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={30} color="#FFD700" />
        </TouchableOpacity>
        <Text className="text-2xl text-black" style={{ fontFamily: 'Outfit_700Bold' }}>
          Configurações
        </Text>
        <FontAwesome5 name="cog" size={32} color="black" />
      </View>

      <View className="mt-8">
        <View className="flex-row items-center justify-between border-b border-gray-300 py-2">
          <Text className="text-lg text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
            Tema Escuro
          </Text>
          <Switch value={isDark} onValueChange={setIsDark} />
        </View>

        <TouchableOpacity
          onPress={() => router.push('credits')}
          className="flex-row items-center justify-between border-b border-gray-300 py-4"
        >
          <Text className="text-lg text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
            Créditos
          </Text>
          <FontAwesome5 name="angle-right" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('devinfo')}
          className="flex-row items-center justify-between border-b border-gray-300 py-4"
        >
          <Text className="text-lg text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
            Opções de Desenvolvedor
          </Text>
          <FontAwesome5 name="angle-right" size={20} color="black" />
        </TouchableOpacity>

        {/* Logout no mesmo estilo */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-between border-b border-gray-300 py-4"
        >
          <Text className="text-lg text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
            Sair
          </Text>
          <FontAwesome5 name="angle-right" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          position: 'absolute',
          bottom: 16,
          right: 40,
          fontFamily: 'Outfit_400Regular',
          color: '#9CA3AF',
        }}
      >
        DouUmHelp® Todos os direitos reservados
      </Text>
    </SafeAreaView>
  );
}
