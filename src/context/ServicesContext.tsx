// src/context/ServicesContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { apiUrl } from 'src/api/apiconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ServiceRequest {
  id: number;
  addressId: string;
  scheduledDate: string; 
  minValue: number;
  maxValue: number;
  status: 'Aguardando prestador' | 'Prestador aceitou' | 'Concluído';
}

interface ServicesContextData {
  requests: ServiceRequest[];
  createServiceRequest: (newRequest: Omit<ServiceRequest, 'id' | 'status'>) => Promise<void>;
  updateServiceStatus: (serviceId: number, newStatus: ServiceRequest['status']) => void;
}

const ServicesContext = createContext<ServicesContextData | undefined>(undefined);

// Utilize variáveis de ambiente para a URL do backend se possível
const BACKEND_URL = apiUrl;

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  // Conexão via Socket.IO para receber atualizações em tempo real
  useEffect(() => {
    const socket = io(BACKEND_URL);
    socket.on('serviceAccepted', (data: { serviceId: number }) => {
      // Atualiza o status do serviço quando o prestador aceita
      updateServiceStatus(data.serviceId, 'Prestador aceitou');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Cria uma nova solicitação de serviço via API
  async function createServiceRequest(newRequest: Omit<ServiceRequest, 'id' | 'status'>) {
    // Validação local para evitar conflito de horário
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Token not found');
  
      // Debugar: Imprimir o objeto newRequest no terminal
      console.log('Requisição de novo serviço:', newRequest);
  
      const response = await axios.post(`${BACKEND_URL}/order-request`, newRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        const createdService: ServiceRequest = {
          ...response.data,
          status: 'Aguardando prestador', // Define status inicial
        };
        // Atualiza o estado global com o novo serviço criado
        setRequests(prev => [...prev, createdService]);
      }
    } catch (error: any) {
      // Captura erros e repassa mensagem adequada
      throw new Error(error.response?.data?.message || error.message);
    }
  }
  

  // Atualiza o status do serviço (acionado via Socket.IO)
  function updateServiceStatus(serviceId: number, newStatus: ServiceRequest['status']) {
    setRequests(prev =>
      prev.map(service =>
        service.id === serviceId ? { ...service, status: newStatus } : service
      )
    );
  }

  return (
    <ServicesContext.Provider value={{ requests, createServiceRequest, updateServiceStatus }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}
