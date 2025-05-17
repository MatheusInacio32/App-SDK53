import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface SloganListProps {
  slogans: string[];
}

export function SloganList({ slogans }: SloganListProps) {
  return (
    <>
      {slogans.map((slogan, index) => (
        <View key={index} className="flex-row items-center mt-2">
          <FontAwesome5
            name="check-circle"
            size={20}
            color="#FBBF24"
            style={{ marginRight: 8 }}
          />
          <Text
            className="text-lg text-black"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            {slogan}
          </Text>
        </View>
      ))}
    </>
  );
}
