import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GARDEN_FILL_THEME as T } from './gripSessionTheme';

const FLOATERS = [
  { emoji: '🦋', left: '10%', top: '12%', size: 26, delay: 0 },
  { emoji: '🌸', left: '78%', top: '16%', size: 24, delay: 300 },
  { emoji: '🌿', left: '6%', top: '55%', size: 22, delay: 700 },
  { emoji: '🐝', left: '84%', top: '48%', size: 20, delay: 500 },
  { emoji: '🌼', left: '14%', top: '78%', size: 22, delay: 900 },
  { emoji: '☀️', left: '80%', top: '8%', size: 28, delay: 200 },
] as const;

function FloatingGardenEmoji({
  emoji,
  left,
  top,
  size,
  delay,
}: {
  emoji: string;
  left: string;
  top: string;
  size: number;
  delay: number;
}) {
  const drift = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    sway.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(12, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
          withTiming(-12, { duration: 2600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: drift.value * -16 },
      { translateX: sway.value * 0.4 },
      { rotate: `${sway.value * 0.3}deg` },
    ],
    opacity: 0.3 + drift.value * 0.28,
  }));

  return (
    <Animated.Text style={[styles.floater, { left, top, fontSize: size }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export function GardenFillBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.hill, styles.hillBack]} />
      <View style={[styles.hill, styles.hillFront]} />
      {FLOATERS.map((f) => (
        <FloatingGardenEmoji key={`${f.emoji}-${f.left}`} {...f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  floater: { position: 'absolute' },
  hill: { position: 'absolute', borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  hillBack: {
    width: '140%',
    height: 180,
    backgroundColor: 'rgba(134, 239, 172, 0.25)',
    bottom: -40,
    left: '-20%',
  },
  hillFront: {
    width: '120%',
    height: 120,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    bottom: -50,
    right: '-15%',
  },
});
