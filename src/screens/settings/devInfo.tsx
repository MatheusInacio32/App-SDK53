import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Importando corretamente

export default function DevInfoScreen() {
  const [storageData, setStorageData] = useState<{ key: string; value: string | null }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const items = await Promise.all(
          keys.map(async (key) => {
            const value = await AsyncStorage.getItem(key);
            return { key, value };
          })
        );

        setStorageData(items);

        // Buscar o token e extrair o userId
        const tokenItem = items.find(item => item.key === 'authToken');
        if (tokenItem?.value) {
          setAuthToken(tokenItem.value); // Salvar o token no estado para exibição
          try {
            const decoded: { sub?: string } = jwtDecode(tokenItem.value); // Utilizando jwtDecode sem chave secreta
            setUserId(decoded.sub || 'ID não encontrado no token');
          } catch (error) {
            console.error('Erro ao decodificar token:', error);
            setUserId('Erro ao decodificar');
          }
        }

        // Buscar o userId salvo no AsyncStorage
        const savedUserIdItem = await AsyncStorage.getItem('userId');
        setSavedUserId(savedUserIdItem);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do AsyncStorage.');
      }
    };

    loadStorageData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-black mt-10">DEV Info</Text>

      {/* Exibição do Token Avulso */}
      <View className="mb-4 p-3 border border-red-300 rounded-lg bg-red-100">
        <Text className="text-black font-bold">🔑 Auth Token:</Text>
        <Text className="text-black break-words">{authToken ?? 'Não encontrado'}</Text>
      </View>

      {/* Exibição do User ID extraído do token */}
      <View className="mb-4 p-3 border border-blue-300 rounded-lg bg-blue-100">
        <Text className="text-black font-bold">🆔 User ID (extraído do token):</Text>
        <Text className="text-black">{userId ?? 'Não encontrado'}</Text>
      </View>

      {/* Exibição do User ID salvo no AsyncStorage */}
      <View className="mb-4 p-3 border border-green-300 rounded-lg bg-green-100">
        <Text className="text-black font-bold">🆔 User ID (salvo no AsyncStorage):</Text>
        <Text className="text-black">{savedUserId ?? 'Não encontrado'}</Text>
      </View>

      {/* Exibir demais dados, omitindo o próprio authToken pois já está separado */}
      {storageData.length === 0 ? (
        <Text className="text-black">Nenhum dado encontrado no AsyncStorage.</Text>
      ) : (
        storageData
          .filter(({ key }) => key !== 'authToken') // Já exibimos o token acima
          .map(({ key, value }) => (
            <View key={key} className="mb-4 p-3 border border-gray-300 rounded-lg bg-gray-100">
              <Text className="text-black font-bold">🔑 {key}</Text>
              <Text className="text-black">{value || 'Sem valor armazenado'}</Text>
            </View>
          ))
      )}

      {/* Botão para limpar AsyncStorage */}
      <Pressable
        className="bg-red-500 p-3 rounded-lg mt-4"
        onPress={async () => {
          await AsyncStorage.clear();
          setStorageData([]);
          setUserId(null);
          setSavedUserId(null);
          setAuthToken(null);
          Alert.alert('AsyncStorage', 'Todos os dados foram apagados!');
        }}
      >
        <Text className="text-white text-center font-bold">Limpar AsyncStorage</Text>
      </Pressable>
    </ScrollView>
  );
}
