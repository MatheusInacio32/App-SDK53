import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  ActivityIndicator,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { usePathname, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Navbar } from '../../components/home/Navbar';
import { Carrosel } from '../../components/home/Carrosel';
import { Categories } from '../../components/home/Categories';
import { RankingPrestador } from '../../components/home/Ranking';
import { ButtomHelp } from '../../components/home/ButtomHelp';
import { ButtonFab } from '../../components/home/ButtonService';

import { useHome, FaqItem } from '../../hooks/useHome';
import { useAddresses } from '../../hooks/useAddresses';

export default function Home() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_700Bold });
  const { categories, rankingPrestadores, faqs } = useHome();
  const { addresses, loading: loadingAddresses, refresh } = useAddresses();
  const fontRegular = 'Outfit_400Regular';
  const fontBold = 'Outfit_700Bold';
  const pathname = usePathname();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  if (!fontsLoaded || loadingAddresses) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 relative">
      <Navbar fontRegular={fontRegular} fontBold={fontBold} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {addresses.length === 0 && (
          <View className="mx-4 mt-5 p-4 rounded-lg border border-yellow-300 bg-yellow-100">
            <Text className="mb-2 text-center" style={{ fontFamily: fontBold, color: '#856404' }}>
              Você ainda não cadastrou nenhum endereço para pedir um Help.
            </Text>
            <Pressable onPress={() => router.push('/adresses')} className="self-center">
              <Text style={{ fontFamily: fontRegular, color: '#0C63E4' }}>
                Cadastrar endereço
              </Text>
            </Pressable>
          </View>
        )}

        <Carrosel />
        <Categories />
        <RankingPrestador
          data={rankingPrestadores}
          fontRegular={fontRegular}
          fontBold={fontBold}
        />
        <ButtomHelp
          onPress={() => console.log('Solicitar um HELP')}
          fontRegular={fontRegular}
          fontBold={fontBold}
        />

        <View className="mx-4 mt-6 mb-10 items-center">
          <Text className="text-2xl mb-5 text-black text-center" style={{ fontFamily: fontBold }}>
            Perguntas Frequentes
          </Text>
          <View className="bg-white rounded-lg overflow-hidden border border-gray-200 w-full">
            {faqs.map((item: FaqItem, i: number) => (
              <View key={i} className={i > 0 ? 'border-t border-gray-200' : ''}>
                <Pressable
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setOpenIndex(openIndex === i ? null : i);
                  }}
                  className="px-4 py-3 flex-row justify-between items-center"
                >
                  <Text className="flex-shrink text-lg text-gray-700" style={{ fontFamily: fontBold }}>
                    {item.question}
                  </Text>
                </Pressable>
                {openIndex === i && (
                  <View className="px-4 pb-4">
                    <Text className="text-gray-700" style={{ fontFamily: fontRegular }}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {pathname === '/home' && <ButtonFab />}
    </SafeAreaView>
  );
}
