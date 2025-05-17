import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { apiUrl } from 'src/api/apiconfig';

interface CategoryResponse {
  id: string;
  name: string;
}

type CategoryNames =
  | 'Serviço Domestico'
  | 'Serviços de Software'
  | 'Serviço Online'
  | 'Serviço Veicular'
  | 'Serviço de Pet'
  | 'Serviço Humano'
  | 'Serviços Comercial'
  | 'Fretes';

export function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; icon: string; subCategories: string[]; subCategoryIcons: string[] }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const categoryStructure: Record<CategoryNames, string[]> = {
    'Serviço Domestico': [
      'Encanador', 'Eletricista', 'Pintor', 'Pedreiro', 'Limpeza Residencial', 'Jardinagem',
      'Instalador de Eletrônicos', 'Reparos Elétricos', 'Carpinteiro', 'Manutenção de Piscina',
      'Manutenção de Ar Condicionado', 'Soldador', 'Conserto de Eletrodomésticos',
    ],
    'Serviços de Software': [
      'Programação Front End', 'Programador Backend', 'Gestão de Projeto', 'Suporte em TI',
      'Tester de Software', 'Analista de Software', 'Consultor de Software',
    ],
    'Serviço Online': ['Editor de Video', 'Editor de Imagem', 'Redator', 'Media Design', 'ÁudioVisual', 'Audio'],
    'Serviço Veicular': ['Mecanico De Carro', 'Manobrista', 'Lavagem de Carros', 'Mecanico de Moto'],
    'Serviço de Pet': ['Cuidador de Pet', 'Hospedagem de Pet', 'Vacinação de Pet', 'Passeio com Cães', 'Tosador'],
    'Serviço Humano': [
      'Cuidador de Idosos', 'Cuidador de criança', 'Professor Particular', 'Massoterapia', 'Fisioterapia',
      'Personal Organizer', 'Cuidador de pessoa com Deficiencia', 'Personal Training', 'Acompanhante', 'Manicure',
    ],
    'Serviços Comercial': [
      'Vendedor', 'Diarista Comercial', 'Segurança', 'Garçom', 'Tradutor', 'Fotografia e Filmagem',
      'Contador', 'Produtor de Festa', 'Serviço de Buffet', 'Produtor Musical(DJ)',
    ],
    Fretes: ['Transporte de Cargas', 'Carona', 'Abastecedor'],
  };

  const iconsCategories: Record<CategoryNames, string> = {
    'Serviço Domestico': 'home',
    'Serviços de Software': 'code',
    'Serviço Online': 'globe',
    'Serviço Veicular': 'car',
    'Serviço de Pet': 'paw',
    'Serviço Humano': 'user',
    'Serviços Comercial': 'store',
    Fretes: 'truck',
  };

  const subCategoryIcons: Record<string, string> = {
    Encanador: 'wrench', Eletricista: 'bolt', Pintor: 'paint-brush', Pedreiro: 'hammer',
    'Limpeza Residencial': 'broom', Jardinagem: 'leaf', 'Instalador de Eletrônicos': 'tv',
    'Reparos Elétricos': 'lightbulb', Carpinteiro: 'tools', 'Manutenção de Piscina': 'water',
    'Manutenção de Ar Condicionado': 'snowflake', Soldador: 'wrench', 'Conserto de Eletrodomésticos': 'cogs',
    'Produtor Musical(DJ)': 'music', 'Programação Front End': 'desktop', 'Programador Backend': 'server',
    'Gestão de Projeto': 'project-diagram', 'Suporte em TI': 'life-ring', 'Tester de Software': 'laptop-code',
    'Analista de Software': 'code', 'Consultor de Software': 'headset', 'Editor de Video': 'video',
    'Editor de Imagem': 'image', Redator: 'pen', 'Media Design': 'paint-brush', ÁudioVisual: 'headphones',
    Audio: 'volume-up', 'Mecanico De Carro': 'car', Manobrista: 'car-side', 'Lavagem de Carros': 'soap',
    'Mecanico de Moto': 'motorcycle', 'Cuidador de Pet': 'paw', 'Hospedagem de Pet': 'hotel',
    'Vacinação de Pet': 'syringe', 'Passeio com Cães': 'dog', Tosador: 'cut', 'Cuidador de Idosos': 'blind',
    'Cuidador de criança': 'baby', 'Professor Particular': 'chalkboard-teacher', Massoterapia: 'spa',
    Fisioterapia: 'weight', 'Personal Organizer': 'cogs', 'Cuidador de pessoa com Deficiencia': 'wheelchair',
    'Personal Training': 'dumbbell', Acompanhante: 'user-friends', Manicure: 'hand-sparkles', Vendedor: 'store',
    'Diarista Comercial': 'broom', Segurança: 'shield-alt', Garçom: 'utensils', Tradutor: 'language',
    'Fotografia e Filmagem': 'camera-retro', Contador: 'calculator', 'Produtor de Festa': 'glass-cheers',
    'Serviço de Buffet': 'food', 'Transporte de Cargas': 'truck', Carona: 'taxi', Abastecedor: 'gas-pump',
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('Token not found');
        await axios.get<CategoryResponse[]>(`${apiUrl}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
      } finally {
        const cats = (Object.keys(categoryStructure) as CategoryNames[]).map((category) => ({
          id: category,
          name: category,
          icon: iconsCategories[category] || 'question-circle',
          subCategories: categoryStructure[category],
          subCategoryIcons: categoryStructure[category].map(
            (sub) => subCategoryIcons[sub] || 'question-circle'
          ),
        }));
        setCategories(cats);
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  function toggleCategory(categoryId: string) {
    if (expandedCategoryId === categoryId) {
      setIsClosing(true);
    } else {
      setExpandedCategoryId(categoryId);
      setIsClosing(false);
    }
  }

  function handleAnimationEnd() {
    if (isClosing) {
      setExpandedCategoryId(null);
      setIsClosing(false);
    }
  }

  function handleSubCategoryPress(subCategoryName: string) {
    router.push({ pathname: 'requisicao', params: { categoryName: subCategoryName } });
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#FACC15" />;
  }

  return (
    <View className="mt-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mx-3">
        {categories.map((cat) => (
          <View key={cat.id} className="mr-2">
            <Pressable
              className="w-20 h-20 bg-white border border-yellow-600 rounded-lg items-center justify-center"
              onPress={() => toggleCategory(cat.id)}
            >
              <FontAwesome5 name={cat.icon} size={24} color="#FACC15" />
              <Text className="text-xs text-center mt-1">{cat.name}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {expandedCategoryId && (
        <Animatable.View
          animation={isClosing ? 'fadeOutDown' : 'fadeInUp'}
          easing="ease-in-out"
          duration={350}
          onAnimationEnd={handleAnimationEnd}
          className="mt-4 mx-4 bg-white border border-gray-300 rounded-lg p-4"
        >
          <View className="flex-row justify-end">
            <Pressable onPress={() => setIsClosing(true)}>
              <FontAwesome5 name="times" size={20} color="#FACC15" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xs text-gray-500 text-center">
              Subcategorias para {expandedCategoryId}
            </Text>

            {categories
              .find((cat) => cat.id === expandedCategoryId)
              ?.subCategories.map((subCat, index) => (
                <Pressable
                  key={index}
                  className="mt-2 p-2 bg-white border border-yellow-800 rounded flex-row items-center justify-center"
                  onPress={() => handleSubCategoryPress(subCat)}
                >
                  <FontAwesome5
                    name={categories.find((c) => c.id === expandedCategoryId)?.subCategoryIcons[index] || 'question-circle'}
                    size={16}
                    color="black"
                  />
                  <Text className="text-sm ml-2">{subCat}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </Animatable.View>
      )}
    </View>
  );
}
