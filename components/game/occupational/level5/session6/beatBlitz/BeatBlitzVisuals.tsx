/**
 * Visual layer — Beat Blitz
 */
import { BEAT_BLITZ_COPY as COPY, BEAT_BLITZ_THEME as T } from '@/components/game/occupational/level5/session6/beatBlitz/beatBlitzTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function BeatBlitzInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <DiscoBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['🎵 Beat', '👂 Listen', '🎯 Tap'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#E9D5FF', '#C084FC', '#9333EA']} style={styles.startGrad}><Text style={styles.startText}>🎵 Drop the Beat</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function DiscoBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.discoFloor} />
      {T.tile.map((c, i) => <View key={i} style={[styles.tile, { left: `${8 + i * 22}%`, backgroundColor: `${c}44` }]} />)}
      <View style={styles.eq}>
        {Array.from({ length: 5 }).map((_, i) => <View key={i} style={[styles.eqBar, { height: 12 + (i % 3) * 10 }]} />)}
      </View>
    </View>
  );
}

export function BeatPulseRing({ accent }: { accent: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.25, { duration: 200, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 800 })), -1, false);
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 0.35 + (scale.value - 1) * 1.5 }));
  return <Animated.View style={[styles.beatRing, { borderColor: accent }, anim]} />;
}

export function RhythmNote({ size, urgent }: { size: number; urgent?: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => { if (urgent) pulse.value = withRepeat(withSequence(withTiming(1.12, { duration: 250 }), withTiming(1, { duration: 250 })), -1, false); }, [urgent, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Animated.View style={[styles.noteWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#F3E8FF', T.note, '#6B21A8']} style={[styles.noteGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>🎵</Text>
      </LinearGradient>
      <View style={[styles.noteHalo, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; beatCount: number };
export function BeatBlitzHUD({ round, total, score, hint, beatCount }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  const beatPhase = ((beatCount % 3) || 3);
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>BEAT</Text><Text style={styles.hudRound}>{beatPhase}/3</Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>🎵 Beat Blitz</Text><Text style={styles.hudSub}>{round}/{total}</Text></View>
          <Animated.View style={bump}><Text style={styles.hudLabel}>BEATS</Text><Text style={styles.hudScore}>{score}</Text></Animated.View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#E9D5FF', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(192,132,252,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  discoFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: T.floor },
  tile: { position: 'absolute', bottom: '8%', width: 40, height: 40, borderRadius: 8 },
  eq: { position: 'absolute', bottom: '20%', alignSelf: 'center', flexDirection: 'row', gap: 4, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: T.beatRing },
  eqBar: { width: 6, backgroundColor: T.eq, borderRadius: 3 },
  beatRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  noteWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.note, shadowOpacity: 0.5, shadowRadius: 14, elevation: 12 },
  noteGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
  noteHalo: { position: 'absolute', borderWidth: 2, borderColor: T.noteGlow, borderStyle: 'dashed' },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title }, hudSub: { fontSize: 12, fontWeight: '700', color: T.subtitle },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
