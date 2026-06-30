/**
 * Game 1 — Arrange the conversation. Tap in order: Hello (1), How are you? (2), I am fine. (3). Session 8: Dialogue Builder.
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const LINES = [
  { id: 'hello', label: 'Hello', emoji: '👋', correctOrder: 1 },
  { id: 'how', label: 'How are you?', emoji: '❓', correctOrder: 2 },
  { id: 'fine', label: 'I am fine.', emoji: '😊', correctOrder: 3 },
] as const;

type LineId = (typeof LINES)[number]['id'];

const VOICE = 'Arrange the sentences to make a conversation. Tap them in order.';

const PALETTE = { accent: '#2563EB', glow: '#93C5FD', secondary: '#3B82F6' } as const;

function TimelineSlot({
  num,
  filled,
  active,
}: {
  num: number;
  filled?: { emoji: string; label: string };
  active: boolean;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!active || filled) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      true,
    );
  }, [active, filled, pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor:
      active && !filled
        ? `rgba(37,99,235,${0.5 + pulse.value * 0.45})`
        : filled
          ? PALETTE.accent
          : GR.glassBorder,
    transform: [{ scale: active && !filled ? 1 + pulse.value * 0.04 : 1 }],
  }));

  return (
    <Animated.View style={[styles.slot, anim, filled && styles.slotFilled]}>
      <View style={[styles.slotBadge, active && !filled && styles.slotBadgeActive]}>
        <Text style={styles.slotNum}>{num}</Text>
      </View>
      {filled ? (
        <>
          <Text style={styles.slotEmoji}>{filled.emoji}</Text>
          <Text style={styles.slotLabel}>{filled.label}</Text>
        </>
      ) : (
        <Text style={styles.slotEmpty}>{active ? 'Tap step' : '—'}</Text>
      )}
    </Animated.View>
  );
}

function LineCard({
  line,
  onPress,
  shake,
}: {
  line: (typeof LINES)[number];
  onPress: () => void;
  shake: boolean;
}) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!shake) return;
    shakeX.value = withSequence(
      withTiming(10, { duration: 45 }),
      withTiming(-10, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.lineCard, pressed && styles.pressed]}
        accessibilityLabel={line.label}
      >
        <LinearGradient colors={[`${PALETTE.accent}33`, 'rgba(15,10,30,0.55)']} style={styles.lineGrad} />
        <Text style={styles.lineEmoji}>{line.emoji}</Text>
        <Text style={styles.lineLabel}>{line.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DialogueArrangeHello({ onComplete }: { onComplete: () => void }) {
  const [nextSlot, setNextSlot] = useState(1);
  const [order, setOrder] = useState<Partial<Record<LineId, number>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongId, setWrongId] = useState<LineId | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: LineId) => {
      const step = LINES.find((s) => s.id === id);
      if (!step || step.correctOrder !== nextSlot) {
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again.', 0.65);
        setTimeout(() => setWrongId(null), 700);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak(`${nextSlot}. ${step.label}!`, 0.7);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));

      if (nextSlot === 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Great job!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setNextSlot((n) => n + 1);
      }
    },
    [nextSlot, onComplete],
  );

  const coachLine =
    nextSlot === 1
      ? 'Every conversation starts with Hello — tap step 1!'
      : nextSlot === 2
        ? 'Next, ask How are you?'
        : 'Finish with I am fine.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="Conversation in order!"
        badgeEmoji="💬"
      />
    );
  }

  const remaining = LINES.filter((s) => !order[s.id]);
  const progressPct = ((nextSlot - 1) / 3) * 100;

  return (
    <GraduateGameShell
      studio="DIALOGUE SEQUENCE · GAME 1"
      title="Put the dialogue in order"
      instruction="Arrange the sentences to make a conversation. Tap them in order."
      mascot="💬"
      coachLine={`${coachLine} (Step ${nextSlot} of 3)`}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>DIALOGUE TIMELINE</Text>
          <Text style={styles.progressCount}>{nextSlot - 1} / 3 placed</Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.mission}>
        <Text style={styles.missionTitle}>💬 Hello Conversation</Text>
        <Text style={styles.missionSub}>What is step number {nextSlot}?</Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.connector} />
        {[1, 2, 3].map((n) => {
          const filled = LINES.find((s) => order[s.id] === n);
          return (
            <TimelineSlot
              key={n}
              num={n}
              active={n === nextSlot}
              filled={filled ? { emoji: filled.emoji, label: filled.label } : undefined}
            />
          );
        })}
      </View>

      <View style={styles.tray}>
        <Text style={styles.trayLabel}>DIALOGUE TRAY — pick the next line</Text>
        <View style={styles.linesRow}>
          {remaining.map((s) => (
            <LineCard
              key={s.id}
              line={s}
              onPress={() => handleTap(s.id)}
              shake={wrongId === s.id}
            />
          ))}
        </View>
      </View>
    </GraduateGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: PALETTE.glow },
  progressCount: { fontSize: 14, fontWeight: '900', color: GR.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  mission: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  missionTitle: { fontSize: 18, fontWeight: '900', color: PALETTE.glow },
  missionSub: { fontSize: 14, fontWeight: '600', color: GR.textMuted, marginTop: 4 },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 18,
    position: 'relative',
    paddingTop: 8,
  },
  connector: {
    position: 'absolute',
    top: 28,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: `${PALETTE.glow}55`,
    borderRadius: 2,
  },
  slot: {
    flex: 1,
    maxWidth: 110,
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: GR.glassBorder,
    backgroundColor: 'rgba(15,10,30,0.55)',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  slotFilled: { backgroundColor: 'rgba(37,99,235,0.14)' },
  slotBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(59,130,246,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  slotBadgeActive: { backgroundColor: PALETTE.accent },
  slotNum: { fontSize: 13, fontWeight: '900', color: GR.textLight },
  slotEmoji: { fontSize: 28 },
  slotLabel: { fontSize: 10, fontWeight: '800', color: PALETTE.glow, marginTop: 2, textAlign: 'center' },
  slotEmpty: { fontSize: 11, fontWeight: '600', color: GR.textMuted, marginTop: 10, textAlign: 'center' },
  tray: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.45)',
    padding: 14,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  linesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  lineCard: {
    minWidth: 120,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: GR.glassBorder,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  lineGrad: { ...StyleSheet.absoluteFillObject },
  lineEmoji: { fontSize: 32 },
  lineLabel: { fontSize: 14, fontWeight: '800', color: GR.textLight, marginTop: 6, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
