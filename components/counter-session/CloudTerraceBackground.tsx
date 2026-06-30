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
import { COUNTER_HUB_THEME as T } from './counterSessionTheme';

const CLOUDS = [
  { left: '4%', top: '14%', size: 52, delay: 0 },
  { left: '48%', top: '9%', size: 64, delay: 280 },
  { left: '72%', top: '20%', size: 44, delay: 520 },
] as const;

const SPARKS = [
  { left: '16%', top: '44%', delay: 0 },
  { left: '58%', top: '40%', delay: 400 },
  { left: '82%', top: '52%', delay: 800 },
] as const;

function DriftCloud({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 16 }],
    opacity: 0.5 + drift.value * 0.25,
  }));

  return (
    <Animated.View
      style={[styles.cloud, { left, top, width: size, height: size * 0.5 }, style]}
      pointerEvents="none"
    />
  );
}

function Spark({ left, top, delay }: { left: string; top: string; delay: number }) {
  const pulse = useSharedValue(0.25);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1300 }),
          withTiming(0.2, { duration: 1300 })
        ),
        -1,
        false
      )
    );
  }, [delay, pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.Text style={[styles.spark, { left, top }, style]} pointerEvents="none">
      ✦
    </Animated.Text>
  );
}

export function CloudTerraceBackground() {
  const sunPulse = useSharedValue(0.88);

  useEffect(() => {
    sunPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [sunPulse]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + sunPulse.value * 0.2,
    transform: [{ scale: 0.95 + sunPulse.value * 0.08 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.sun, sunStyle]} />
      {CLOUDS.map((c, i) => (
        <DriftCloud key={i} {...c} />
      ))}
      {SPARKS.map((s, i) => (
        <Spark key={i} {...s} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  sun: {
    position: 'absolute',
    right: '10%',
    top: '6%',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(251, 191, 36, 0.35)',
    borderWidth: 3,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  spark: {
    position: 'absolute',
    fontSize: 14,
    color: 'rgba(56, 189, 248, 0.65)',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '22%',
    opacity: 0.12,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
