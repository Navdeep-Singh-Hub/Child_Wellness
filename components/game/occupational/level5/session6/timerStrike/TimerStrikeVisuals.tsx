/**
 * Visual layer — Timer Strike
 */
import { TIMER_STRIKE_COPY as COPY, TIMER_STRIKE_THEME as T } from '@/components/game/occupational/level5/session6/timerStrike/timerStrikeTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function TimerStrikeInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <ClockBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['⏰ Wait', '3-2-1', '🎯 Strike'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#A5B4FC', '#818CF8', '#4F46E5']} style={styles.startGrad}><Text style={styles.startText}>⏰ Arm Timer</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function ClockBackdrop() {
  const tick = useSharedValue(0);
  useEffect(() => { tick.value = withRepeat(withTiming(1, { duration: 1000 }), -1, false); }, [tick]);
  const handStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tick.value * 360}deg` }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.clockRing} /><View style={styles.clockGlow} />
      <Animated.View style={[styles.hand, handStyle]} />
      <Animated.View style={[styles.hand, styles.handShort, handStyle]} />
      {Array.from({ length: 12 }).map((_, i) => <View key={i} style={[styles.tick, { transform: [{ rotate: `${i * 30}deg` }] }]} />)}
    </View>
  );
}

export function BigCountdownDisplay({ value, accent }: { value: number; accent: string }) {
  const scale = useSharedValue(1);
  useEffect(() => { scale.value = withSequence(withSpring(1.2, { damping: 6 }), withSpring(1)); }, [scale, value]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.cdWrap, anim]}>
      <Text style={[styles.cdNum, { color: accent }]}>{value}</Text>
    </Animated.View>
  );
}

export function StrikeTarget({ size, urgent }: { size: number; urgent?: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => { if (urgent) pulse.value = withRepeat(withSequence(withTiming(1.15, { duration: 300 }), withTiming(1, { duration: 300 })), -1, false); }, [urgent, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Animated.View style={[styles.targetWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#C7D2FE', T.target, '#4338CA']} style={[styles.targetGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>🎯</Text>
      </LinearGradient>
      <View style={[styles.targetHalo, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; striking: boolean };
export function TimerStrikeHUD({ round, total, score, hint, striking }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>STRIKE</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>⏰ Timer Strike</Text><View style={[styles.phasePill, striking && styles.phaseOn]}><Text style={styles.phaseText}>{striking ? 'NOW!' : 'WAIT'}</Text></View></View>
          <Animated.View style={bump}><Text style={styles.hudLabel}>HITS</Text><Text style={styles.hudScore}>{score}</Text></Animated.View>
        </View>
        <Text style={styles.hint}>{hint}</Text>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  infoCard: { position: 'absolute', left: 18, right: 18, bottom: 28, backgroundColor: T.hudGlass, borderRadius: 28, padding: 22, borderWidth: 1.5, borderColor: T.hudBorder, alignItems: 'center' },
  infoEmoji: { fontSize: 44 }, infoTitle: { fontSize: 30, fontWeight: '900', color: T.title }, infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, letterSpacing: 1.2, marginBottom: 10 },
  infoBody: { fontSize: 15, lineHeight: 22, color: '#C7D2FE', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(129,140,248,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  clockRing: { position: 'absolute', alignSelf: 'center', top: '18%', width: '65%', aspectRatio: 1, borderRadius: 9999, borderWidth: 3, borderColor: T.clockRing },
  clockGlow: { position: 'absolute', alignSelf: 'center', top: '28%', width: '45%', aspectRatio: 1, borderRadius: 9999, backgroundColor: T.clockGlow },
  hand: { position: 'absolute', alignSelf: 'center', top: '32%', width: 3, height: 80, backgroundColor: T.hand, borderRadius: 2, transformOrigin: 'bottom' },
  handShort: { height: 50, width: 4, top: '38%' },
  tick: { position: 'absolute', alignSelf: 'center', top: '20%', width: 2, height: 10, backgroundColor: T.tick },
  cdWrap: { alignItems: 'center', justifyContent: 'center' },
  cdNum: { fontSize: 96, fontWeight: '900' },
  targetWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.target, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  targetGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  targetHalo: { position: 'absolute', borderWidth: 2.5, borderColor: T.targetGlow, borderStyle: 'dashed' },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(129,140,248,0.15)' },
  phaseOn: { backgroundColor: 'rgba(129,140,248,0.4)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
