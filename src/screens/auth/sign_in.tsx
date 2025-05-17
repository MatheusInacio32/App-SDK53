import React, { useRef, useState } from 'react';
import { Text, TextInput, View, Image, Animated, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Outfit_700Bold, Outfit_400Regular } from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Outfit_400Regular,
  });

  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [buttonPressed, setButtonPressed] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState(''); 
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const requiredRegex = /\S+/;

  const isNameValid = requiredRegex.test(name);
  const isSurnameValid = requiredRegex.test(surname); 
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = requiredRegex.test(password);
  const isConfirmPasswordValid = requiredRegex.test(confirmPassword);
  const doPasswordsMatch = password === confirmPassword;

  const isFormValid =
    isNameValid &&
    isSurnameValid && 
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    doPasswordsMatch;

  const handlePressIn = () => {
    setButtonPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setButtonPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }
    router.push({
      pathname: 'sign_2',
      params: { name, surname, phone, email, password }
    });
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-xl" style={{ fontFamily: 'Outfit_400Regular' }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={3}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="p-4">
          <View className="flex-1 items-center">
            <View className="flex items-center">
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 300, height: 150, marginBottom: 10, marginTop: 20 }}
              />
              <Text className="text-4xl font-bold text-black" style={{ fontFamily: 'Outfit_700Bold' }}>
                Crie sua conta
              </Text>
              <Text className="mt-2 text-lg text-gray-500" style={{ fontFamily: 'Outfit_400Regular' }}>
                Insira seus dados para começar
              </Text>
            </View>

            <View className="mt-8 w-full px-8">
              {/* Campo Nome */}
              <View className="area-texto flex-row items-center p-1 border-gray-300">
                <TextInput 
                  placeholder="Nome"
                  placeholderTextColor="#6b7280"
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                />
                <MaterialIcons name="account-circle" size={24} color="gray" />
              </View>
              {attemptedSubmit && !isNameValid && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  Campo obrigatório.
                </Text>
              )}

              {/* Campo Sobrenome */}
              <View className="area-texto flex-row items-center p-1 border-gray-300 mt-2">
                <TextInput 
                  placeholder="Sobrenome"
                  placeholderTextColor="#6b7280"
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={surname}
                  onChangeText={(text) => {
                    setSurname(text);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                />
                <MaterialIcons name="account-circle" size={24} color="gray" />
              </View>
              {attemptedSubmit && !isSurnameValid && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  Campo obrigatório.
                </Text>
              )}

              {/* Telefone */}
              <View className="area-texto flex-row items-center p-1 border-gray-300 mt-2">
                <TextInput
                  placeholder="Digite seu telefone (opcional)"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={phone}
                  onChangeText={setPhone}
                />
                <MaterialIcons name="phone" size={24} color="gray" />
              </View>

              {/* E-mail */}
              <View className="area-texto flex-row items-center p-1 border-gray-300 mt-2">
                <TextInput
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                />
                <MaterialIcons name="mail" size={24} color="gray" />
              </View>
              {attemptedSubmit && !isEmailValid && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  Preencha um e-mail válido.
                </Text>
              )}

              {/* Senha */}
              <View className="area-texto flex-row items-center p-1 mt-4 border-gray-300">
                <TextInput
                  placeholder="Digite sua senha"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!passwordVisible}
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                />
                <Pressable onPress={() => setPasswordVisible((prev) => !prev)}>
                  <MaterialIcons
                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="gray"
                  />
                </Pressable>
              </View>
              {attemptedSubmit && !isPasswordValid && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  A senha é obrigatória.
                </Text>
              )}

              {/* Confirmação de Senha */}
              <View className="area-texto flex-row items-center p-1 mt-2 border-gray-300">
                <TextInput
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!passwordVisible}
                  className="flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                />
              </View>
              {attemptedSubmit && !isConfirmPasswordValid && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  Campo obrigatório.
                </Text>
              )}
              {attemptedSubmit && isConfirmPasswordValid && !doPasswordsMatch && (
                <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  As senhas não coincidem.
                </Text>
              )}
            </View>

            <Text className="text-center text-gray-500 mt-4" style={{ fontFamily: 'Outfit_400Regular' }}>
              Já possui uma conta?{' '}
              <Text
                className="text-yellow-500 font-bold"
                onPress={() => router.push('login')}
                style={{ fontFamily: 'Outfit_700Bold' }}
              >
                Faça login
              </Text>
            </Text>

            <View className="mt-3 w-full px-8">
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleSignUp}
                  className={`py-4 rounded-full shadow ${
                    isFormValid ? (buttonPressed ? 'bg-[#FDE018]' : 'bg-[#FACC15]') : 'bg-[#ccc]'
                  }`}
                >
                  <Text className="text-center text-black text-xl font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
                    Próximo
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
