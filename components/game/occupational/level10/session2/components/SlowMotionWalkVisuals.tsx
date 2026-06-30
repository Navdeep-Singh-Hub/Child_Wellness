/** Twilight slow-path backdrop — Slow Motion Walk */
import { SLOW_MOTION_WALK_THEME } from '@/components/game/occupational/level10/session2/slowMotionWalkTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const SlowMotionWalkVisuals: React.FC = () => {
  const moonGlow = useSharedValue(0);
  useEffect(() => {
    moonGlow.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [moonGlow]);

  const moonStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + moonGlow.value * 0.25,
    transform: [{ scale: 1 + moonGlow.value * 0.06 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SLOW_MOTION_WALK_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.moon, moonStyle]}>
        <Text style={styles.moonEmoji}>🌙</Text>
      </Animated.View>
      {SLOW_MOTION_WALK_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${6 + (i * 11) % 84}%`, top: `${12 + (i % 5) * 14}%`, opacity: 0.1 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.groundFog} />
    </View>
  );
};

const styles = StyleSheet.create({
  moon: { position: 'absolute', top: '6%', right: '10%' },
  moonEmoji: { fontSize: 36, opacity: 0.85 },
  groundFog: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(148,163,184,0.12)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
