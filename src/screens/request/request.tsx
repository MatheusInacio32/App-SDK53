// src/screens/request/request.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useServices } from '../../context/ServicesContext';
import { apiUrl } from 'src/api/apiconfig';
import { useFocusEffect } from '@react-navigation/native';
import { useAddresses } from '../../hooks/useAddresses';
import { Buffer } from 'buffer';

interface CreateServiceRequestDTO {
  categoryId: string;
  description: string;
  scheduledDate: string;
  minValue: number;
  maxValue: number;
  addressId: string;
  userPFId: string;
}

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function decodeJWT<T = any>(token: string): T {
  const [, payload] = token.split('.');
  const json = Buffer.from(payload, 'base64').toString('utf8');
  return JSON.parse(json) as T;
}

export default function SolicitacaoServicoScreen() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const router = useRouter();
  const { categoryName } = useLocalSearchParams<{ categoryName?: string }>();
  const { createServiceRequest } = useServices();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { addresses, loading: loadingAddresses, refresh: refreshAddresses } = useAddresses();
  const [addressId, setAddressId] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return now;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isValueChecked, setIsValueChecked] = useState(false);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('Token não encontrado');

        const res = await fetch(`${apiUrl}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { id: string; name: string }[];
        setCategories(data);

        if (categoryName) {
          const target = normalize(categoryName);
          const found = data.find((c) => normalize(c.name) === target);
          if (found) {
            setCategoryId(found.id);
            setLoadingCategories(false);
            return;
          }
        }

        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, [categoryName]);

  useFocusEffect(
    useCallback(() => {
      refreshAddresses();
    }, [refreshAddresses])
  );

  useEffect(() => {
    setAddressId(addresses.length > 0 ? String(addresses[0].id) : null);
  }, [addresses]);

  const onChangeDate = (_: any, d?: Date) => {
    setShowDatePicker(false);
    if (d) setSelectedDate(d);
  };

  const onChangeTime = (_: any, t?: Date) => {
    setShowTimePicker(false);
    if (t) {
      const nt = new Date();
      nt.setHours(t.getHours(), 0, 0, 0);
      setSelectedTime(nt);
    }
  };

  const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');
  const handleMinValueChange = (t: string) => setMinValue(onlyDigits(t));
  const handleMaxValueChange = (t: string) => setMaxValue(onlyDigits(t));

  const handleSubmit = async () => {
    if (
      !categoryId ||
      !addressId ||
      !description.trim() ||
      (isValueChecked && (!minValue || !maxValue))
    ) {
      return Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
    }
    if (isValueChecked && Number(minValue) > Number(maxValue)) {
      return Alert.alert('Atenção', 'Valor mínimo não pode ser maior que o valor máximo.');
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Usuário não autenticado');
      const { sub: userPFId } = decodeJWT<{ sub: string }>(token);

      const dt = new Date(selectedDate);
      dt.setHours(selectedTime.getHours(), 0, 0, 0);

      const payload: CreateServiceRequestDTO = {
        categoryId,
        description,
        scheduledDate: dt.toISOString(),
        minValue: isValueChecked ? Number(minValue) : 0,
        maxValue: isValueChecked ? Number(maxValue) : 0,
        addressId,
        userPFId,
      };

      await createServiceRequest(payload);
      setSuccessMessage('Serviço agendado com sucesso!');
      setTimeout(() => router.push('/home'), 1500);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  if (!fontsLoaded || loadingCategories || loadingAddresses) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="mt-2" style={{ fontFamily: 'Outfit_400Regular' }}>
          Carregando...
        </Text>
      </SafeAreaView>
    );
  }

  const displayDate = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString()
      ? 'Hoje'
      : selectedDate.toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-grow pb-8"
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row justify-between items-center px-6 mb-2 mt-5">
              <TouchableOpacity onPress={() => router.back()}>
                <FontAwesome name="arrow-left" size={30} color="#FFD700" />
              </TouchableOpacity>
              <Text className="text-xl font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
                Solicitação de Serviço
              </Text>
              <TouchableOpacity onPress={() => {}}>
                <FontAwesome name="cog" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="px-6">
              {successMessage !== '' && (
                <Text className="text-green-600 text-center text-lg font-bold mb-4" style={{ fontFamily: 'Outfit_700Bold' }}>
                  {successMessage}
                </Text>
              )}

              <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                Endereço
              </Text>
              {addresses.length > 0 ? (
                <View className="flex-row items-center border border-gray-300 rounded-lg mb-3">
                  <View className="flex-1">
                    <Picker
                      selectedValue={addressId}
                      onValueChange={(val) => {
                        if (val === 'meus_enderecos') {
                          router.push('/adresses');
                        } else {
                          setAddressId(val);
                        }
                      }}
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {addresses.map((addr) => (
                        <Picker.Item
                          key={String(addr.id)}
                          label={`${addr.addressLine}, ${addr.addressNumber} - ${addr.neighborhood}`}
                          value={String(addr.id)}
                        />
                      ))}
                      <Picker.Item label="Meus Endereços" value="meus_enderecos" />
                    </Picker>
                  </View>
                  <FontAwesome name="pencil" size={20} color="black" className="mr-4" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/adresses')}
                  className="mb-4 p-4 bg-yellow-100 rounded-lg border border-yellow-500"
                >
                  <Text className="" style={{ fontFamily: 'Outfit_400Regular' }}>
                    Clique aqui para cadastrar
                  </Text>
                </TouchableOpacity>
              )}

              <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                Categoria
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg mb-3">
                <View className="flex-1">
                  <Picker
                    selectedValue={categoryId}
                    onValueChange={(val) => setCategoryId(val)}
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {categories.map((c) => (
                      <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                  </Picker>
                </View>
                <FontAwesome name="th-large" size={20} color="black" className="mr-4" />
              </View>

              <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                Descrição do Serviço
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-6 h-32"
                placeholder="Descreva detalhes sobre o serviço"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                style={{ fontFamily: 'Outfit_400Regular', textAlignVertical: 'top' }}
              />

              <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                Data do Serviço
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between border border-gray-300 rounded-full p-3 mb-6 shadow-sm"
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontFamily: 'Outfit_400Regular' }}>{displayDate()}</Text>
                <FontAwesome name="calendar" size={20} color="black" className="mr-1" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={onChangeDate}
                />
              )}

              <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                Hora do Serviço
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between border border-gray-300 rounded-full p-3 mb-6 shadow-sm"
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ fontFamily: 'Outfit_400Regular' }}>{selectedTime.getHours()}:00</Text>
                <FontAwesome name="clock-o" size={20} color="black" className="mr-1" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={onChangeTime}
                />
              )}

              <View className="flex-row items-center mb-4">
                <Switch value={isValueChecked} onValueChange={setIsValueChecked} />
                <Text className="ml-2 text-lg font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
                  Definir Valores
                </Text>
              </View>

              {isValueChecked && (
                <>
                  <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                    Valor Mínimo
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-full p-3 mb-4"
                    placeholder="R$ mínimo"
                    keyboardType="numeric"
                    value={minValue}
                    onChangeText={handleMinValueChange}
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  />

                  <Text className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                    Valor Máximo
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-full p-3 mb-6"
                    placeholder="R$ máximo"
                    keyboardType="numeric"
                    value={maxValue}
                    onChangeText={handleMaxValueChange}
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  />
                </>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={addresses.length === 0}
                className={`py-4 rounded-full items-center mb-8 ${
                  addresses.length === 0 ? 'bg-gray-300' : 'bg-yellow-500'
                }`}
              >
                <Text className="text-black font-bold text-xl" style={{ fontFamily: 'Outfit_700Bold' }}>
                  Agendar Serviço
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
