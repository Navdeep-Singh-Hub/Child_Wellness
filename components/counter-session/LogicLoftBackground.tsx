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
import { COUNTER_S9_HUB_THEME as T } from './counterSessionTheme';

const FLOATERS = [
  { left: '8%', top: '14%', emoji: '💡', delay: 0 },
  { left: '72%', top: '8%', emoji: '🧩', delay: 500 },
  { left: '58%', top: '28%', emoji: '⚙️', delay: 900 },
  { left: '18%', top: '38%', emoji: '🔢', delay: 300 },
] as const;

function LoftFloat({ left, top, emoji, delay }: { left: string; top: string; emoji: string; delay: number }) {
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
    transform: [{ translateY: -bob.value * 12 }, { rotate: `${-6 + bob.value * 12}deg` }],
    opacity: 0.28 + bob.value * 0.22,
  }));

  return (
    <Animated.Text style={[styles.float, { left, top }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export function LogicLoftBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glow.value * 0.25,
    transform: [{ scale: 0.92 + glow.value * 0.1 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.loftGlow, glowStyle]} />
      {FLOATERS.map((f, i) => (
        <LoftFloat key={i} {...f} />
      ))}
      <View style={[styles.shelf, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  loftGlow: {
    position: 'absolute',
    left: '42%',
    top: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(129, 140, 248, 0.22)',
    borderWidth: 2,
    borderColor: 'rgba(129, 140, 248, 0.38)',
  },
  float: { position: 'absolute', fontSize: 26 },
  shelf: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '18%',
    height: 6,
    opacity: 0.15,
    borderRadius: 3,
  },
});
