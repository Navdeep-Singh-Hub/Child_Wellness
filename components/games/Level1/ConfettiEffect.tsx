import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring, 
  withRepeat,
  withSequence
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = ['#FFC107', '#E91E63', '#00BCD4', '#4CAF50', '#9C27B0', '#FF5722'];
const SHAPES = ['square', 'circle'];

interface ConfettiPieceProps {
  delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay }) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const targetX = startX + (Math.random() - 0.5) * 200;
  const targetY = SCREEN_HEIGHT + 100;
  
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const size = 10 + Math.random() * 10;
  
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(targetY, { duration: 3000 + Math.random() * 2000 })
    );
    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration: 3000 + Math.random() * 2000 })
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1000 }), -1, false)
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { rotateX: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: shape === 'circle' ? size / 2 : 0,
        },
        animatedStyle
      ]} 
    />
  );
};

export const ConfettiEffect = () => {
  // Generate 80 confetti pieces
  const pieces = Array.from({ length: 80 }).map((_, i) => (
    <ConfettiPiece key={i} delay={Math.random() * 1000} />
  ));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces}
    </View>
  );
};
