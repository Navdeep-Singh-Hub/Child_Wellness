// Floating particles background effect for The Grouper
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 8;

export default function FloatingParticles() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: useSharedValue(Math.random() * 100),
    y: useSharedValue(Math.random() * 100),
    size: Math.random() * 20 + 10,
    duration: Math.random() * 3000 + 2000,
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      particle.x.value = withRepeat(
        withTiming(Math.random() * 100, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
      particle.y.value = withRepeat(
        withTiming(Math.random() * 100, {
          duration: particle.duration * 1.5,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => {
        const animatedStyle = useAnimatedStyle(() => ({
          position: 'absolute',
          left: `${particle.x.value}%`,
          top: `${particle.y.value}%`,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: '#A5B4FC',
          opacity: 0.2,
        }));

        return <Animated.View key={particle.id} style={animatedStyle} />;
      })}
    </View>
  );
}
