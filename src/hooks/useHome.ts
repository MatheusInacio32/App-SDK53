// src/hooks/useHome.ts
import { useState } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export function useHome() {
  const [address] = useState('Meu Endereços');

  const [categories] = useState([
    { id: 1, name: 'Serviço Doméstico', icon: 'home', faIcon: 'home' },
    { id: 2, name: 'Serviços de Software', icon: 'code', faIcon: 'code' },
    { id: 3, name: 'Serviço Online', icon: 'globe', faIcon: 'globe' },
    { id: 4, name: 'Serviço Veicular', icon: 'car', faIcon: 'car' },
    { id: 5, name: 'Serviço de Pet', icon: 'paw', faIcon: 'paw' },
    { id: 6, name: 'Serviço Humano', icon: 'user', faIcon: 'user' },
    { id: 7, name: 'Serviços Comerciais', icon: 'store', faIcon: 'store' },
    { id: 8, name: 'Outros', icon: 'ellipsis-h', faIcon: 'ellipsis-h' },
  ]);

  const [rankingPrestadores] = useState([
    { id: 1, name: 'Eduardo', area: 'Hidráulica', image: require('../assets/image.png') },
    { id: 2, name: 'Nathan', area: 'Profissional Linux', image: require('../assets/image.png') },
    { id: 3, name: 'Enzo', area: 'Eletricista', image: require('../assets/image.png') },
  ]);

  const [faqs] = useState<FaqItem[]>([
    {
      question: 'Como altero meus dados de perfil?',
      answer:
        'Acesse o menu “Perfil” no canto superior, clique em “Editar informações” e salve as alterações.',
    },
    {
      question: 'Como solicito um reembolso?',
      answer:
        'No histórico de serviços, localize a transação e escolha “Solicitar reembolso”. Nosso time entrará em contato em até 48h.',
    },
    {
      question: 'Posso agendar um serviço para outra data?',
      answer:
        'Sim. Ao criar a solicitação, selecione a data desejada no calendário de agendamento.',
    },
    {
      question: 'Como dou feedback para um prestador?',
      answer:
        'Após a conclusão do serviço, vá em “Avaliações” e deixe sua nota e comentário.',
    },
    {
      question: 'Como ativo ou desativo notificações?',
      answer:
        'No menu “Configurações” escolha “Notificações” e ajuste conforme sua preferência.',
    },
  ]);

  return {
    address,
    categories,
    rankingPrestadores,
    faqs,
  };
}
