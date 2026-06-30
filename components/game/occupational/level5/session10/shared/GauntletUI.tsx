/**
 * Dedicated UI for Session 10 integrated visual challenge games
 */
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export type GauntletTheme = {
  sky: readonly string[]; hudGlass: string; hudBorder: string;
  title: string; subtitle: string; accent: string;
};

export function GauntletHUD({ theme, gameTitle, roundLabel, round, total, score, scoreLabel, hint, challengeLabel }: {
  theme: GauntletTheme; gameTitle: string; roundLabel: string; round: number; total: number;
  score: number; scoreLabel: string; hint: string; challengeLabel?: string;
}) {
  const pop = useSharedValue(1); const prev = useRef(score);
  useEffect(() => { if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1)); prev.current = score; }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};
  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={[styles.hud, { borderColor: theme.hudBorder, backgroundColor: Platform.OS === 'android' ? theme.hudGlass : 'transparent' }]}>
        <View style={styles.hudRow}>
          <View><Text style={[styles.lbl, { color: theme.accent }]}>{roundLabel}</Text><Text style={[styles.round, { color: theme.title }]}>{round}<Text style={{ fontSize: 14, color: theme.subtitle }}>/{total}</Text></Text></View>
          <View style={styles.center}>
            <Text style={[styles.title, { color: theme.title }]}>{gameTitle}</Text>
            {challengeLabel && <Text style={[styles.phase, { color: theme.accent }]}>{challengeLabel}</Text>}
          </View>
          <Animated.View style={bump}><Text style={[styles.lbl, { color: theme.accent }]}>{scoreLabel}</Text><Text style={[styles.score, { color: theme.accent }]}>{score}</Text></Animated.View>
        </View>
        <Text style={[styles.hint, { color: theme.subtitle }]}>{hint}</Text>
      </Glass>
    </View>
  );
}

export function GauntletIntro({ theme, copy, chips, startLabel, startColors, backdrop, onStart, onBack }: {
  theme: GauntletTheme;
  copy: { title: string; emoji: string; subtitle: string; introDescription: string };
  chips: string[]; startLabel: string; startColors: readonly string[]; backdrop: React.ReactNode;
  onStart: () => void; onBack: () => void;
}) {
  const cardOp = useSharedValue(0); const cardY = useSharedValue(36);
  useEffect(() => { cardOp.value = withTiming(1, { duration: 550 }); cardY.value = withSpring(0, { damping: 15 }); }, [cardOp, cardY]);
  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }));
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop}
      <Animated.View style={[styles.card, { backgroundColor: theme.hudGlass, borderColor: theme.hudBorder }, cardAnim]}>
        <Text style={{ fontSize: 44 }}>{copy.emoji}</Text>
        <Text style={[styles.cardTitle, { color: theme.title }]}>{copy.title}</Text>
        <Text style={[styles.cardTag, { color: theme.subtitle }]}>{copy.subtitle}</Text>
        <Text style={[styles.cardBody, { color: theme.subtitle }]}>{copy.introDescription}</Text>
        <View style={styles.chips}>{chips.map((c) => <View key={c} style={[styles.chip, { borderColor: `${theme.accent}44` }]}><Text style={{ fontSize: 12, fontWeight: '700', color: theme.subtitle }}>{c}</Text></View>)}</View>
        <TouchableOpacity style={{ width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 }} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={[...startColors]} style={{ paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 17, fontWeight: '900', color: '#FFF' }}>{startLabel}</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={{ fontSize: 14, fontWeight: '700', color: theme.subtitle, paddingVertical: 8 }}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function GauntletCountdown({ accent, onDone }: { accent: string; onDone: () => void }) {
  const [display, setDisplay] = useState(3);
  const scale = useSharedValue(0.5); const opacity = useSharedValue(0);
  useEffect(() => {
    let cancelled = false; const seq = [3, 2, 1, 0];
    const tick = (i: number) => {
      if (cancelled || i >= seq.length) { if (!cancelled) onDone(); return; }
      setDisplay(seq[i] === 0 ? -1 : seq[i]!);
      scale.value = withSequence(withTiming(1.2, { duration: 200 }), withSpring(1));
      opacity.value = withTiming(1, { duration: 150 });
      setTimeout(() => { opacity.value = withTiming(0, { duration: 200 }); setTimeout(() => tick(i + 1), 220); }, 650);
    };
    tick(0); return () => { cancelled = true; };
  }, [onDone, opacity, scale]);
  const numStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <View style={[styles.cdCard, { borderColor: `${accent}55` }]}>
        <Text style={[styles.cdLbl, { color: accent }]}>QUEST</Text>
        <Animated.Text style={[styles.cdNum, { color: accent }, numStyle]}>{display === -1 ? 'GO!' : display}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hudWrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  hud: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, padding: 12 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lbl: { fontSize: 9, fontWeight: '800', letterSpacing: 1 }, round: { fontSize: 22, fontWeight: '900' },
  center: { alignItems: 'center', flex: 1 }, title: { fontSize: 13, fontWeight: '800' },
  phase: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 4 },
  score: { fontSize: 22, fontWeight: '900', textAlign: 'right' }, hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  card: { position: 'absolute', left: 18, right: 18, bottom: 28, borderRadius: 28, padding: 22, borderWidth: 1.5, alignItems: 'center' },
  cardTitle: { fontSize: 30, fontWeight: '900' }, cardTag: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  cardBody: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 14 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  cdOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 30 },
  cdCard: { backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: 24, paddingHorizontal: 36, paddingVertical: 28, alignItems: 'center', borderWidth: 2 },
  cdLbl: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }, cdNum: { fontSize: 64, fontWeight: '900' },
});
