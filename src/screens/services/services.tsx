import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment-timezone';
import 'moment/locale/pt-br';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import { apiUrl } from 'src/api/apiconfig';

moment.locale('pt-br');

function decodeJWT<T = any>(token: string): T {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as T;
}

const formatDateTime = (iso: string) => {
  const dt = moment.utc(iso).tz('America/Sao_Paulo');
  return {
    date: dt.format('DD/MM/YYYY'),
    time: dt.format('HH:mm'),
  };
};

const formatTimeAgo = (iso: string) =>
  moment.utc(iso).tz('America/Sao_Paulo').fromNow();

interface Service {
  id: number;
  status: 'Pendente' | 'Iniciado';
  category: { name: string };
  scheduledDate: string;
  requestDate: string;
  address?: { addressLine: string; addressNumber: string };
  minValue: number;
  maxValue: number;
}

interface Deal {
  userPJ: { firstName: string; lastName: string };
  freelancerPrice: number;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Pendente: { bg: 'bg-gray-100', text: 'text-gray-800' },
  Iniciado: { bg: 'bg-green-100', text: 'text-green-800' },
};

const ServiceItem: React.FC<{ item: Service }> = ({ item }) => {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [proposalCount, setProposalCount] = useState<number | null>(null);
  const { date, time } = formatDateTime(item.scheduledDate);
  const sts = statusStyles[item.status];

  const fetchDeal = useCallback(async () => {
    if (item.status !== 'Iniciado') return;
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await axios.get<Deal>(
        `${apiUrl}/order-request/${item.id}/accepted-deal`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeal(res.data);
    } catch {}
  }, [item]);

  const fetchProposalsCount = useCallback(async () => {
    if (item.status !== 'Pendente') return;
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await axios.get<any[]>(
        `${apiUrl}/order-deal/order-request/${item.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposalCount(res.data.length);
    } catch {
      setProposalCount(0);
    }
  }, [item]);

  useEffect(() => {
    fetchDeal();
    fetchProposalsCount();
  }, [fetchDeal, fetchProposalsCount]);

  const onPress = () => {
    const screen = item.status === 'Iniciado' ? 'prechat' : 'deals';
    const providerName = deal
      ? `${deal.userPJ.firstName} ${deal.userPJ.lastName}`
      : '';
    const params = `serviceId=${item.id}&providerName=${encodeURIComponent(
      providerName
    )}&categoryName=${encodeURIComponent(item.category.name)}`;
    router.push(`${screen}?${params}`);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-5 mb-4 border border-gray-200 shadow-black/10 shadow-sm"
    >
      <Text className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
        {item.category.name}
      </Text>
      <View className="space-y-1 mb-3">
        <Text className="text-sm text-gray-600" style={{ fontFamily: 'Outfit_400Regular' }}>
          📅 {date}
        </Text>
        <Text className="text-sm text-gray-600" style={{ fontFamily: 'Outfit_400Regular' }}>
          ⏰ {time}
        </Text>
        <Text className="text-sm text-gray-600" style={{ fontFamily: 'Outfit_400Regular' }}>
          📍 {item.address
            ? `${item.address.addressLine}, ${item.address.addressNumber}`
            : 'Endereço não disponível'}
        </Text>
      </View>
      <View className="border-t border-gray-200 mb-3" />
      {item.status === 'Pendente' && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <FontAwesome5 name="dollar-sign" size={14} color="#854d0e" />
            <Text className="text-sm font-bold ml-1" style={{ fontFamily: 'Outfit_700Bold', color: '#854d0e' }}>
              {item.minValue > 0 && item.maxValue > 0
                ? `R$ ${item.minValue} até R$ ${item.maxValue}`
                : 'Indefinido'}
            </Text>
          </View>
          {proposalCount !== null && (
            <View className="bg-blue-100 rounded-full px-2 py-1">
              <Text className="text-sm font-bold text-blue-800" style={{ fontFamily: 'Outfit_700Bold' }}>
                {proposalCount > 0
                  ? `${proposalCount} proposta${proposalCount > 1 ? 's' : ''}`
                  : 'Sem propostas'}
              </Text>
            </View>
          )}
        </View>
      )}
      {item.status === 'Iniciado' && deal && (
        <View className="flex-row items-center space-x-3 mb-3">
          <View className="bg-yellow-100 rounded-full px-3 py-1 flex-row items-center">
            <FontAwesome5 name="user" size={12} color="#D97706" />
            <Text className="ml-1 text-sm font-bold text-yellow-800" style={{ fontFamily: 'Outfit_700Bold' }}>
              {deal.userPJ.firstName} {deal.userPJ.lastName}
            </Text>
          </View>
          <View className="bg-green-100 rounded-full px-3 py-1 flex-row items-center">
            <FontAwesome5 name="dollar-sign" size={12} color="#059669" />
            <Text className="ml-1 text-sm font-bold text-green-700" style={{ fontFamily: 'Outfit_700Bold' }}>
              R$ {deal.freelancerPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
      <View className="flex-row justify-between">
        <Text className={`px-2 py-1 rounded-full text-xs font-bold ${sts.bg} ${sts.text}`} style={{ fontFamily: 'Outfit_700Bold' }}>
          {item.status}
        </Text>
        <Text className="text-xs text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
          {formatTimeAgo(item.requestDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ServicesScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }
    try {
      const { sub: userId } = decodeJWT<{ sub: string }>(token);
      const res = await axios.get<Service[]>(
        `${apiUrl}/order-request/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices(res.data);
      setError(null);
    } catch {
      setError('Erro ao carregar os serviços.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [loadServices])
  );

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-10 flex-1">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <FontAwesome5 name="arrow-left" size={24} color="#FFD600" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold', color: '#333' }}>
          Meus Serviços
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#555" />
        ) : error ? (
          <Text className="text-base text-red-500" style={{ fontFamily: 'Outfit_400Regular' }}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ServiceItem item={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}