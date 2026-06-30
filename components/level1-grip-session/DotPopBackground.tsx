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
import { DOT_POP_THEME as T } from './gripSessionTheme';

const TWINKLES = [
  { left: '12%', top: '10%', size: 3, delay: 0 },
  { left: '28%', top: '22%', size: 2, delay: 200 },
  { left: '55%', top: '8%', size: 4, delay: 400 },
  { left: '78%', top: '18%', size: 2, delay: 100 },
  { left: '88%', top: '35%', size: 3, delay: 600 },
  { left: '8%', top: '45%', size: 2, delay: 300 },
  { left: '42%', top: '55%', size: 3, delay: 500 },
  { left: '70%', top: '62%', size: 2, delay: 800 },
  { left: '22%', top: '72%', size: 4, delay: 150 },
  { left: '92%', top: '78%', size: 2, delay: 450 },
] as const;

const FLOATERS = [
  { emoji: '🪐', left: '6%', top: '28%', size: 28, delay: 0 },
  { emoji: '🌙', left: '82%', top: '12%', size: 26, delay: 500 },
  { emoji: '☄️', left: '78%', top: '70%', size: 22, delay: 900 },
  { emoji: '🛸', left: '10%', top: '68%', size: 24, delay: 700 },
] as const;

function TwinkleDot({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 + delay % 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.15, { duration: 1200 + delay % 400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.twinkle,
        { left, top, width: size, height: size, borderRadius: size },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

function FloatingSpaceEmoji({
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

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -18 }],
    opacity: 0.35 + drift.value * 0.2,
  }));

  return (
    <Animated.Text style={[styles.floater, { left, top, fontSize: size }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export function DotPopBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.nebulaA} />
      <View style={styles.nebulaB} />
      {TWINKLES.map((t, i) => (
        <TwinkleDot key={`tw-${i}`} {...t} />
      ))}
      {FLOATERS.map((f) => (
        <FloatingSpaceEmoji key={`${f.emoji}-${f.left}`} {...f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  twinkle: {
    position: 'absolute',
    backgroundColor: T.accentSoft,
  },
  floater: { position: 'absolute' },
  nebulaA: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    top: -80,
    right: -60,
  },
  nebulaB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    bottom: 60,
    left: -70,
  },
});
