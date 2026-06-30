/**
 * Shared gameplay FX components for Session 9 reaction games.
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function FlashBurst({ size, color, emoji, style }: { size: number; color: string; emoji: string; style?: object }) {
  return (
    <Animated.View style={[styles.burst, { width: size, height: size, borderRadius: size / 2, shadowColor: color }, style]}>
      <LinearGradient colors={[`${color}EE`, color, `${color}CC`]} style={[styles.burstGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      </LinearGradient>
      <View style={[styles.burstHalo, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2, borderColor: `${color}66` }]} />
    </Animated.View>
  );
}

export function SignalButton({ type, size }: { type: 'go' | 'stop'; size: number }) {
  const scale = useSharedValue(0.9);
  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 400 }), withTiming(0.95, { duration: 400 })), -1, true);
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = type === 'go' ? '#10B981' : '#EF4444';
  const border = type === 'go' ? '#059669' : '#DC2626';
  return (
    <Animated.View style={[styles.signalBtn, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border }, anim]}>
      <Text style={{ fontSize: size * 0.32 }}>{type === 'go' ? '🟢' : '🔴'}</Text>
      <Text style={styles.signalLabel}>{type === 'go' ? 'GO' : 'STOP'}</Text>
    </Animated.View>
  );
}

export function ChoiceTile({ size, emoji, scale = 1, accent }: { size: number; emoji: string; scale?: number; accent: string }) {
  return (
    <View style={[styles.choiceTile, { width: size, height: size, borderRadius: size / 2, borderColor: `${accent}55`, transform: [{ scale }] }]}>
      <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
    </View>
  );
}

export function TimerBar({ percent, accent }: { percent: number; accent: string }) {
  return (
    <View style={styles.timerTrack}>
      <View style={[styles.timerFill, { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  burst: { justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.7, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  burstGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)' },
  burstHalo: { position: 'absolute', borderWidth: 2, backgroundColor: 'transparent' },
  signalBtn: { justifyContent: 'center', alignItems: 'center', borderWidth: 4, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  signalLabel: { color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 2 },
  choiceTile: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 3, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  timerTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', width: '100%' },
  timerFill: { height: '100%', borderRadius: 4 },
});
