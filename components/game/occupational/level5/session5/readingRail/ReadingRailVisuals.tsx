/**
 * Visual layer — Reading Rail (horizontal eye track)
 */
import { READING_RAIL_COPY as COPY, READING_RAIL_THEME as T } from '@/components/game/occupational/level5/session5/readingRail/readingRailTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function ReadingRailInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);
  useEffect(() => {
    cardOp.value = withTiming(1, { duration: 550 });
    cardY.value = withSpring(0, { damping: 15, stiffness: 110 });
  }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <LibraryBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>
          {['👀 Eyes', '↔️ Track', '📖 Read'].map((c) => (
            <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
          ))}
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#7DD3FC', '#38BDF8', '#0284C7']} style={styles.startGrad}>
            <Text style={styles.startText}>👁️ Begin Tracking</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.backLink}><Text style={styles.backLinkText}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function LibraryBackdrop() {
  const lamp = useSharedValue(0.5);
  useEffect(() => { lamp.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true); }, [lamp]);
  const lampStyle = useAnimatedStyle(() => ({ opacity: 0.08 + lamp.value * 0.1 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.shelf, { top: '14%' }]}>{T.bookSpine.map((c, i) => <View key={i} style={[styles.book, { backgroundColor: c, height: 28 + (i % 3) * 8 }]} />)}</View>
      <View style={[styles.shelf, { top: '72%' }]}>{T.bookSpine.slice().reverse().map((c, i) => <View key={i} style={[styles.book, { backgroundColor: c, height: 24 + (i % 2) * 10 }]} />)}</View>
      <View style={styles.rail} />
      <Animated.View style={[styles.lampBeam, lampStyle]} />
      <View style={styles.lamp} />
    </View>
  );
}

export function RailDot({ size, pulse }: { size: number; pulse?: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!pulse) return;
    scale.value = withRepeat(withSequence(withTiming(1.1, { duration: 700, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 700 })), -1, false);
  }, [pulse, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.dotWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#BAE6FD', T.dot, T.accentDark]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <View style={[styles.dotCore, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]} />
        <Text style={{ fontSize: size * 0.35 }}>👁️</Text>
      </LinearGradient>
      <View style={[styles.dotHalo, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; watching: boolean };
export function ReadingRailHUD({ round, total, score, hint, watching }: HudProps) {
  const pop = useSharedValue(1);
  const prev = useRef(score);
  useEffect(() => {
    if (score > prev.current) pop.value = withSequence(withSpring(1.3, { damping: 6 }), withSpring(1));
    prev.current = score;
  }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>PASS</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>👁️ Reading Rail</Text>
            <View style={[styles.phasePill, watching && styles.phaseActive]}><Text style={styles.phaseText}>{watching ? 'TRACKING' : 'READY'}</Text></View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#93C5FD', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: 'rgba(56,189,248,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  backLink: { paddingVertical: 8 }, backLinkText: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  shelf: { position: 'absolute', left: '4%', right: '4%', height: 8, backgroundColor: T.shelf, flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingHorizontal: 8, paddingBottom: 2 },
  book: { width: 10, borderRadius: 2 },
  rail: { position: 'absolute', left: '5%', right: '5%', top: '50%', height: 3, backgroundColor: T.rail, borderRadius: 2 },
  lampBeam: { position: 'absolute', top: 0, right: '10%', width: 100, height: '55%', backgroundColor: T.lampGlow },
  lamp: { position: 'absolute', top: 10, right: '8%', width: 28, height: 28, borderRadius: 14, backgroundColor: T.lamp, borderWidth: 2, borderColor: '#FBBF24' },
  dotWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.dot, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  dotGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  dotCore: { position: 'absolute', backgroundColor: T.dotCore, opacity: 0.5 },
  dotHalo: { position: 'absolute', borderWidth: 2, borderColor: T.dotGlow },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(56,189,248,0.15)' },
  phaseActive: { backgroundColor: 'rgba(56,189,248,0.3)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' },
  hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
