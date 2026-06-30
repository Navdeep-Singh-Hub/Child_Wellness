/**
 * Visual layer — Lightning Jump (saccade eye track)
 */
import { LIGHTNING_JUMP_COPY as COPY, LIGHTNING_JUMP_THEME as T } from '@/components/game/occupational/level5/session5/lightningJump/lightningJumpTheme';
import { JUMP_POSITIONS } from '@/components/game/occupational/level5/session5/shared/useEyeTrackGame';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type InfoProps = { onStart: () => void; onBack: () => void };

export function LightningJumpInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.storm]} style={StyleSheet.absoluteFillObject} />
      <StormBackdrop activeNode={-1} />
      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>
        <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        <View style={styles.chipRow}>{['⚡ Jump', '👀 Snap', '🎯 Spot'].map((c) => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}</View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FDE047', '#FACC15', '#CA8A04']} style={styles.startGrad}><Text style={styles.startText}>⚡ Charge Up</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function StormBackdrop({ activeNode }: { activeNode: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.storm]} style={StyleSheet.absoluteFillObject} />
      {JUMP_POSITIONS.map((pos, i) => (
        <View key={i} style={[styles.node, { left: `${pos.x}%`, top: `${pos.y}%`, backgroundColor: i === activeNode ? T.nodeActive : T.node, borderColor: i === activeNode ? T.bolt : T.grid }]} />
      ))}
      <View style={styles.crackH} /><View style={styles.crackV} />
    </View>
  );
}

export function BoltDot({ size, flash }: { size: number; flash?: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (flash) {
      scale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(1, { duration: 200 }));
    }
  }, [flash, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.dotWrap, { width: size, height: size, borderRadius: size / 2 }, anim]}>
      <LinearGradient colors={['#FEF9C3', T.dot, T.accentDark]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.42 }}>⚡</Text>
      </LinearGradient>
      <View style={[styles.dotHalo, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }]} />
    </Animated.View>
  );
}

type HudProps = { round: number; total: number; score: number; hint: string; watching: boolean };
export function LightningJumpHUD({ round, total, score, hint, watching }: HudProps) {
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
          <View style={styles.hudCenter}><Text style={styles.hudTitle}>⚡ Lightning Jump</Text><View style={[styles.phasePill, watching && styles.phaseOn]}><Text style={styles.phaseText}>{watching ? 'JUMPING' : 'READY'}</Text></View></View>
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
  infoBody: { fontSize: 15, lineHeight: 22, color: '#FDE68A', textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 }, chip: { backgroundColor: 'rgba(250,204,21,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(250,204,21,0.3)' },
  chipText: { fontSize: 12, fontWeight: '700', color: T.subtitle }, startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  startGrad: { paddingVertical: 16, alignItems: 'center' }, startText: { fontSize: 17, fontWeight: '900', color: '#422006' }, backLink: { fontSize: 14, fontWeight: '700', color: T.subtitle, paddingVertical: 8 },
  node: { position: 'absolute', width: 16, height: 16, borderRadius: 8, marginLeft: -8, marginTop: -8, borderWidth: 1.5 },
  crackH: { position: 'absolute', left: '10%', right: '10%', top: '50%', height: 1, backgroundColor: T.crack },
  crackV: { position: 'absolute', top: '15%', bottom: '15%', left: '50%', width: 1, backgroundColor: T.crack },
  dotWrap: { justifyContent: 'center', alignItems: 'center', shadowColor: T.bolt, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10 },
  dotGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  dotHalo: { position: 'absolute', borderWidth: 2, borderColor: T.boltGlow },
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hudGlass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1 }, hudRound: { fontSize: 22, fontWeight: '900', color: T.title }, hudTotal: { fontSize: 14, color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 }, hudTitle: { fontSize: 13, fontWeight: '800', color: T.title },
  phasePill: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(250,204,21,0.15)' },
  phaseOn: { backgroundColor: 'rgba(250,204,21,0.3)' }, phaseText: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.5 },
  hudScore: { fontSize: 22, fontWeight: '900', color: T.accent, textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: T.subtitle },
});
