import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { apiUrl } from 'src/api/apiconfig';

export interface Address {
  id: number;
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

function decodeJWT<T = any>(token: string): T {
  const [, payload] = token.split('.');
  const json = Buffer.from(payload, 'base64').toString('utf8');
  return JSON.parse(json) as T;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const { sub: userId } = decodeJWT<{ sub: string }>(token);
        const res = await axios.get<Address[]>(`${apiUrl}/addresses/user/${userId}`);
        setAddresses(res.data);
      }
    } catch (err) {
      console.error('Erro ao buscar endereços:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return { addresses, loading, refresh: fetchAddresses };
}
