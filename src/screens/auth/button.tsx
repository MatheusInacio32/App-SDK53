import React from 'react';
import { Pressable } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from 'src/api/apiconfig';
import { useRouter } from 'expo-router';

export default function button() {
  const router = useRouter();

  const handleAutoLogin = async () => {
    try {
      const payload = {
        email: 'eduaguiar.h@gmail.com',
        hashPassword: '123',
      };
      const { data } = await axios.post(`${apiUrl}/auth/login`, payload);
      await AsyncStorage.setItem('authToken', data.token);
      router.push('home');
    } catch (err) {
      console.error('Auto login falhou:', err);
    }
  };

  return (
    <Pressable
      onPress={handleAutoLogin}
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        top: 70,
        right: 164,
        backgroundColor: 'black',
        opacity: 0.3,      
        zIndex: 999,     
      }}
    />
  );
}
