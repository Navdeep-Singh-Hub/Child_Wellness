/**
 * Visual layer — Turbo Toggle
 */
import { TURBO_TOGGLE_COPY as COPY, TURBO_TOGGLE_THEME as T } from '@/components/game/occupational/level5/session6/turboToggle/turboToggleTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function TurboToggleInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <TurboBackdrop isFast />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['⚡ Turbo', '🐢 Crawl', '🔄 Switch'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FDE68A', '#FBBF24', '#D97706']} style={styles.startGrad}><Text style={styles.startText}>🔄 Start Toggle</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function TurboBackdrop({ isFast }: { isFast: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.lane, { top: '35%' }]} /><View style={[styles.lane, { top: '55%' }]} />
      <View style={[styles.badge, { borderColor: isFast ? T.turbo : T.crawl, backgroundColor: isFast ? 'rgba(250,204,21,0.2)' : 'rgba(74,222,128,0.2)' }]}>
        <Text style={styles.badgeText}>{isFast ? '⚡ TURBO' : '🐢 CRAWL'}</Text>
      </View>
    </View>
  );
}

export function ToggleBall({ size, isFast, pulse }: { size: number; isFast: boolean; pulse?: boolean }) {
  const scale = useSharedValue(1);
  const color = isFast ? T.ballFast : T.ballSlow;
  useEffect(() => {
    if (!pulse) return;
    const dur = isFast ? 500 : 1200;
    scale.value = withRepeat(withSequence(withTiming(1.1, { duration: dur }), withTiming(1, { duration: dur })), -1, false);
  }, [isFast, pulse, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.ballWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={isFast ? ['#FECACA', color, '#B91C1C'] : ['#BBF7D0', color, '#15803D']} style={[styles.ballGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.45 }}>⚽</Text>
      </LinearGradient>
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; playing: boolean; isFast: boolean };
export function TurboToggleHUD({ round, total, score, hint, playing, isFast }: HudProps) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View><Text style={styles.hudLabel}>MODE</Text><Text style={[styles.modeText, { color: isFast ? T.turbo : T.crawl }]}>{isFast ? '⚡' : '🐢'}</Text></View>
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>🔄 Turbo Toggle</Text><Text style={styles.hudRound}>{round}/{total}</Text></View>
          <Animated.View style={bump}><Text style={styles.hudLabel}>CATCHES</Text><Text style={styles.hudScore}>{score}</Text></Animated.View>
        </View>
        <Text style={styles.hint}>{playing ? hint : 'Get ready…'}</Text>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  infoCard: { position: 'absolute', left: 18, right: 18, bottom: 28, backgroundColor: T.hudGlass, borderRadius: 28, padding: 22, borderWidth: 1.5, borderColor: T.hudBorder, alignItems: 'center' },
  infoEmoji: { fontSize: 44 }, infoTitle: { fontSize: 30, fontWeight: '900', color: T.title }, infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, letterSpacing: 1.2, marginBottom: 10 },
  infoBody: { fontSize: 15, lineHeight: 22, color: '#FDE68A', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: T.badge, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#422006' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  lane: { position: 'absolute', left: '8%', right: '8%', height: 2, backgroundColor: T.lane },
  badge: { position: 'absolute', top: 12, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 2 },
  badgeText: { fontSize: 12, fontWeight: '900', color: '#FEF3C7', letterSpacing: 1 },
  ballWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  ballGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.55)' },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, modeText: { fontSize: 22, fontWeight: '900' },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title }, hudRound: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
