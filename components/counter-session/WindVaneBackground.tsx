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
import { COUNTER_S5_HUB_THEME as T } from './counterSessionTheme';

const ARROWS = [
  { left: '10%', top: '18%', rotation: '45deg', delay: 0 },
  { left: '70%', top: '12%', rotation: '-30deg', delay: 350 },
  { left: '48%', top: '32%', rotation: '90deg', delay: 700 },
  { left: '82%', top: '42%', rotation: '0deg', delay: 200 },
] as const;

const WIND_LINES = [
  { top: '24%', width: '28%', delay: 0 },
  { top: '48%', width: '36%', delay: 450 },
  { top: '62%', width: '22%', delay: 900 },
] as const;

function CompassArrow({
  left,
  top,
  rotation,
  delay,
}: {
  left: string;
  top: string;
  rotation: string;
  delay: number;
}) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation }, { translateX: sway.value * 8 - 4 }],
    opacity: 0.28 + sway.value * 0.22,
  }));

  return (
    <Animated.Text style={[styles.arrow, { left, top }, style]} pointerEvents="none">
      🧭
    </Animated.Text>
  );
}

function WindLine({ top, width, delay }: { top: string; width: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + drift.value * 0.2,
    transform: [{ translateX: drift.value * 24 - 12 }],
  }));

  return (
    <Animated.View style={[styles.windLine, { top, width }, style]} pointerEvents="none" />
  );
}

export function WindVaneBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.25,
    transform: [{ scale: 0.9 + glow.value * 0.12 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.vaneGlow, glowStyle]} />
      {WIND_LINES.map((line, i) => (
        <WindLine key={i} {...line} />
      ))}
      {ARROWS.map((arrow, i) => (
        <CompassArrow key={i} {...arrow} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  vaneGlow: {
    position: 'absolute',
    left: '35%',
    top: '10%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.35)',
  },
  arrow: {
    position: 'absolute',
    fontSize: 28,
  },
  windLine: {
    position: 'absolute',
    left: '8%',
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 116, 144, 0.35)',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
    opacity: 0.1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
});
