import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Credits() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4 mt-5">
          <FontAwesome5 name="arrow-left" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View className="mb-4">
          <Text
            className="text-2xl text-black"
            style={{ fontFamily: 'Outfit_700Bold', marginTop: 10 }}
          >
            Créditos
          </Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-lg">
          <Text className="text-lg text-yellow-500" style={{ fontFamily: 'Outfit_700Bold' }}>
            Front-end:
          </Text>
          <Text
            className="text-base text-gray-800 mb-4"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Matheus Inácio – Desenvolvimento do app em React Native{'\n'}
            Matheus Souza – Desenvolvimento do React Web para o prestador
          </Text>

          <Text className="text-lg text-yellow-500" style={{ fontFamily: 'Outfit_700Bold' }}>
            Back-end:
          </Text>
          <Text
            className="text-base text-gray-800 mb-4"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Nathan Schiavon e
            Lucas Foppa{'\n'} – Desenvolvimento do TypeORM e back-end com Nest.js
          </Text>

          <Text className="text-lg text-yellow-500" style={{ fontFamily: 'Outfit_700Bold' }}>
            Integração:
          </Text>
          <Text
            className="text-base text-gray-800 mb-4"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Isaac Arantes – Responsável por integrar o front-end com o back-end e pela criação das tabelas do banco de dados
          </Text>

          <Text className="text-lg text-yellow-500" style={{ fontFamily: 'Outfit_700Bold' }}>
            Gestão:
          </Text>
          <Text className="text-base text-gray-800" style={{ fontFamily: 'Outfit_400Regular' }}>
            Eduardo Aguiar – Documentação e gestão de projetos e equipe
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
