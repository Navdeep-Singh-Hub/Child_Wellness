/**
 * Visual layer — Orbit Eye (circular eye track)
 */
import { ORBIT_EYE_COPY as COPY, ORBIT_EYE_THEME as T } from '@/components/game/occupational/level5/session5/orbitEye/orbitEyeTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function OrbitEyeInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.space]} style={StyleSheet.absoluteFillObject} />
      <CosmicBackdrop />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['🪐 Orbit', '👀 Circle', '✨ Smooth'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#C4B5FD', '#A78BFA', '#7C3AED']} style={styles.startGrad}><Text style={styles.startText}>🪐 Launch Orbit</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function StarField() {
  return <>{Array.from({ length: 18 }).map((_, i) => <View key={i} style={[styles.star, { left: `${(i * 19) % 92 + 4}%`, top: `${(i * 27) % 85 + 5}%`, opacity: 0.3 + (i % 4) * 0.15 }]} />)}</>;
}

export function CosmicBackdrop() {
  const spin = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(1, { duration: 20000, easing: Easing.linear }), -1, false); }, [spin]);
  const ringSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.space]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.nebula} />
      <StarField />
      <Animated.View style={[styles.orbitRing, ringSpin]} />
      <View style={styles.orbitGlow} />
      <View style={styles.centerStar}><Text style={{ fontSize: 20 }}>✨</Text></View>
    </View>
  );
}

export function PlanetDot({ size, pulse }: { size: number; pulse?: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => { if (pulse) scale.value = withRepeat(withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false); }, [pulse, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.dotWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#DDD6FE', T.planet, T.accentDark]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <View style={[styles.planetShine, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />
      </LinearGradient>
      <View style={[styles.dotHalo, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; watching: boolean };
export function OrbitEyeHUD({ round, total, score, hint, watching }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>ORBIT</Text><Text style={styles.hudRound}>{round}<Text style={styles.hudTotal}>/{total}</Text></Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>⭕ Orbit Eye</Text><View style={[styles.phasePill, watching && styles.phaseOn]}><Text style={styles.phaseText}>{watching ? 'PURSUING' : 'READY'}</Text></View></View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#C4B5FD', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(167,139,250,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#FFF' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  nebula: { position: 'absolute', top: '20%', alignSelf: 'center', width: '60%', height: '40%', borderRadius: 999, backgroundColor: T.nebula },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: T.star },
  orbitRing: { position: 'absolute', alignSelf: 'center', top: '15%', width: '70%', aspectRatio: 1, borderRadius: 9999, borderWidth: 2, borderColor: T.ring, borderStyle: 'dashed' },
  orbitGlow: { position: 'absolute', alignSelf: 'center', top: '30%', width: '40%', aspectRatio: 1, borderRadius: 9999, backgroundColor: T.ringGlow },
  centerStar: { position: 'absolute', top: '48%', alignSelf: 'center' },
  dotWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.planet, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  dotGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  planetShine: { position: 'absolute', top: '18%', left: '22%', backgroundColor: 'rgba(255,255,255,0.6)' },
  dotHalo: { position: 'absolute', borderWidth: 2, borderColor: T.planetGlow },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(167,139,250,0.15)' },
  phaseOn: { backgroundColor: 'rgba(167,139,250,0.3)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
