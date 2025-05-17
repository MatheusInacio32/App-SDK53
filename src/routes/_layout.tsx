import { LogBox } from 'react-native';

// Remover erro do Expo Notifications
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
]);


import { Stack } from 'expo-router';
import '../../src/styles/global.css'; 
import { NotificationProvider } from '../../src/context/NotificationContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { ServicesProvider } from '../context/ServicesContext'; 

export default function Layout() {
  return (
    <PaperProvider>
      <NotificationProvider>
        <ServicesProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ServicesProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}
