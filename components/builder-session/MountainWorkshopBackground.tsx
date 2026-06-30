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
import { OBJECT_SHELF_THEME as T } from './builderSessionTheme';

const CLOUDS = [
  { left: '5%', top: '12%', size: 48, delay: 0 },
  { left: '55%', top: '8%', size: 56, delay: 300 },
  { left: '78%', top: '18%', size: 40, delay: 600 },
] as const;

const SPARKLES = [
  { left: '12%', top: '42%', delay: 0 },
  { left: '72%', top: '38%', delay: 400 },
  { left: '44%', top: '52%', delay: 800 },
] as const;

function DriftCloud({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 14 }],
    opacity: 0.55 + drift.value * 0.2,
  }));

  return (
    <Animated.View
      style={[styles.cloud, { left, top, width: size, height: size * 0.55 }, style]}
      pointerEvents="none"
    />
  );
}

function Sparkle({ left, top, delay }: { left: string; top: string; delay: number }) {
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0.25, { duration: 1200 })
        ),
        -1,
        false
      )
    );
  }, [delay, pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.Text style={[styles.sparkle, { left, top }, style]} pointerEvents="none">
      ✨
    </Animated.Text>
  );
}

export function MountainWorkshopBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.peakLeft} />
      <View style={styles.peakRight} />
      <View style={styles.ground} />
      {CLOUDS.map((c, i) => (
        <DriftCloud key={`cloud-${i}`} {...c} />
      ))}
      {SPARKLES.map((s, i) => (
        <Sparkle key={`spark-${i}`} {...s} />
      ))}
      <Text style={styles.hintEmoji} pointerEvents="none">
        ⛰️
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  peakLeft: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderRightWidth: 200,
    borderBottomWidth: 140,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(167, 139, 250, 0.22)',
  },
  peakRight: {
    position: 'absolute',
    bottom: 0,
    right: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 180,
    borderRightWidth: 0,
    borderBottomWidth: 120,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(124, 58, 237, 0.18)',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(196, 181, 253, 0.15)',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 18,
    color: T.accentSoft,
  },
  hintEmoji: {
    position: 'absolute',
    right: 16,
    bottom: 56,
    fontSize: 28,
    opacity: 0.35,
  },
});
