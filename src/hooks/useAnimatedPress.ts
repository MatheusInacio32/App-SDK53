import { useRef, useState } from "react";
import { Animated } from "react-native";

export function useAnimatedPress(initialValue: number = 1) {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;
  const [buttonPressed, setButtonPressed] = useState(false);

  const handlePressIn = () => {
    setButtonPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setButtonPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return {
    scaleAnim,
    buttonPressed,
    handlePressIn,
    handlePressOut,
  };
}
