// src/screens/request/AddressScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import MaskInput from 'react-native-mask-input';
import { apiUrl } from 'src/api/apiconfig';

interface Address {
  id: number;
  label: string;
  addressLine: string;
  addressNumber: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
}

interface FormState {
  label: string;
  addressLine: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  latitude: number;
  longitude: number;
}

const initialFormState: FormState = {
  label: '',
  addressLine: '',
  addressNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  cep: '',
  latitude: 0,
  longitude: 0,
};

function decodeJWT<T = any>(token: string): T {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as T;
}

export default function AddressScreen() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const loadAddresses = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const { sub: id } = decodeJWT<{ sub: string }>(token);
        setUserId(id);
        const res = await axios.get<Address[]>(`${apiUrl}/addresses/user/${id}`);
        setAddresses(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    loadAddresses();
  }, [loadAddresses]);

  const handleCepLookup = useCallback(async () => {
    const rawCep = form.cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      Alert.alert('CEP inválido', 'Digite um CEP com 8 dígitos.');
      return;
    }
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
      if (res.data.erro) {
        Alert.alert('CEP não encontrado');
        return;
      }
      setForm(prev => ({
        ...prev,
        addressLine: res.data.logradouro,
        neighborhood: res.data.bairro,
        city: res.data.localidade,
        state: res.data.uf,
      }));
    } catch {
      Alert.alert('Erro ao consultar CEP');
    }
  }, [form.cep]);

  const handleSave = useCallback(async () => {
    const {
      label,
      addressLine,
      addressNumber,
      neighborhood,
      city,
      state,
      cep,
      latitude,
      longitude,
    } = form;
    const rawCep = cep.replace(/\D/g, '');

    // Validações básicas
    if (
      !label.trim() ||
      !addressLine.trim() ||
      !addressNumber.trim() ||
      !neighborhood.trim() ||
      !city.trim() ||
      !state.trim() ||
      rawCep.length !== 8
    ) {
      Alert.alert('Preencha todos os campos corretamente.');
      return;
    }
    if (isNaN(Number(addressNumber))) {
      Alert.alert('Número inválido');
      return;
    }

    const payload = {
      label: label.trim(),
      addressLine: addressLine.trim(),
      addressNumber: addressNumber.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      cep: rawCep,
      latitude,
      longitude,
      userId,
    };

    try {
      if (editingId === null) {
        const res = await axios.post<Address>(`${apiUrl}/addresses`, payload);
        setAddresses(prev => [...prev, res.data]);
      } else {
        await axios.put(`${apiUrl}/addresses/${editingId}`, payload);
        setAddresses(prev =>
          prev.map(a => (a.id === editingId ? { ...a, ...payload } : a))
        );
        setEditingId(null);
      }
      setForm(initialFormState);
    } catch {
      Alert.alert('Erro ao salvar');
    }
  }, [form, editingId, userId]);

  const handleEdit = useCallback((addr: Address) => {
    setEditingId(addr.id);
    setForm({ ...addr, latitude: 0, longitude: 0 });
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert('Excluir endereço?', undefined, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${apiUrl}/addresses/${id}`);
              setAddresses(prev => prev.filter(a => a.id !== id));
              if (editingId === id) {
                setEditingId(null);
                setForm(initialFormState);
              }
            } catch {
              Alert.alert('Erro ao excluir');
            }
          },
        },
      ]);
    },
    [editingId]
  );

  const formFields = [
    { label: 'Rua', key: 'addressLine', keyboardType: 'default' as const },
    { label: 'Número', key: 'addressNumber', keyboardType: 'numeric' as const },
    { label: 'Complemento', key: 'label', keyboardType: 'default' as const },
    { label: 'Bairro', key: 'neighborhood', keyboardType: 'default' as const },
    { label: 'Cidade', key: 'city', keyboardType: 'default' as const },
    { label: 'Estado', key: 'state', keyboardType: 'default' as const },
  ];

  const renderItem = useCallback(
    ({ item }: { item: Address }) => (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow">
        <Text
          className="text-lg font-bold mb-1 text-gray-800"
          style={{ fontFamily: 'Outfit_700Bold' }}
        >
          {item.addressLine}, {item.addressNumber}
        </Text>
        <Text
          className="text-sm text-gray-600 mb-1"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {item.label}
        </Text>
        <Text
          className="text-sm text-gray-600 mb-1"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {item.neighborhood} – {item.city}/{item.state}
        </Text>
        <Text
          className="text-sm text-gray-600 mb-4"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          CEP: {item.cep}
        </Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="flex-1 bg-blue-500 py-3 rounded-full items-center shadow"
          >
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              Editar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="flex-1 bg-red-500 py-3 rounded-full items-center shadow"
          >
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEdit, handleDelete]
  );

  const renderHeader = useCallback(() => (
    <>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <FontAwesome name="arrow-left" size={28} color="#FACC15" />
      </TouchableOpacity>

      <Text
        className="text-3xl font-bold mb-6 text-gray-800"
        style={{ fontFamily: 'Outfit_700Bold' }}
      >
        Meus Endereços
      </Text>

      <View className="flex-row mb-5 items-center">
        <MaskInput
          className="flex-1 bg-white rounded-full px-4 py-3 shadow-sm border border-gray-200"
          placeholder="Digite o CEP"
          keyboardType="numeric"
          value={form.cep}
          onChangeText={(masked, unmasked) =>
            setForm(prev => ({ ...prev, cep: masked }))
          }
          mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
          style={{ fontFamily: 'Outfit_400Regular' }}
        />
        <TouchableOpacity
          onPress={handleCepLookup}
          className="ml-3 bg-yellow-500 px-6 py-3 rounded-full shadow"
        >
          <Text
            className="text-black font-semibold"
            style={{ fontFamily: 'Outfit_700Bold' }}
          >
            Consultar
          </Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-5 mb-8">
        {formFields.map(({ label, key, keyboardType }, idx) => (
          <TextInput
            key={idx}
            className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200"
            placeholder={label}
            keyboardType={keyboardType}
            value={(form as any)[key]}
            onChangeText={t =>
              setForm(prev => ({ ...prev, [key]: t }))
            }
            style={{ fontFamily: 'Outfit_400Regular' }}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSave}
        className="bg-yellow-500 py-4 rounded-full items-center shadow-lg mb-8"
      >
        <Text
          className="text-black text-lg font-bold"
          style={{ fontFamily: 'Outfit_700Bold' }}
        >
          {editingId ? 'Atualizar Endereço' : 'Salvar Endereço'}
        </Text>
      </TouchableOpacity>
    </>
  ), [
    form,
    handleSave,
    handleCepLookup,
    editingId,
    router,
    formFields,
  ]);

  const memoHeader = useMemo(() => renderHeader(), [renderHeader]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-6 pt-10">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={addresses}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={memoHeader}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text
                className="text-center text-gray-500 mt-10"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Nenhum endereço cadastrado.
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
