import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { apiUrl } from 'src/api/apiconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cpfMask = (value: string): string =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let firstCheck = 11 - (sum % 11);
  if (firstCheck >= 10) firstCheck = 0;
  if (firstCheck !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let secondCheck = 11 - (sum % 11);
  if (secondCheck >= 10) secondCheck = 0;
  if (secondCheck !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

export default function CadastroPart2() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold,
  });

  const router = useRouter();
  const params = useLocalSearchParams() as {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  const { name, surname, email, password, phone } = params;

  const [cpf, setCpf] = useState<string>('');
  const [accepted, setAccepted] = useState<boolean>(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

  const scaleAnimButton = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleAnimButton, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnimButton, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isCpfValid = validateCPF(cpf);
  const isFormValid = isCpfValid && accepted;

  const termsText = `
1. INTRODUÇÃO
O presente Termo de Uso regula a utilização do aplicativo Dou Um Help! pelo cliente, estabelecendo diretrizes, direitos e deveres das partes envolvidas. Ao acessar e utilizar o aplicativo, o usuário declara que leu, compreendeu e concorda com todas as condições aqui estabelecidas.

2. DEFINIÇÕES
• Plataforma: Aplicativo Dou Um Help!, que conecta clientes a prestadores de serviço.
• Cliente: Usuário que contrata serviços por meio do aplicativo.
• Prestador de Serviço: Profissional cadastrado para oferecer serviços aos clientes.
• Conta de Usuário: Registro pessoal no aplicativo, contendo dados cadastrais e histórico de uso.

3. CADASTRO E USO DA PLATAFORMA
3.1 Para utilizar o aplicativo, o cliente deve fornecer informações verídicas e atualizadas, incluindo nome, CPF, telefone e e‑mail.
3.2 O cliente é responsável por manter a confidencialidade de seu login e senha, não podendo compartilhá‑los com terceiros.
3.3 A plataforma se reserva o direito de suspender ou excluir contas em caso de uso indevido, informações falsas ou violação dos termos.

4. OBRIGAÇÕES DO USUÁRIO (CLIENTE)
4.1 Utilizar o aplicativo de forma lícita, respeitando as leis vigentes e os direitos de terceiros.
4.2 Não fornecer informações falsas ou enganosas ao criar a conta ou ao solicitar serviços.
4.3 Respeitar os prestadores de serviço, mantendo um comportamento ético e respeitoso durante a contratação e execução dos serviços.
4.4 Realizar o pagamento dos serviços contratados conforme estabelecido na plataforma.
4.5 Não utilizar a plataforma para atividades ilegais, abusivas ou discriminatórias.
4.6 Fornecer feedbacks verídicos e justos sobre os serviços prestados, evitando calúnia ou difamação.
4.7 Não solicitar serviços fora da plataforma para evitar fraudes e manter a segurança das transações.
4.8 Informar imediatamente a plataforma em caso de problemas com o prestador ou dúvidas sobre pagamentos.
4.9 Zelar pela segurança dos dados pessoais, evitando compartilhá‑los com terceiros sem necessidade.
4.10 É proibido realizar pagamentos fora do aplicativo. Todos os pagamentos devem ser efetuados exclusivamente dentro da plataforma.

5. OBRIGAÇÕES DA PLATAFORMA
5.1 Garantir a disponibilidade do aplicativo, salvo em casos de manutenção ou problemas técnicos.
5.2 Oferecer suporte ao cliente para esclarecimento de dúvidas e resolução de problemas.
5.3 Proteger os dados dos usuários conforme a legislação vigente de proteção de dados.
5.4 Monitorar e, se necessário, tomar medidas contra usuários que descumpram os termos de uso.

6. POLÍTICA DE PAGAMENTO
6.1 Os pagamentos serão realizados por meio dos métodos disponíveis na plataforma.
6.2 O cliente é responsável por verificar os valores e condições antes de concluir uma transação.
6.3 Em caso de cancelamento ou reembolso, serão aplicadas as políticas específicas descritas no aplicativo.
6.4 O pagamento deve ser realizado exclusivamente dentro do aplicativo. Quando um serviço for solicitado e aprovado, um link de pagamento será gerado. Caso o usuário tente realizar o pagamento fora do aplicativo, o prestador não estará autorizado a atender e a plataforma não se responsabiliza por qualquer situação fora dela.

7. POLÍTICA DE PRIVACIDADE
7.1 Os dados fornecidos pelo cliente serão utilizados apenas para operações relacionadas ao uso do aplicativo.
7.2 O Dou Um Help! adota medidas de segurança para proteger os dados dos usuários contra acessos não autorizados.

8. CANCELAMENTO E EXCLUSÃO DE CONTA
8.1 O cliente pode solicitar a exclusão de sua conta a qualquer momento pelo aplicativo.
8.2 A plataforma pode encerrar a conta do cliente em caso de descumprimento dos termos de uso.

9. ALTERAÇÕES NOS TERMOS DE USO
9.1 O Dou Um Help! pode modificar estes termos a qualquer momento, notificando os usuários com antecedência.

10. DISPOSIÇÕES GERAIS
10.1 Estes termos são regidos pelas leis brasileiras.
10.2 Qualquer controvérsia será solucionada no foro da cidade‑sede da empresa Dou Um Help!.

Ao utilizar o aplicativo, o cliente concorda integralmente com este Termo de Uso.
  `.trim();

  const handleContinue = async () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }

    const registrationData = {
      firstName: name || '',
      lastName: surname || '',
      email: email || '',
      hashPassword: password || '',
      telephone: phone || '',
      cpf: cpf.replace(/\D/g, ''),
    };

    try {
      await axios.post(`${apiUrl}/auth/register/pf`, registrationData);

      // Após cadastro bem-sucedido, faz login automaticamente
      const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
        email: registrationData.email,
        hashPassword: password,
      });

      const token = loginResponse.data.token;
      await AsyncStorage.setItem('authToken', token);
      router.push('home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. Tente novamente.');
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
          Carregando...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white px-4">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 w-full justify-between mt-10">
              {/* Header */}
              <View className="mt-4">
                <View className="flex-row items-center">
                  <FontAwesome5
                    name="arrow-circle-right"
                    size={36}
                    color="#FACC15"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    className="text-5xl font-bold text-black"
                    style={{ fontFamily: 'Outfit_700Bold', textAlign: 'left' }}
                  >
                    Apenas mais um passo para terminar sua conta
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View className="flex-1 justify-center mt-6">
                {/* CPF */}
                <View className="mb-4">
                  <Text className="text-base text-black mb-2" style={{ fontFamily: 'Outfit_400Regular' }}>
                    CPF (Campo obrigatório)
                  </Text>
                  <View className="flex-row items-center area-texto rounded-lg px-3 py-1">
                    <TextInput
                      className="flex-1 text-base text-black"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                      placeholder="Digite seu CPF"
                      keyboardType="numeric"
                      value={cpf}
                      onChangeText={(text: string) => {
                        const cleaned = text.replace(/\D/g, '');
                        const masked = cpfMask(cleaned);
                        setCpf(masked);
                        if (attemptedSubmit) setAttemptedSubmit(false);
                      }}
                    />
                  </View>
                  {attemptedSubmit && !isCpfValid && (
                    <Text className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                      CPF inválido. Por favor, verifique.
                    </Text>
                  )}
                </View>

                {/* Termos */}
                <View className="mb-4 h-48 bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <ScrollView showsVerticalScrollIndicator>
                    <Text
                      className="text-lg font-bold text-black mb-2"
                      style={{ fontFamily: 'Times New Roman', fontWeight: 'bold' }}
                    >
                      Termos e Condições
                    </Text>
                    <Text
                      className="text-base text-black leading-6"
                      style={{ fontFamily: 'Times New Roman', lineHeight: 22 }}
                    >
                      {termsText}
                    </Text>
                  </ScrollView>
                </View>

                {/* Aceite */}
                <View className="mb-4">
                  <Pressable onPress={() => setAccepted(!accepted)} className="flex-row items-center">
                    {accepted ? (
                      <FontAwesome5 name="check-square" size={24} color="#FACC15" className="mr-2" />
                    ) : (
                      <FontAwesome5 name="square" size={24} color="#ccc" className="mr-2" />
                    )}
                    <Text className="text-base text-black" style={{ fontFamily: 'Outfit_400Regular' }}>
                      Estou ciente e aceito os Termos e Condições da empresa
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Botão */}
              <View className="mb-8 items-center">
                <Animated.View style={{ transform: [{ scale: scaleAnimButton }], width: '80%' }}>
                  <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleContinue}
                    style={{
                      backgroundColor: isFormValid ? '#FACC15' : '#ccc',
                      paddingVertical: 16,
                      borderRadius: 999,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOpacity: 0.4,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-xl text-black font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
                      Continuar
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
