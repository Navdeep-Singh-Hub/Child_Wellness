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
import { COUNTER_S3_HUB_THEME as T } from './counterSessionTheme';

const SHAPES = [
  { left: '10%', top: '18%', shape: '△', delay: 0 },
  { left: '68%', top: '12%', shape: '◇', delay: 280 },
  { left: '42%', top: '34%', shape: '○', delay: 520 },
  { left: '82%', top: '42%', shape: '△', delay: 760 },
] as const;

function FloatShape({ left, top, shape, delay }: { left: string; top: string; shape: string; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -drift.value * 14 }, { rotate: `${drift.value * 20}deg` }],
    opacity: 0.3 + drift.value * 0.35,
  }));

  return (
    <Animated.Text style={[styles.shape, { left, top }, style]} pointerEvents="none">
      {shape}
    </Animated.Text>
  );
}

export function ShapeSkywayBackground() {
  const pulse = useSharedValue(0.88);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.2,
    transform: [{ scale: 0.94 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.glow, pulseStyle]} />
      {SHAPES.map((s, i) => (
        <FloatShape key={i} {...s} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    right: '8%',
    top: '6%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.45)',
  },
  shape: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '900',
    color: 'rgba(109, 40, 217, 0.45)',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '22%',
    opacity: 0.1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
