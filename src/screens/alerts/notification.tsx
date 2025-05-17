import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useNotification, NotificationContent } from '../../context/NotificationContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const { notificationList, scheduleRandomNotification, resetUnread, clearAll } = useNotification();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      resetUnread();
    }, [resetUnread])
  );

  const simulateScale = useRef(new Animated.Value(1)).current;
  const clearScale    = useRef(new Animated.Value(1)).current;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="mt-4 ml-4">
        <FontAwesome5 name="arrow-left" size={24} color="#FFD700" />
      </TouchableOpacity>
      <View style={{ paddingTop: insets.top }} className="flex-1 px-4">
        <Text className="text-xl font-bold mb-4 text-center">Notificações</Text>
        <ScrollView className="flex-1 mb-4">
          {notificationList.length === 0 ? (
            <Text className="text-gray-500 text-center">
              Nenhuma notificação encontrada.
            </Text>
          ) : (
            notificationList.map((notif: NotificationContent, i: number) => (
              <View key={i} className="bg-white p-4 rounded-md shadow mb-4">
                <Text className="font-bold text-lg">{notif.title}</Text>
                <Text className="mt-1 text-base text-gray-700">{notif.body}</Text>
              </View>
            ))
          )}
        </ScrollView>
        <View className="flex-row justify-between">
          <AnimatedPressable
            onPressIn={() =>
              Animated.spring(simulateScale, { toValue: 0.95, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(simulateScale, { toValue: 1, useNativeDriver: true }).start()
            }
            onPress={scheduleRandomNotification}
            className="bg-blue-500 flex-1 p-3 rounded-md mr-2 mb-4"
            style={{ transform: [{ scale: simulateScale }] }}
          >
            <Text className="text-white font-bold text-center">
              Simular Notificação
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPressIn={() =>
              Animated.spring(clearScale, { toValue: 0.95, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(clearScale, { toValue: 1, useNativeDriver: true }).start()
            }
            onPress={clearAll}
            className="bg-red-500 flex-1 p-3 rounded-md ml-2 mb-4"
            style={{ transform: [{ scale: clearScale }] }}
          >
            <Text className="text-white font-bold text-center">
              Limpar Lista
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
