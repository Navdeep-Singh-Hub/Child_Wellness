/**
 * Shared depth game UI — intro + HUD
 */
import type { DepthCopy, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type Theme = DepthThemeTokens;
type Props = {
  theme: Theme;
  gameTitle: string;
  roundLabel: string;
  round: number;
  total: number;
  score: number;
  scoreLabel: string;
  hint: string;
  phaseLabel?: string;
  playing?: boolean;
};

export function DepthGameHUD({ theme, gameTitle, roundLabel, round, total, score, scoreLabel, hint, phaseLabel, playing }: Props) {
  const pop = useSharedValue(1);
  const prev = useRef(score);
  useEffect(() => {
    if (score > prev.current) pop.value = withSequence(withSpring(1.3), withSpring(1));
    prev.current = score;
  }, [score, pop]);
  const bump = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Glass {...glassProps} style={[styles.glass, { borderColor: theme.hudBorder, backgroundColor: Platform.OS === 'android' ? theme.hudGlass : 'transparent' }]}>
        <View style={styles.row}>
          <View><Text style={[styles.label, { color: theme.accent }]}>{roundLabel}</Text><Text style={[styles.round, { color: theme.title }]}>{round}<Text style={{ fontSize: 14, color: theme.subtitle }}>/{total}</Text></Text></View>
          <View style={styles.center}>
            <Text style={[styles.title, { color: theme.title }]}>{gameTitle}</Text>
            {phaseLabel && <View style={[styles.phase, playing && { backgroundColor: `${theme.accent}33` }]}><Text style={[styles.phaseText, { color: theme.accent }]}>{playing ? phaseLabel : 'READY'}</Text></View>}
          </View>
          <Animated.View style={bump}><Text style={[styles.label, { color: theme.accent }]}>{scoreLabel}</Text><Text style={[styles.score, { color: theme.accent }]}>{score}</Text></Animated.View>
        </View>
        <Text style={[styles.hint, { color: theme.subtitle }]}>{hint}</Text>
      </Glass>
    </View>
  );
}

type IntroProps = {
  theme: Theme;
  copy: Pick<DepthCopy, 'title' | 'emoji' | 'subtitle' | 'introDescription'>;
  chips: string[];
  startLabel: string;
  startColors: readonly string[];
  backdrop: React.ReactNode;
  onStart: () => void;
  onBack: () => void;
};

export function DepthIntroScreen({ theme, copy, chips, startLabel, startColors, backdrop, onStart, onBack }: IntroProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);
  useEffect(() => {
    cardOp.value = withTiming(1, { duration: 550 });
    cardY.value = withSpring(0, { damping: 15 });
  }, [cardOp, cardY]);
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
        <View style={styles.chipRow}>{chips.map((c) => <View key={c} style={[styles.chip, { borderColor: `${theme.accent}44` }]}><Text style={{ fontSize: 12, fontWeight: '700', color: theme.subtitle }}>{c}</Text></View>)}</View>
        <TouchableOpacity style={{ width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8 }} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={[...startColors]} style={{ paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 17, fontWeight: '900', color: '#FFF' }}>{startLabel}</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={{ fontSize: 14, fontWeight: '700', color: theme.subtitle, paddingVertical: 8 }}>← Back to games</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 6, zIndex: 40 },
  glass: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  round: { fontSize: 22, fontWeight: '900' },
  center: { alignItems: 'center', flex: 1 },
  title: { fontSize: 13, fontWeight: '800' },
  phase: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  phaseText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  score: { fontSize: 22, fontWeight: '900', textAlign: 'right' },
  hint: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  card: { position: 'absolute', left: 18, right: 18, bottom: 28, borderRadius: 28, padding: 22, borderWidth: 1.5, alignItems: 'center' },
  cardTitle: { fontSize: 30, fontWeight: '900' },
  cardTag: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  cardBody: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});
