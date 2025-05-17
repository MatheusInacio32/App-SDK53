import React, { useRef, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit'
import axios, { AxiosError } from 'axios'
import { apiUrl } from 'src/api/apiconfig'

export default function ConfirmEmail() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold })
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const scale = useRef(new Animated.Value(1)).current
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [feedback, setFeedback] = useState({ text: '', success: false })

  const valid = useMemo(() => code.length === 6, [code])

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start()
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start()

  const confirm = async () => {
    if (!valid) {
      setTouched(true)
      return
    }
    try {
      const { data } = await axios.post(`${apiUrl}/auth/confirm-email`, { email, code })
      setFeedback({ text: data.message || 'E-mail validado com sucesso!', success: true })
      setTimeout(() => router.push('/home'), 1000)
    } catch (err: unknown) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.message || 'Código inválido'
          : 'Erro ao confirmar o código'
      setFeedback({ text: msg, success: false })
    }
  }

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text style={{ fontFamily: 'Outfit_400Regular' }}>Carregando...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={3}
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-6 justify-center items-center">
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 300, height: 150, marginBottom: 30 }}
        />

        <Text className="text-4xl text-black" style={{ fontFamily: 'Outfit_700Bold' }}>
          Confirme seu e-mail
        </Text>
        <Text
          className="mt-2 text-base text-gray-700 text-center"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Um código de verificação de 6 dígitos foi enviado para:
        </Text>
        <Text
          className="mt-1 text-base text-black font-bold"
          style={{ fontFamily: 'Outfit_700Bold' }}
        >
          {email}
        </Text>

        <View className="w-full px-8 mt-8">
          <Text className="text-xl text-gray-700" style={{ fontFamily: 'Outfit_400Regular' }}>
            Código
          </Text>
          <TextInput
            className="border-b border-gray-300 mt-2 text-2xl text-center tracking-widest py-2"
            placeholder="______"
            placeholderTextColor="#6B7280"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={t => {
              setCode(t)
              touched && setTouched(false)
            }}
            style={{ fontFamily: 'Outfit_400Regular' }}
          />
          {touched && !valid && (
            <Text
              className="text-red-500 text-xs mt-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Digite um código de 6 dígitos
            </Text>
          )}
        </View>

        <View className="w-full px-8 mt-4">
          {feedback.text !== '' && (
            <View
              className={`p-3 rounded-lg mb-2 ${
                feedback.success ? 'bg-green-200' : 'bg-red-200'
              }`}
            >
              <Text
                className={`text-center ${
                  feedback.success ? 'text-green-700' : 'text-red-700'
                }`}
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {feedback.text}
              </Text>
            </View>
          )}
          <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={confirm}
              className={`py-4 rounded-full shadow ${
                valid ? 'bg-yellow-400' : 'bg-gray-300'
              }`}
            >
              <Text
                className="text-center text-xl text-black font-bold"
                style={{ fontFamily: 'Outfit_700Bold' }}
              >
                Confirmar
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
