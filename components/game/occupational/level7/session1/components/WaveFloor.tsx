/**
 * WaveFloor — animated ocean-wave overlay for Wave Walker game.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  phase: number;
  intensity: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const WaveFloor: React.FC<Props> = ({ phase, intensity }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift]);

  const wave1 = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.value - 0.5) * 24 }],
    opacity: 0.35 + clamp01(intensity) * 0.35,
  }));

  const wave2 = useAnimatedStyle(() => ({
    transform: [{ translateX: (0.5 - drift.value) * 18 }],
    opacity: 0.25 + Math.sin(phase * Math.PI * 2) * 0.15 + 0.2,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.wave, styles.waveA, wave1]} />
      <Animated.View style={[styles.wave, styles.waveB, wave2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  wave: { position: 'absolute', left: -20, right: -20, height: 80, borderRadius: 40 },
  waveA: { bottom: 8, backgroundColor: 'rgba(34,211,238,0.35)' },
  waveB: { bottom: 28, backgroundColor: 'rgba(14,116,144,0.3)', height: 60 },
});
