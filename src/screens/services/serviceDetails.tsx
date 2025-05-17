import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from 'src/api/apiconfig'; 


export default function PreChat() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const serviceId = Array.isArray(params.serviceId) ? params.serviceId[0] : params.serviceId
  const providerName = Array.isArray(params.providerName)
    ? params.providerName[0]
    : params.providerName
  const categoryName = Array.isArray(params.categoryName)
    ? params.categoryName[0]
    : params.categoryName

  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold })

  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [description, setDescription] = useState('')
  const [attemptedReportSubmit, setAttemptedReportSubmit] = useState(false)
  const [hasReported, setHasReported] = useState(false)

  const [deal, setDeal] = useState<null | { userPJ: { id: string; firstName: string; lastName: string } }>(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [rating, setRating] = useState(0)
  const [textFeedback, setTextFeedback] = useState('')
  const [attemptedRatingSubmit, setAttemptedRatingSubmit] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  useEffect(() => {
    const fetchDeal = async () => {
      if (!serviceId) return;
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;
        const res = await axios.get(`${apiUrl}/order-request/${serviceId}/accepted-deal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeal(res.data);
      } catch (err) {
        console.warn('Erro ao buscar deal:', err);
      }
    };
  
    fetchDeal();
  }, [serviceId]);

  if (!fontsLoaded) return null

  const handleSendReport = () => {
    if (!description.trim()) {
      setAttemptedReportSubmit(true)
      return
    }
    Alert.alert(
      'Confirmação',
      'Deseja realmente criar denúncia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => {
            setReportModalVisible(false)
            setHasReported(true)
            setDescription('')
            setAttemptedReportSubmit(false)
            Alert.alert('Sucesso', 'Denúncia enviada com sucesso.')
          },
        },
      ],
      { cancelable: false }
    )
  }
  
  const handleSendRating = () => {
    if (rating <= 0) {
      setAttemptedRatingSubmit(true)
      return
    }
    Alert.alert(
      'Confirmação',
      `Deseja enviar avaliação de ${rating} estrela(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => {
            setFeedbackModalVisible(false)
            setHasRated(true)
            setAttemptedRatingSubmit(false)
            Alert.alert('Obrigado', 'Avaliação enviada com sucesso.')
          },
        },
      ],
      { cancelable: false }
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <ScrollView
        className="p-4 mt-8 ml-3"
        scrollEnabled={!reportModalVisible && !feedbackModalVisible}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <FontAwesome5 name="arrow-left" size={24} color="#FACC15" />
        </TouchableOpacity>

        <View className="bg-white rounded-2xl p-6 shadow-md">
          <Text className="font-bold text-2xl mb-2">
            {categoryName || 'Serviço não informado'}
          </Text>
          <Text className="font-normal text-gray-600 mb-4">
            Prestador: {providerName ? decodeURIComponent(providerName) : 'Não informado'}
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (!deal?.userPJ?.id) {
                Alert.alert('Erro', 'ID do prestador não encontrado');
                return;
              }
              router.push({
                pathname: 'chat',
                params: {
                  orderId: serviceId,
                  otherUserId: deal.userPJ.id,
                  name: providerName,
                },
              });
            }}
            className="bg-yellow-400 active:bg-yellow-300 py-4 rounded-full flex-row items-center justify-center mb-3"
          >
            <FontAwesome5 name="comments" size={20} color="black" />
            <Text className="font-bold text-base ml-2">Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('profile')}
            className="bg-yellow-400 active:bg-yellow-300 py-4 rounded-full flex-row items-center justify-center mb-3"
          >
            <FontAwesome5 name="user" size={20} color="black" />
            <Text className="font-bold text-base ml-2">Perfil do profissional</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={hasRated}
            onPress={() => setFeedbackModalVisible(true)}
            className={`py-4 rounded-full flex-row items-center justify-center mb-3 ${
              hasRated ? 'bg-gray-300' : 'bg-green-400 active:bg-green-500'
            }`}
          >
            <FontAwesome5 name="star" size={20} color="black" />
            <Text className="font-bold text-base ml-2">
              {hasRated ? 'Serviço Avaliado' : 'Confirmar conclusão'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={hasReported}
            onPress={() => setReportModalVisible(true)}
            className={`py-4 rounded-full flex-row items-center justify-center ${
              hasReported ? 'bg-gray-300' : 'bg-red-400 active:bg-red-500'
            }`}
          >
            <FontAwesome5 name="flag" size={20} color="black" />
            <Text className="font-bold text-base ml-2">
              {hasReported ? 'Serviço denunciado' : 'Denunciar Serviço'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

     
      <Modal transparent visible={reportModalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black bg-opacity-30 justify-center items-center">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="w-11/12"
            >
              <View className="bg-white rounded-lg p-6 shadow-lg">
                <View className="flex-row items-center mb-4">
                  <FontAwesome5 name="flag" size={24} color="#DC2626" />
                  <Text className="font-bold text-lg ml-2 text-gray-800">
                    Motivo da denúncia
                  </Text>
                </View>
                <TextInput
                  multiline
                  placeholder="Descreva o motivo..."
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-300 rounded-md p-3 mb-2 h-24 font-normal"
                  style={{ textAlignVertical: 'top' }}
                  value={description}
                  onChangeText={(t) => {
                    setDescription(t)
                    if (attemptedReportSubmit) setAttemptedReportSubmit(false)
                  }}
                />
                {attemptedReportSubmit && !description.trim() && (
                  <Text className="text-red-500 font-normal mb-2">
                    O motivo não pode ficar em branco
                  </Text>
                )}
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setReportModalVisible(false)
                      setAttemptedReportSubmit(false)
                    }}
                    className="mr-4 py-2"
                  >
                    <Text className="font-bold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSendReport} className="py-2">
                    <Text className="font-bold">Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      
      <Modal transparent visible={feedbackModalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black bg-opacity-30 justify-center items-center">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="w-11/12"
            >
              <View className="bg-white rounded-lg p-6 shadow-lg">
                <Text className="font-bold text-lg text-center mb-4">
                  Avalie o prestador
                </Text>
                <View className="flex-row justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setRating(star)
                        if (attemptedRatingSubmit) setAttemptedRatingSubmit(false)
                      }}
                      className="mx-1"
                    >
                      <FontAwesome5
                        name="star"
                        size={32}
                        color={star <= rating ? '#FACC15' : '#CCC'}
                        solid={star <= rating}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {attemptedRatingSubmit && rating <= 0 && (
                  <Text className="text-red-500 font-normal text-center mb-2">
                    Selecione uma nota antes de enviar
                  </Text>
                )}
                <TextInput
                  placeholder="Comentário opcional..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  className="border border-gray-300 rounded-md p-3 h-20 font-normal mb-4"
                  value={textFeedback}
                  onChangeText={setTextFeedback}
                />
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => {
                      setFeedbackModalVisible(false)
                      setAttemptedRatingSubmit(false)
                    }}
                    className="mr-4 py-2"
                  >
                    <Text className="font-bold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSendRating} className="py-2">
                    <Text className="font-bold">Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}
