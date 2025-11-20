import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const PressableScale = ({ children, onPress, style, scaleTo = 0.98, duration = 100, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.timing(scale, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        onPressIn={() => !disabled && animateTo(scaleTo)}
        onPressOut={() => animateTo(1)}
        onPress={onPress}
        disabled={disabled}
        style={{}}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default PressableScale;
