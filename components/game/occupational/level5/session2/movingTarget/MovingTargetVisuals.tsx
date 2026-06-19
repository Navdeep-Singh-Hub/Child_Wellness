/** Neon Arcade visuals — OT L5 S2 Game 4 */
import { MOVING_TARGET_THEME as T } from '@/components/game/occupational/level5/session2/movingTarget/movingTargetTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function NeonGridBackdrop() {
  const sweep = useSharedValue(0);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false);
  }, [sweep]);
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(sweep.value, [0, 1], [0, 360])}deg` }],
    opacity: 0.25,
  }));

  const vLines = Array.from({ length: 9 });
  const hLines = Array.from({ length: 12 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {vLines.map((_, i) => (
        <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i / 8) * 100}%` }]} />
      ))}
      {hLines.map((_, i) => (
        <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i / 11) * 100}%` }]} />
      ))}
      <Animated.View style={[styles.radarSweep, sweepStyle]} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
    </View>
  );
}

export function NeonOrb({ size, scale }: { size: number; scale: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.5 + pulse.value * 0.5, transform: [{ scale: 1 + pulse.value * 0.08 }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
      <Animated.View style={[styles.orbGlow, { width: size * 1.5, height: size * 1.5, borderRadius: size }, glow]} />
      <LinearGradient colors={['#22D3EE', '#A855F7', '#EC4899']} style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={styles.orbCore} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(34,211,238,0.12)' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(167,139,250,0.12)' },
  radarSweep: { position: 'absolute', alignSelf: 'center', top: '30%', width: 2, height: '40%', backgroundColor: '#22D3EE', transformOrigin: 'center bottom' },
  glowTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(34,211,238,0.08)' },
  glowBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(236,72,153,0.08)' },
  orbGlow: { position: 'absolute', backgroundColor: 'rgba(34,211,238,0.35)' },
  orb: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  orbCore: { width: '35%', height: '35%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)' },
});
