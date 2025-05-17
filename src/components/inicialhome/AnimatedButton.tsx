import React from "react";
import { Animated, Pressable, Text } from "react-native";
import { useAnimatedPress } from "../../hooks/useAnimatedPress";

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
}

export function AnimatedButton({
  label,
  onPress,
  backgroundColor = "#FACC15",
}: AnimatedButtonProps) {
  const { scaleAnim, handlePressIn, handlePressOut } = useAnimatedPress();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          backgroundColor,
          paddingVertical: 16,
          borderRadius: 999,
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 5,
          marginVertical: 8,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#000",
            fontSize: 18,
            fontFamily: "Outfit_700Bold",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
