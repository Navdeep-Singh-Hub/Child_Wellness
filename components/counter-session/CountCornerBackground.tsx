import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COUNTER_S2_HUB_THEME as T } from './counterSessionTheme';

const NUMBERS = [
  { left: '8%', top: '22%', emoji: '①', delay: 0 },
  { left: '72%', top: '16%', emoji: '②', delay: 300 },
  { left: '42%', top: '38%', emoji: '③', delay: 600 },
] as const;

const BOOKS = [
  { left: '14%', bottom: '20%', delay: 0 },
  { left: '68%', bottom: '18%', delay: 400 },
] as const;

function FloatNumber({ left, top, emoji, delay }: { left: string; top: string; emoji: string; delay: number }) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
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
  }, [delay, float]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -float.value * 12 }],
    opacity: 0.35 + float.value * 0.35,
  }));

  return (
    <Animated.Text style={[styles.number, { left, top }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

function StackBook({ left, bottom, delay }: { left: string; bottom: string; delay: number }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [bob, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value * -6 }],
    opacity: 0.4 + bob.value * 0.2,
  }));

  return (
    <Animated.Text style={[styles.book, { left, bottom }, style]} pointerEvents="none">
      📚
    </Animated.Text>
  );
}

export function CountCornerBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.25,
    transform: [{ scale: 0.92 + glow.value * 0.1 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.cornerGlow, glowStyle]} />
      {NUMBERS.map((n, i) => (
        <FloatNumber key={i} {...n} />
      ))}
      {BOOKS.map((b, i) => (
        <StackBook key={i} {...b} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  cornerGlow: {
    position: 'absolute',
    left: '30%',
    top: '8%',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  number: {
    position: 'absolute',
    fontSize: 22,
    color: 'rgba(180, 83, 9, 0.55)',
    fontWeight: '900',
  },
  book: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.45,
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
    opacity: 0.1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
});
