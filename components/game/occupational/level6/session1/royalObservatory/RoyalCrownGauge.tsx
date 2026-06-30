/**
 * Royal crown gauge — wobbling crown, halo ring, safe % and round timer.
 */
import { RO } from './royalObservatoryTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  stability: number;
  safePct: number;
  remainSec: number;
  totalSec: number;
  reduceMotion?: boolean;
};

export function RoyalCrownGauge({ stability, safePct, remainSec, totalSec, reduceMotion = false }: Props) {
  const wobble = useSharedValue(0);
  const haloPulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    wobble.value = withRepeat(withTiming(1, { duration: 550 }), -1, true);
    haloPulse.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [reduceMotion, wobble, haloPulse]);

  const crownStyle = useAnimatedStyle(() => {
    const instability = 1 - stability;
    const tilt = (wobble.value - 0.5) * 2 * instability * 22;
    const drop = instability * 12;
    return { transform: [{ translateY: drop }, { rotateZ: `${tilt}deg` }] };
  });

  const haloStyle = useAnimatedStyle(() => {
    const safe = safePct / 100;
    const instability = 1 - stability;
    const scale = 1 + (reduceMotion ? 0 : haloPulse.value * 0.06) * safe;
    return {
      opacity: 0.35 + safe * 0.45,
      borderColor: instability > 0.35 ? RO.warn : RO.roseGold,
      transform: [{ scale }],
    };
  });

  const timerPct = totalSec > 0 ? (remainSec / totalSec) * 100 : 0;
  const safeColor = safePct >= 55 ? RO.good : safePct >= 35 ? RO.roseGold : RO.warn;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.halo, haloStyle]} />
      <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text>
      <View style={styles.safeCard}>
        <LinearGradient colors={[`${RO.accent}99`, `${RO.accentDeep}99`]} style={styles.safeGrad}>
          <Text style={styles.safeLbl}>CROWN SAFE</Text>
          <Text style={[styles.safeVal, { color: safeColor }]}>{Math.round(safePct)}%</Text>
        </LinearGradient>
      </View>
      <View style={styles.timerCard}>
        <Text style={styles.timerLbl}>WATCH ENDS</Text>
        <View style={styles.timerTrack}>
          <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: timerPct > 25 ? RO.twilight : RO.warn }]} />
        </View>
        <Text style={styles.timerVal}>{Math.ceil(remainSec)}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 10, alignSelf: 'center', alignItems: 'center', width: '100%' },
  halo: {
    position: 'absolute',
    top: 4,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  crown: { fontSize: 58, marginTop: 8 },
  safeCard: { marginTop: 2, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: RO.glassBorder },
  safeGrad: { paddingHorizontal: 18, paddingVertical: 6, alignItems: 'center' },
  safeLbl: { color: RO.accentGlow, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  safeVal: { fontSize: 20, fontWeight: '900' },
  timerCard: {
    marginTop: 8,
    width: '72%',
    backgroundColor: RO.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RO.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
  },
  timerLbl: { fontSize: 8, fontWeight: '900', color: RO.textMuted, letterSpacing: 1 },
  timerTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 3 },
  timerVal: { fontSize: 14, fontWeight: '900', color: RO.textLight },
});
