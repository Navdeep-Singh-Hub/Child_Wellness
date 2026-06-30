/**
 * Visual layer — Lightning Catch
 */
import { LIGHTNING_CATCH_COPY as COPY, LIGHTNING_CATCH_THEME as T } from '@/components/game/occupational/level5/session6/lightningCatch/lightningCatchTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function LightningCatchInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <ArenaBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['⚡ Fast', '👆 Tap', '🎯 React'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FCA5A5', '#F87171', '#DC2626']} style={styles.startGrad}><Text style={styles.startText}>⚡ Go Fast</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function ArenaBackdrop() {
  const flash = useSharedValue(0);
  useEffect(() => { flash.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true); }, [flash]);
  const flashStyle = useAnimatedStyle(() => ({ opacity: 0.06 + flash.value * 0.08 }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.spotlight, flashStyle]} />
      <View style={styles.floor} />
      {Array.from({ length: 6 }).map((_, i) => <View key={i} style={[styles.speedLine, { top: `${20 + i * 10}%` }]} />)}
    </View>
  );
}

export function BlazeBall({ size, pulse }: { size: number; pulse?: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!pulse) return;
    scale.value = withRepeat(withSequence(withTiming(1.12, { duration: 500, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 500 })), -1, false);
  }, [pulse, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.ballWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#FECACA', T.ball, '#B91C1C']} style={[styles.ballGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>⚽</Text>
      </LinearGradient>
      <View style={[styles.ballHalo, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; playing: boolean };
export function LightningCatchHUD({ round, total, score, hint, playing }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>BLITZ</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>⚡ Lightning Catch</Text><View style={[styles.phasePill, playing && styles.phaseOn]}><Text style={styles.phaseText}>{playing ? 'LIVE' : 'READY'}</Text></View></View>
          <Animated.View style={bump}><Text style={styles.hudLabel}>CATCHES</Text><Text style={styles.hudScore}>{score}</Text></Animated.View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#FCA5A5', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(248,113,113,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  spotlight: { position: 'absolute', top: 0, alignSelf: 'center', width: 200, height: '50%', backgroundColor: T.spotlight },
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: T.floor },
  speedLine: { position: 'absolute', left: '5%', right: '5%', height: 2, backgroundColor: T.speedLine },
  ballWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.ball, shadowOpacity: 0.5, shadowRadius: 14, elevation: 12 },
  ballGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.6)' },
  ballHalo: { position: 'absolute', borderWidth: 2, borderColor: T.ballGlow },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(248,113,113,0.15)' },
  phaseOn: { backgroundColor: 'rgba(248,113,113,0.35)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
