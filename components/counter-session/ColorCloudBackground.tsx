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
import { COUNTER_S4_HUB_THEME as T } from './counterSessionTheme';

const BLOBS = [
  { left: '6%', top: '16%', color: '#FCA5A5', delay: 0 },
  { left: '58%', top: '10%', color: '#93C5FD', delay: 250 },
  { left: '78%', top: '28%', color: '#FDE68A', delay: 500 },
  { left: '32%', top: '38%', color: '#86EFAC', delay: 750 },
] as const;

function ColorBlob({ left, top, color, delay }: { left: string; top: string; color: string; delay: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + pulse.value * 0.2 }, { translateY: -pulse.value * 10 }],
    opacity: 0.35 + pulse.value * 0.3,
  }));

  return (
    <Animated.View
      style={[styles.blob, { left, top, backgroundColor: color }, style]}
      pointerEvents="none"
    />
  );
}

export function ColorCloudBackground() {
  const glow = useSharedValue(0.88);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.88, { duration: 2600, easing: Easing.inOut(Easing.sin) })
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
      <Animated.View style={[styles.glow, glowStyle]} />
      {BLOBS.map((b, i) => (
        <ColorBlob key={i} {...b} />
      ))}
      <View style={[styles.horizon, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    left: '38%',
    top: '8%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(244, 114, 182, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(244, 114, 182, 0.4)',
  },
  blob: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
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
