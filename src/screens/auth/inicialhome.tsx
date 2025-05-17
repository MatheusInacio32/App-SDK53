import React from "react";
import {
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Outfit_400Regular, Outfit_700Bold } from "@expo-google-fonts/outfit";

import { AnimatedButton } from "../../components/inicialhome/AnimatedButton";
import { SloganList } from "../../components/inicialhome/SloganList";

export default function Home() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold,
  });
  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text style={{ fontFamily: "Outfit_400Regular" }} className="text-lg text-black">
          Carregando...
        </Text>
      </SafeAreaView>
    );
  }

  const slogans = [
    "Precisa de ajuda? A gente dá um help!",
    "Serviços rápidos, práticos e sem dor de cabeça.",
    "Profissionais confiáveis para o que você precisar.",
    "Seu problema resolvido com um clique.",
    "Pequenos reparos, grandes soluções."
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        className="px-2"
      >
        <View className="flex-1 justify-center items-center">
          <View className="items-center">
            <Image
              source={require("../../assets/logoInicial.png")}
              style={{ width: 350, height: 280 }}
              className="rounded-md"
              resizeMode="contain"
            />
            <Text
              className="text-4xl font-bold text-black mt-0"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Bem-Vindo!
            </Text>
          </View>

        
          <View className="mt-3 w-full px-4">
            <SloganList slogans={slogans} />
          </View>

          
          <View className="mt-8 w-full px-16">
            <AnimatedButton
              label="Entrar"
              backgroundColor="#FACC15"
              onPress={() => router.push("login")}
            />
          </View>
          <View className="mb-0 w-full px-16">
            <AnimatedButton
              label="Cadastro"
              backgroundColor="#FDE018"
              onPress={() => router.push("signin")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
