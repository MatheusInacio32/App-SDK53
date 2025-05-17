import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';

export default function Senha() {
  const { currentPassword } = useLocalSearchParams<{ currentPassword?: string }>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const animatedSenha = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  if (!fontsLoaded) return null;
  const handleChangePassword = () => {
    if (oldPassword === currentPassword) {
      setMessage('Senha alterada com sucesso!');
      setTimeout(() => {
        router.push(`perfil?newPassword=${newPassword}`);
      }, 2000);
    } else {
      setMessage('Senha atual incorreta.');
    }
  };
  const onPressInSenha = () => {
    Animated.spring(animatedSenha, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOutSenha = () => {
    Animated.spring(animatedSenha, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    handleChangePassword();
  };
  return (
    <KeyboardAvoidingView style={tw`flex-1 bg-white`} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={tw`flex-1 p-4`}>
          <Text style={[tw`text-2xl font-bold mb-4 text-gray-800 mt-10`, { fontFamily: 'Outfit_700Bold' }]}>Trocar Senha</Text>
          <Text style={[tw`text-lg font-bold text-gray-800`, { fontFamily: 'Outfit_700Bold' }]}>Senha Atual</Text>
          <TextInput style={[tw`border border-gray-300 rounded-full p-2 mb-4`, { fontFamily: 'Outfit_400Regular' }]} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
          <Text style={[tw`text-lg font-bold text-gray-800`, { fontFamily: 'Outfit_700Bold' }]}>Nova Senha</Text>
          <TextInput style={[tw`border border-gray-300 rounded-full p-2 mb-4`, { fontFamily: 'Outfit_400Regular' }]} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <TouchableOpacity activeOpacity={1} onPressIn={onPressInSenha} onPressOut={onPressOutSenha}>
            <Animated.View style={[tw`bg-yellow-500 rounded-full p-3 items-center`, { transform: [{ scale: animatedSenha }] }]}>
              <Text style={[tw`text-white text-lg`, { fontFamily: 'Outfit_700Bold' }]}>Alterar Senha</Text>
            </Animated.View>
          </TouchableOpacity>
          {message ? <Text style={tw`mt-4 text-center ${message.includes('sucesso') ? 'text-green-500' : 'text-red-500'}`}>{message}</Text> : null}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
