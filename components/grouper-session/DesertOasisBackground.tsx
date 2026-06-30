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
import { GROUPER_HUB_THEME as T } from './grouperSessionTheme';

const CACTI = [
  { left: '6%', bottom: '18%', emoji: '🌵', delay: 0 },
  { left: '82%', bottom: '14%', emoji: '🌵', delay: 200 },
  { left: '44%', bottom: '10%', emoji: '🪨', delay: 400 },
] as const;

const SAND_GRAINS = [
  { left: '18%', top: '55%', delay: 0 },
  { left: '62%', top: '48%', delay: 350 },
  { left: '78%', top: '62%', delay: 700 },
] as const;

function DriftCactus({ left, bottom, emoji, delay }: { left: string; bottom: string; emoji: string; delay: number }) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-2 + sway.value * 4}deg` }],
    opacity: 0.45 + sway.value * 0.15,
  }));

  return (
    <Animated.Text style={[styles.cactus, { left, bottom }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

function SandGrain({ left, top, delay }: { left: string; top: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -drift.value * 18 }, { translateX: drift.value * 10 }],
    opacity: 0.25 + drift.value * 0.35,
  }));

  return (
    <Animated.View style={[styles.grain, { left, top }, style]} pointerEvents="none" />
  );
}

export function DesertOasisBackground() {
  const sunPulse = useSharedValue(0.85);

  useEffect(() => {
    sunPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [sunPulse]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: sunPulse.value,
    transform: [{ scale: 0.92 + sunPulse.value * 0.08 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.sun, sunStyle]} />
      <View style={styles.duneBack} />
      <View style={styles.duneFront} />
      {CACTI.map((c) => (
        <DriftCactus key={`${c.left}-${c.emoji}`} {...c} />
      ))}
      {SAND_GRAINS.map((g) => (
        <SandGrain key={`${g.left}-${g.top}`} {...g} />
      ))}
      <Text style={styles.bird}>🦅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  sun: {
    position: 'absolute',
    top: '8%',
    right: '12%',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.sunGlow,
    shadowColor: T.accent,
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  duneBack: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    bottom: '-8%',
    height: '38%',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  duneFront: {
    position: 'absolute',
    left: '-15%',
    right: '-15%',
    bottom: '-12%',
    height: '28%',
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  cactus: { position: 'absolute', fontSize: 36 },
  grain: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.accentSoft,
  },
  bird: {
    position: 'absolute',
    top: '16%',
    left: '22%',
    fontSize: 22,
    opacity: 0.35,
  },
});
