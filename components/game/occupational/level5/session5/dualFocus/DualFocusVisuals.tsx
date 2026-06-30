/**
 * Visual layer — Dual Focus (alternating dot eye track)
 */
import { DUAL_FOCUS_COPY as COPY, DUAL_FOCUS_THEME as T } from '@/components/game/occupational/level5/session5/dualFocus/dualFocusTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function DualFocusInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.stage]} style={StyleSheet.absoluteFillObject} />
      <DualStageBackdrop activeDot={0} />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['🔵 Blue', '🟠 Orange', '🔀 Switch'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#F9A8D4', '#F472B6', '#DB2777']} style={styles.startGrad}><Text style={styles.startText}>🔀 Dual Start</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function DualStageBackdrop({ activeDot }: { activeDot: 0 | 1 }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.stage]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.splitLine} />
      <View style={[styles.zoneA, activeDot === 0 && styles.zoneActiveA]} />
      <View style={[styles.zoneB, activeDot === 1 && styles.zoneActiveB]} />
      <Text style={[styles.zoneLabel, { left: '12%', color: T.dotA }]}>HORIZONTAL</Text>
      <Text style={[styles.zoneLabel, { right: '8%', color: T.dotB }]}>VERTICAL</Text>
    </View>
  );
}

export function CometDot({ size, color, glow, active }: { size: number; color: string; glow: string; active: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (active) scale.value = withRepeat(withSequence(withTiming(1.12, { duration: 600 }), withTiming(1, { duration: 600 })), -1, false);
    else scale.value = withTiming(1, { duration: 200 });
  }, [active, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: active ? 1 : 0.35 }));
  return (
    <Animated.View style={[styles.dotWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#FFFFFF', color, color]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <View style={[styles.dotCore, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />
      </LinearGradient>
      {active && <View style={[styles.dotHalo, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2, borderColor: glow }]} />}
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; watching: boolean; activeDot: 0 | 1 };
export function DualFocusHUD({ round, total, score, hint, watching, activeDot }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>SWITCH</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>⚫ Dual Focus</Text>
            <View style={styles.dotIndicator}>
              <View style={[styles.indDot, { backgroundColor: T.dotA }, activeDot === 0 && watching && styles.indOn]} />
              <View style={[styles.indDot, { backgroundColor: T.dotB }, activeDot === 1 && watching && styles.indOn]} />
            </View>
          </View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#D1D5DB', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(244,114,182,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  splitLine: { position: 'absolute', left: 0, right: 0, top: '48%', height: 2, backgroundColor: T.splitLine },
  zoneA: { position: 'absolute', left: '6%', top: '38%', width: '40%', height: '22%', borderRadius: 16, borderWidth: 2, borderColor: T.zoneABorder, borderStyle: 'dashed', backgroundColor: T.zoneA },
  zoneB: { position: 'absolute', right: '6%', top: '38%', width: '40%', height: '22%', borderRadius: 16, borderWidth: 2, borderColor: T.zoneBBorder, borderStyle: 'dashed', backgroundColor: T.zoneB },
  zoneActiveA: { backgroundColor: 'rgba(56,189,248,0.2)' }, zoneActiveB: { backgroundColor: 'rgba(249,115,22,0.2)' },
  zoneLabel: { position: 'absolute', top: '32%', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  dotWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  dotGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  dotCore: { backgroundColor: 'rgba(255,255,255,0.7)' },
  dotHalo: { position: 'absolute', borderWidth: 2, borderStyle: 'dashed' },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  dotIndicator: { flexDirection: 'row', gap: 6, marginTop: 4 },
  indDot: { width: 10, height: 10, borderRadius: 5, opacity: 0.4 }, indOn: { opacity: 1, transform: [{ scale: 1.2 }] },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
