/**
 * Game 4 — Timeline Grove: order planting steps (seed → soil → water).
 * Logic Lab · Section 6 · Session 1
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
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

const STEPS = [
  { id: 'seed', label: 'Seed', emoji: '🌱', correctOrder: 1, desc: 'Plant the seed' },
  { id: 'soil', label: 'Soil', emoji: '🪴', correctOrder: 2, desc: 'Cover with soil' },
  { id: 'water', label: 'Water', emoji: '💧', correctOrder: 3, desc: 'Pour water' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const VOICE = 'Arrange the steps in the correct order. First seed, then soil, then water.';

const GROVE = { accent: '#34D399', accentBright: '#6EE7B7', lime: '#A3E635', soil: '#92400E' } as const;

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
    borderColor: active && !filled ? `rgba(52,211,153,${0.5 + pulse.value * 0.45})` : filled ? GROVE.accent : LL.glassBorder,
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

function StepCard({
  step,
  onPress,
  shake,
}: {
  step: (typeof STEPS)[number];
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
        style={({ pressed }) => [styles.stepCard, pressed && styles.pressed]}
        accessibilityLabel={`${step.label}: ${step.desc}`}
      >
        <LinearGradient colors={[`${GROVE.accent}33`, 'rgba(15,23,42,0.55)']} style={styles.stepGrad} />
        <Text style={styles.stepEmoji}>{step.emoji}</Text>
        <Text style={styles.stepLabel}>{step.label}</Text>
        <Text style={styles.stepDesc}>{step.desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SequenceOrder({ onComplete }: { onComplete: () => void }) {
  const [order, setOrder] = useState<Partial<Record<StepId, number>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [nextSlot, setNextSlot] = useState(1);
  const [wrongId, setWrongId] = useState<StepId | null>(null);
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleStepTap = useCallback(
    (id: StepId) => {
      const step = STEPS.find((s) => s.id === id)!;
      const correctOrder = step.correctOrder;

      if (nextSlot !== correctOrder) {
        setAttempts((a) => a + 1);
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          correctOrder < nextSlot
            ? `${step.label} comes later. What is step ${nextSlot}?`
            : `${step.label} comes earlier. What is step ${nextSlot}?`,
        );
        setTimeout(() => setWrongId(null), 700);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak(`Step ${nextSlot}: ${step.label}!`);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));

      if (nextSlot === 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Perfect order! The seed can grow!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setNextSlot((n) => n + 1);
      }
    },
    [nextSlot, onComplete],
  );

  const coachLine =
    nextSlot === 1
      ? 'Every plant starts with a seed. Tap step 1 first!'
      : nextSlot === 2
        ? 'Next, cover the seed with soil.'
        : 'Last step — give the plant water!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Timeline Grove!"
        subtitle="Seed → Soil → Water — perfect sequence!"
        badgeEmoji="🌱"
      />
    );
  }

  const remaining = STEPS.filter((s) => !order[s.id]);

  return (
    <LogicLabGameShell
      studio="TIMELINE GROVE · GAME 4"
      title="Put steps in order"
      instruction="Tap each step in the right order: seed, soil, then water."
      mascot="🌱"
      coachLine={attempts > 0 ? coachLine : `${coachLine} (Step ${nextSlot} of 3)`}
      onReplayVoice={playVoice}
    >
      <View style={styles.mission}>
        <Text style={styles.missionTitle}>🌿 Planting a Seed</Text>
        <Text style={styles.missionSub}>What is step number {nextSlot}?</Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.vine} />
        {[1, 2, 3].map((n) => {
          const filled = STEPS.find((s) => order[s.id] === n);
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
        <Text style={styles.trayLabel}>GARDEN TRAY — pick the next step</Text>
        <View style={styles.stepsRow}>
          {remaining.map((s) => (
            <StepCard key={s.id} step={s} onPress={() => handleStepTap(s.id)} shake={wrongId === s.id} />
          ))}
        </View>
      </View>
    </LogicLabGameShell>
  );
}

const styles = StyleSheet.create({
  mission: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: `${GROVE.accent}44`,
  },
  missionTitle: { fontSize: 18, fontWeight: '900', color: GROVE.accentBright },
  missionSub: { fontSize: 14, fontWeight: '600', color: LL.textMuted, marginTop: 4 },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    position: 'relative',
    paddingTop: 8,
  },
  vine: {
    position: 'absolute',
    top: 28,
    left: '12%',
    right: '12%',
    height: 3,
    backgroundColor: `${GROVE.lime}55`,
    borderRadius: 2,
  },
  slot: {
    width: 96,
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  slotFilled: { backgroundColor: 'rgba(52,211,153,0.12)' },
  slotBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(99,102,241,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  slotBadgeActive: { backgroundColor: GROVE.accent },
  slotNum: { fontSize: 13, fontWeight: '900', color: LL.textLight },
  slotEmoji: { fontSize: 32 },
  slotLabel: { fontSize: 11, fontWeight: '800', color: GROVE.accentBright, marginTop: 2 },
  slotEmpty: { fontSize: 12, fontWeight: '600', color: LL.textMuted, marginTop: 12 },
  tray: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${GROVE.soil}66`,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 14,
  },
  trayLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: GROVE.lime,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  stepCard: {
    width: 108,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  stepGrad: { ...StyleSheet.absoluteFillObject },
  stepEmoji: { fontSize: 38 },
  stepLabel: { fontSize: 15, fontWeight: '900', color: LL.textLight, marginTop: 6 },
  stepDesc: { fontSize: 10, fontWeight: '600', color: LL.textMuted, textAlign: 'center', marginTop: 4 },
  pressed: { opacity: 0.88 },
});
