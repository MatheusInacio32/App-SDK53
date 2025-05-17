import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from 'src/api/apiconfig';
import { FontAwesome5 } from '@expo/vector-icons';

type Deal = {
  id: number;
  freelancerPrice: number;
  scheduledDate: string;
  estimatedDuration: number;
  clientAcceptance: string | null;
  userPJ: { firstName: string; lastName: string; id: number; role: string };
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DealItem = ({
  item,
  categoryName,
}: {
  item: Deal;
  categoryName: string;
}) => {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = useCallback(() => {
    Alert.alert('Confirmação', 'Tem certeza que deseja aceitar a proposta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceitar',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) throw new Error();
            await axios.patch(
              `${apiUrl}/order-deal/${item.id}`,
              { clientAcceptance: 'accepted' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setAccepted(true);
            router.push('services');
          } catch {
            Alert.alert('Erro', 'Não foi possível aceitar a proposta.');
          }
        },
      },
    ]);
  }, [item.id, router]);

  return (
    <View className="border border-gray-300 rounded p-4 mb-3 bg-white shadow">
      <Text
        className="font-bold text-lg mb-2"
        style={{ fontFamily: 'Outfit_700Bold' }}
      >
        Proposta de {item.userPJ.firstName} {item.userPJ.lastName}
      </Text>

      <View className="bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-3 self-start">
        <Text
          className="text-green-800 text-2xl font-bold"
          style={{ fontFamily: 'Outfit_700Bold' }}
        >
          R$ {item.freelancerPrice.toFixed(2)}
        </Text>
      </View>

      <Text
        className="text-gray-600 mb-1"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        📅 {formatDate(item.scheduledDate)}
      </Text>
      <Text
        className="text-gray-600 mb-4"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        ⏱️ {item.estimatedDuration} min
      </Text>

      <TouchableOpacity
        onPress={() => router.push(`profile?id=${item.userPJ.id}`)}
        className="bg-yellow-400 active:bg-yellow-300 py-4 px-6 rounded-full flex-row items-center justify-center shadow mb-2"
      >
        <FontAwesome5 name="user" size={20} color="black" />
        <Text
          className="text-black text-base ml-2"
          style={{ fontFamily: 'Outfit_700Bold' }}
        >
          Perfil do profissional
        </Text>
      </TouchableOpacity>

      {item.clientAcceptance === null && !accepted && (
        <TouchableOpacity
          onPress={handleAccept}
          className="bg-green-400 active:bg-green-900 py-4 px-6 rounded-full flex-row items-center justify-center shadow"
        >
          <FontAwesome5 name="check-circle" size={20} color="black" />
          <Text
            className="text-black text-base ml-2"
            style={{ fontFamily: 'Outfit_700Bold' }}
          >
            Aceitar proposta
          </Text>
        </TouchableOpacity>
      )}

      {(accepted || item.clientAcceptance === 'accepted') && (
        <View className="mt-3 flex-row items-center">
          <FontAwesome5 name="check" size={20} color="green" />
          <Text
            className="text-green-700 ml-2 font-bold"
            style={{ fontFamily: 'Outfit_700Bold' }}
          >
            Proposta aceita
          </Text>
        </View>
      )}
    </View>
  );
};

export default function DealsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const serviceId = Array.isArray(params.serviceId) ? params.serviceId[0] : params.serviceId;
  const categoryName = Array.isArray(params.categoryName)
    ? params.categoryName[0]
    : params.categoryName || 'Categoria não informada';

  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      if (!serviceId) return;
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error();
        const { data } = await axios.get<Deal[]>(
          `${apiUrl}/order-deal/order-request/${serviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDeals(data);
        setError(null);
      } catch {
        setError('Não foi possível carregar as propostas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, [serviceId]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <TouchableOpacity onPress={() => router.back()} className="mb-4 mt-5">
        <FontAwesome5 name="arrow-left" size={24} color="#FFD700" />
      </TouchableOpacity>
      <Text
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: 'Outfit_700Bold' }}
      >
        Propostas Recebidas
      </Text>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text
            className="mt-2"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Carregando propostas...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome5 name="exclamation-circle" size={48} color="#FFA500" />
          <Text
            className="mt-2 text-center text-gray-600"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {error}
          </Text>
        </View>
      ) : deals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <FontAwesome5 name="inbox" size={48} color="#C0C0C0" />
          <Text
            className="mt-2 text-center text-gray-500"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Nenhuma proposta recebida.
          </Text>
        </View>
      ) : (
        <FlatList
          data={deals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DealItem
              item={item}
              categoryName={categoryName}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
