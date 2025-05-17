import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNotification } from '../../context/NotificationContext';
import { useHome } from '../../hooks/useHome';
import { Menu } from './SideMenu';


type NavbarProps = {
  fontRegular?: string;
  fontBold?: string;
};

export function Navbar({ fontRegular, fontBold }: NavbarProps) {
  const router = useRouter();
  const { unreadCount } = useNotification();
  const { address } = useHome();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scheduleRandomNotification } = useNotification();

  return (
    <>
      <Menu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        fontRegular={fontRegular || 'Outfit_400Regular'}
        fontBold={fontBold || 'Outfit_700Bold'}
      />

      <SafeAreaView style={tw`bg-white`}>
        <StatusBar style="dark" translucent />
      </SafeAreaView>

      <View style={tw`flex-row items-center bg-white shadow-md px-4 py-2`}>  
        <Pressable style={tw`p-2`} onPress={() => setIsMenuOpen(true)}>
          <FontAwesome5 name="bars" size={20} color="#854d0e" />
        </Pressable>

        <View style={tw`flex-1 items-center`}> 
          <Pressable onPress={() => { router.push('adresses'),scheduleRandomNotification() }}>
            <View style={tw`flex-row items-center`}> 
              <FontAwesome5
                name="map-marker-alt"
                size={16}
                color="black"
                style={tw`mr-3 ml-6`}
              />
              <Text style={fontBold ? { fontFamily: fontBold } : undefined}>
                {address}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={tw`flex-row`}> 
          <Pressable
            style={tw`p-2 mr-2 relative`}
            onPress={() => router.push('notification')}
          >
            <FontAwesome5 name="bell" size={20} color="black" />
            {unreadCount > 0 && (
              <View style={tw`absolute top-[2px] right-[2px] bg-red-500 w-4 h-4 rounded-full justify-center items-center`}> 
                <Text style={tw`text-white text-[10px]`}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable style={tw`p-2`} onPress={() => router.push('perfil')}>
            <FontAwesome5 name="user" size={20} color="#854d0e" />
          </Pressable>
        </View>
      </View>
    </>
  );
}
