/**
 * Visual layer — Sky Lift (vertical eye track)
 */
import { SKY_LIFT_COPY as COPY, SKY_LIFT_THEME as T } from '@/components/game/occupational/level5/session5/skyLift/skyLiftTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function SkyLiftInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <ElevatorBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['👀 Eyes', '↕️ Shift', '🛗 Lift'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#5EEAD4', '#2DD4BF', '#0D9488']} style={styles.startGrad}><Text style={styles.startText}>⬆️ Ride the Lift</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function ElevatorBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.shaft} />
      <View style={styles.cableL} /><View style={styles.cableR} />
      {['F3', 'F2', 'F1'].map((f, i) => <View key={f} style={[styles.floorMark, { top: `${18 + i * 28}%` }]}><Text style={styles.floorLabel}>{f}</Text></View>)}
      <View style={styles.guideV} />
      <Text style={styles.arrowUp}>▲</Text><Text style={styles.arrowDn}>▼</Text>
    </View>
  );
}

export function LiftDot({ size, pulse }: { size: number; pulse?: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => { if (pulse) scale.value = withRepeat(withSequence(withTiming(1.12, { duration: 600 }), withTiming(1, { duration: 600 })), -1, false); }, [pulse, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.dotWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#99F6E4', T.dot, T.accentDark]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.38 }}>⬆️</Text>
      </LinearGradient>
      <View style={[styles.dotHalo, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; watching: boolean };
export function SkyLiftHUD({ round, total, score, hint, watching }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>FLOOR</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>⬆️ Sky Lift</Text><View style={[styles.phasePill, watching && styles.phaseOn]}><Text style={styles.phaseText}>{watching ? 'RIDING' : 'READY'}</Text></View></View>
          <Animated.View style={bump}><Text style={styles.hudLabel}>ROUNDS</Text><Text style={styles.hudScore}>{score}</Text></Animated.View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#99F6E4', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(45,212,191,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#042F2E' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  shaft: { position: 'absolute', left: '36%', right: '36%', top: '8%', bottom: '8%', backgroundColor: T.shaft, borderWidth: 2, borderColor: T.shaftBorder, borderRadius: 14 },
  cableL: { position: 'absolute', left: '40%', top: '8%', bottom: '8%', width: 3, backgroundColor: T.cable },
  cableR: { position: 'absolute', right: '40%', top: '8%', bottom: '8%', width: 3, backgroundColor: T.cable },
  floorMark: { position: 'absolute', left: '32%', right: '32%', height: 2, backgroundColor: T.floor, justifyContent: 'center' },
  floorLabel: { position: 'absolute', left: -28, fontSize: 10, fontWeight: '800', color: T.floorLabel },
  guideV: { position: 'absolute', left: '50%', top: '12%', bottom: '12%', width: 2, marginLeft: -1, backgroundColor: T.dotGlow },
  arrowUp: { position: 'absolute', top: '6%', alignSelf: 'center', fontSize: 16, color: T.arrow },
  arrowDn: { position: 'absolute', bottom: '6%', alignSelf: 'center', fontSize: 16, color: T.arrow },
  dotWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.dot, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  dotGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  dotHalo: { position: 'absolute', borderWidth: 2, borderColor: T.dotGlow },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(45,212,191,0.15)' },
  phaseOn: { backgroundColor: 'rgba(45,212,191,0.3)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
