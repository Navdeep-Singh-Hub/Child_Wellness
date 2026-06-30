import { GR } from './graduateTheme';
import { GraduateBackdrop } from './GraduateBackdrop';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type Props = {
  studio: string;
  title: string;
  instruction: string;
  mascot?: string;
  coachLine?: string;
  onReplayVoice?: () => void;
  children: React.ReactNode;
};

export function GraduateGameShell({
  studio,
  title,
  instruction,
  mascot = '🎓',
  coachLine,
  onReplayVoice,
  children,
}: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <GraduateBackdrop reduceMotion={reduceMotion} />
      <View style={styles.content}>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.studio}>{studio}</Text>
          <View style={styles.titleRow}>
            <View style={styles.mascotBubble}>
              <Text style={styles.mascot}>{mascot}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.instruction}>{instruction}</Text>
          {onReplayVoice ? (
            <Pressable onPress={onReplayVoice} style={styles.replayBtn} accessibilityLabel="Replay instruction">
              <Ionicons name="volume-high" size={18} color={GR.amberGlow} />
              <Text style={styles.replayTxt}>Hear again</Text>
            </Pressable>
          ) : null}
        </Animated.View>

        {coachLine ? (
          <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(120).duration(380)} style={styles.coach}>
            <Text style={styles.coachLabel}>MIRA · DIALOGUE GUIDE</Text>
            <Text style={styles.coachText}>{coachLine}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={reduceMotion ? undefined : FadeInUp.delay(200).duration(420)} style={styles.stage}>
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 320 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  header: { alignItems: 'center', marginBottom: 12 },
  studio: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: GR.amberGlow,
    marginBottom: 6,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mascotBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GR.glass,
    borderWidth: 2,
    borderColor: GR.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: { fontSize: 22 },
  title: { fontSize: 22, fontWeight: '900', color: GR.textLight, flexShrink: 1 },
  instruction: {
    fontSize: 15,
    fontWeight: '600',
    color: GR.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: GR.glass,
    borderWidth: 1,
    borderColor: GR.glassBorder,
  },
  replayTxt: { fontSize: 13, fontWeight: '700', color: GR.amberGlow },
  coach: {
    backgroundColor: GR.glass,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GR.glassBorder,
    padding: 12,
    marginBottom: 12,
  },
  coachLabel: { fontSize: 9, fontWeight: '900', color: GR.accentGlow, letterSpacing: 1, marginBottom: 4 },
  coachText: { fontSize: 14, fontWeight: '700', color: GR.textLight, lineHeight: 20 },
  stage: {
    flex: 1,
    backgroundColor: GR.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: GR.glassBorder,
    padding: 16,
    overflow: 'hidden',
  },
});
