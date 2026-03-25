// Floating particles background for Standing Lines module
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const PARTICLES: Particle[] = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 8 + 4,
  duration: Math.random() * 3000 + 2000,
  delay: Math.random() * 1000,
}));

export default function FloatingParticles() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {PARTICLES.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

function Particle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-30, {
        duration: particle.duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.6, {
        duration: particle.duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: '#93C5FD',
        },
        animatedStyle,
      ]}
    />
  );
}
