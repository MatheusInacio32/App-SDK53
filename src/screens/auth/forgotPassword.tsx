import React, { useState } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';

export default function ForgotPassword() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold,
  });
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  
  const handleNext = () => {
    if (!isEmailValid) return;
    setShowSuccess(true);
    setTimeout(() => {
      router.push('inicialhome');
    }, 2000);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-lg text-black">
          Carregando...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white px-4">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 justify-center items-center">
              <Text className="text-3xl font-bold text-black mb-8" style={{ fontFamily: 'Outfit_700Bold' }}>
                Recuperar Senha
              </Text>
              <Text className="text-base text-black mb-4" style={{ fontFamily: 'Outfit_400Regular' }}>
                Digite seu e-mail para receber uma nova senha.
              </Text>
              <View className="w-full mb-4">
                <TextInput
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base text-black"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  placeholder="Digite seu e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text: string) => setEmail(text)}
                />
              </View>
              <Pressable
                onPress={handleNext}
                className={`w-full py-4 rounded-full items-center ${isEmailValid ? 'bg-yellow-400' : 'bg-gray-300'}`}
              >
                <Text className="text-xl font-bold text-black" style={{ fontFamily: 'Outfit_700Bold' }}>
                  Próximo
                </Text>
              </Pressable>
              {showSuccess && (
                <View className="mt-4 bg-green-200 rounded-lg p-4">
                  <Text className="text-base text-green-800" style={{ fontFamily: 'Outfit_400Regular' }}>
                    código enviado, verifique seu email
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
