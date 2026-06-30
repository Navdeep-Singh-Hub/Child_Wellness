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
import { COUNTER_S6_HUB_THEME as T } from './counterSessionTheme';

const EAGLES = [
  { left: '8%', top: '14%', delay: 0 },
  { left: '62%', top: '8%', delay: 400 },
  { left: '78%', top: '30%', delay: 800 },
] as const;

const CLOUDS = [
  { left: '20%', top: '42%', delay: 200 },
  { left: '50%', top: '55%', delay: 600 },
] as const;

function EagleFloat({ left, top, delay }: { left: string; top: string; delay: number }) {
  const glide = useSharedValue(0);

  useEffect(() => {
    glide.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, glide]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: glide.value * 18 - 9 }, { translateY: -glide.value * 8 }],
    opacity: 0.3 + glide.value * 0.25,
  }));

  return (
    <Animated.Text style={[styles.eagle, { left, top }, style]} pointerEvents="none">
      🦅
    </Animated.Text>
  );
}

function LookoutCloud({ left, top, delay }: { left: string; top: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.2 + drift.value * 0.15,
    transform: [{ translateX: drift.value * 12 }],
  }));

  return (
    <Animated.Text style={[styles.cloud, { left, top }, style]} pointerEvents="none">
      ☁️
    </Animated.Text>
  );
}

export function EagleLookoutBackground() {
  const sun = useSharedValue(0.85);

  useEffect(() => {
    sun.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [sun]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + sun.value * 0.25,
    transform: [{ scale: 0.9 + sun.value * 0.14 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.sunGlow, sunStyle]} />
      {CLOUDS.map((c, i) => (
        <LookoutCloud key={i} {...c} />
      ))}
      {EAGLES.map((e, i) => (
        <EagleFloat key={i} {...e} />
      ))}
      <View style={[styles.cliff, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  sunGlow: {
    position: 'absolute',
    right: '12%',
    top: '10%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.45)',
  },
  eagle: { position: 'absolute', fontSize: 26 },
  cloud: { position: 'absolute', fontSize: 32, opacity: 0.25 },
  cliff: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '16%',
    opacity: 0.12,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
