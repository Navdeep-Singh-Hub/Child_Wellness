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
import { COUNTER_S10_HUB_THEME as T } from './counterSessionTheme';

const STARS = [
  { left: '10%', top: '12%', delay: 0 },
  { left: '78%', top: '8%', delay: 400 },
  { left: '62%', top: '22%', delay: 800 },
  { left: '32%', top: '18%', delay: 200 },
] as const;

function SummitStar({ left, top, delay }: { left: string; top: string; delay: number }) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + twinkle.value * 0.55,
    transform: [{ scale: 0.85 + twinkle.value * 0.25 }],
  }));

  return (
    <Animated.Text style={[styles.star, { left, top }, style]} pointerEvents="none">
      ✨
    </Animated.Text>
  );
}

export function SummitSkyBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.3,
    transform: [{ scale: 0.9 + glow.value * 0.15 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.summitGlow, glowStyle]} />
      <Animated.Text style={[styles.trophy, glowStyle]} pointerEvents="none">
        🏆
      </Animated.Text>
      {STARS.map((s, i) => (
        <SummitStar key={i} {...s} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  summitGlow: {
    position: 'absolute',
    left: '38%',
    top: '8%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.38)',
  },
  trophy: {
    position: 'absolute',
    left: '44%',
    top: '11%',
    fontSize: 36,
  },
  star: { position: 'absolute', fontSize: 20 },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '22%',
    opacity: 0.1,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
});
