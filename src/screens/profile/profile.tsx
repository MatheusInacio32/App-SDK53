import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import MaskInput from 'react-native-mask-input';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function Perfil() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const params = useLocalSearchParams<{ newPassword?: string }>();
  const [userData, setUserData] = useState({
    nome: 'João',
    sobrenome: 'Silva',
    telefone: '(11) 99999-8888',
    email: 'joao.silva@email.com',
    senha: 'senha123',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const saveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (params.newPassword) {
      setUserData(prev => ({ ...prev, senha: params.newPassword! }));
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    }
  }, [params.newPassword]);

  const handleSelectImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setProfileImage(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(() => {
    setSuccessMessage('Alterações salvas com sucesso!');
    setTimeout(() => {
      setSuccessMessage('');
      router.push('home');
    }, 2000);
  }, []);

  const onPressInSave = useCallback(() => {
    Animated.spring(saveAnim, { toValue: 0.95, useNativeDriver: true }).start();
  }, [saveAnim]);

  const onPressOutSave = useCallback(() => {
    Animated.spring(saveAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    handleSave();
  }, [saveAnim, handleSave]);

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-gray-100`}
    >
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`mt-6 ml-4`}>
          <FontAwesome5 name="arrow-left" size={24} color="#FACC15" />
        </TouchableOpacity>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={tw`px-6 pt-4`}>
            <View style={tw`bg-white rounded-2xl p-6 items-center shadow-md mb-8`}>
              <TouchableOpacity onPress={handleSelectImage} style={tw`mb-4`}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('../../assets/placeholder.png')
                  }
                  style={tw`w-30 h-30 rounded-full border-4 border-yellow-400`}
                />
                <View style={tw`absolute bottom-0 right-6 bg-yellow-500 p-2 rounded-full`}>
                  <FontAwesome name="pencil" size={16} color="white" />
                </View>
              </TouchableOpacity>
              <View style={tw`w-full space-y-4`}>
                <View>
                  <Text style={[tw`text-lg text-gray-800 mb-1`, { fontFamily: 'Outfit_700Bold' }]}>
                    Nome
                  </Text>
                  <TextInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-full px-4 py-3`}
                    value={userData.nome}
                    onChangeText={text => setUserData(prev => ({ ...prev, nome: text }))}
                    placeholder="Nome"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                <View>
                  <Text style={[tw`text-lg text-gray-800 mb-1`, { fontFamily: 'Outfit_700Bold' }]}>
                    Sobrenome
                  </Text>
                  <TextInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-full px-4 py-3`}
                    value={userData.sobrenome}
                    onChangeText={text => setUserData(prev => ({ ...prev, sobrenome: text }))}
                    placeholder="Sobrenome"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                <View>
                  <Text style={[tw`text-lg text-gray-800 mb-1`, { fontFamily: 'Outfit_700Bold' }]}>
                    Telefone
                  </Text>
                  <MaskInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-full px-4 py-3`}
                    value={userData.telefone}
                    onChangeText={masked =>
                      setUserData(prev => ({ ...prev, telefone: masked }))
                    }
                    mask={[
                      '(', /\d/, /\d/, ')', ' ',
                      /\d/, /\d/, /\d/, /\d/, /\d/, '-',
                      /\d/, /\d/, /\d/, /\d/,
                    ]}
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text style={[tw`text-lg text-gray-800 mb-1`, { fontFamily: 'Outfit_700Bold' }]}>
                    E-mail
                  </Text>
                  <TextInput
                    style={tw`bg-gray-50 border border-gray-200 rounded-full px-4 py-3`}
                    value={userData.email}
                    onChangeText={text => setUserData(prev => ({ ...prev, email: text }))}
                    placeholder="email@exemplo.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View>
                  <Text style={[tw`text-lg text-gray-800 mb-1`, { fontFamily: 'Outfit_700Bold' }]}>
                    Senha
                  </Text>
                  <TouchableOpacity onPress={() => router.push(`senha?currentPassword=${userData.senha}`)}>
                    <View style={tw`bg-gray-50 border border-gray-200 rounded-full px-4 py-3 flex-row justify-between items-center`}>
                      <Text style={[tw`text-gray-600`, { fontFamily: 'Outfit_400Regular' }]}>
                        ********
                      </Text>
                      <FontAwesome name="angle-right" size={20} color="gray" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Animated.View style={[tw`px-6`, { transform: [{ scale: saveAnim }] }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPressIn={onPressInSave}
                onPressOut={onPressOutSave}
                style={tw`bg-yellow-500 py-4 rounded-full items-center shadow-lg`}
              >
                <Text style={[tw`text-white text-lg`, { fontFamily: 'Outfit_700Bold' }]}>
                  Salvar Alterações
                </Text>
              </TouchableOpacity>
            </Animated.View>
            {successMessage ? (
              <Text style={tw`mt-4 text-green-600 text-center font-semibold`}>
                {successMessage}
              </Text>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
