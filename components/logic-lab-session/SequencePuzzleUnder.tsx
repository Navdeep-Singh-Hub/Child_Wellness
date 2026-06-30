/**
 * Game 4 — Dawn Studio: order the morning routine steps.
 * Logic Lab · Section 6 · Session 3 (Preposition UNDER)
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
  { id: 'wake', label: 'Wake up', emoji: '😴', correctOrder: 1, desc: 'First light' },
  { id: 'brush', label: 'Brush teeth', emoji: '🪥', correctOrder: 2, desc: 'Fresh start' },
  { id: 'breakfast', label: 'Eat breakfast', emoji: '🥣', correctOrder: 3, desc: 'Fuel up' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const VOICE = 'Arrange the morning routine. First wake up, then brush teeth, then eat breakfast.';

const DAWN = { violet: '#7C3AED', glow: '#A78BFA', dawn: '#FDE68A', deep: '#4C1D95' } as const;

function TimelinePreview({ order }: { order: Partial<Record<StepId, number>> }) {
  const placed = [1, 2, 3]
    .map((n) => STEPS.find((s) => order[s.id] === n))
    .filter(Boolean) as (typeof STEPS)[number][];

  return (
    <View style={preview.wrap}>
      <Text style={preview.label}>MORNING TIMELINE</Text>
      <LinearGradient colors={[`${DAWN.violet}44`, 'transparent']} style={preview.sky} />
      <View style={preview.track}>
        {placed.length === 0 ? (
          <Text style={preview.empty}>Your day builds here</Text>
        ) : (
          placed.map((s, i) => (
            <View key={s.id} style={preview.node}>
              <View style={preview.dot}>
                <Text style={preview.dotEmoji}>{s.emoji}</Text>
              </View>
              {i < placed.length - 1 && <View style={preview.connector} />}
            </View>
          ))
        )}
      </View>
      <Text style={preview.sun}>🌅</Text>
    </View>
  );
}

function DawnSlot({
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
      withSequence(withTiming(1, { duration: 580 }), withTiming(0, { duration: 580 })),
      -1,
      true,
    );
  }, [active, filled, pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor: active && !filled ? `rgba(167,139,250,${0.45 + pulse.value * 0.4})` : filled ? DAWN.glow : LL.glassBorder,
    transform: [{ scale: active && !filled ? 1 + pulse.value * 0.04 : 1 }],
  }));

  return (
    <Animated.View style={[styles.slot, anim, filled && styles.slotFilled]}>
      <Text style={styles.slotNum}>{num}</Text>
      {filled ? (
        <>
          <Text style={styles.slotEmoji}>{filled.emoji}</Text>
          <Text style={styles.slotLabel}>{filled.label}</Text>
        </>
      ) : (
        <Text style={styles.slotEmpty}>{active ? 'Pick step' : '—'}</Text>
      )}
    </Animated.View>
  );
}

function RoutineCard({
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
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityLabel={`${step.label}: ${step.desc}`}
      >
        <LinearGradient colors={[`${DAWN.violet}33`, 'rgba(15,23,42,0.55)']} style={styles.cardGrad} />
        <Text style={styles.cardEmoji}>{step.emoji}</Text>
        <Text style={styles.cardLabel}>{step.label}</Text>
        <Text style={styles.cardDesc}>{step.desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SequencePuzzleUnder({ onComplete }: { onComplete: () => void }) {
  const [order, setOrder] = useState<Partial<Record<StepId, number>>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [nextSlot, setNextSlot] = useState(1);
  const [wrongId, setWrongId] = useState<StepId | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleStepTap = useCallback(
    (id: StepId) => {
      const step = STEPS.find((s) => s.id === id)!;
      if (step.correctOrder !== nextSlot) {
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          step.correctOrder < nextSlot
            ? `${step.label} comes earlier. What is step ${nextSlot}?`
            : `${step.label} comes later. Pick step ${nextSlot} first!`,
        );
        setTimeout(() => setWrongId(null), 700);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak(`Step ${nextSlot}: ${step.label}!`);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));

      if (nextSlot === 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Perfect morning routine!');
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
      ? 'Every morning starts with waking up.'
      : nextSlot === 2
        ? 'After waking, brush your teeth.'
        : 'Finish with a good breakfast!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Dawn Studio!"
        subtitle="Wake → Brush → Breakfast — in order!"
        badgeEmoji="🌅"
      />
    );
  }

  const remaining = STEPS.filter((s) => !order[s.id]);

  return (
    <LogicLabGameShell
      studio="DAWN STUDIO · GAME 4"
      title="Morning routine"
      instruction="Tap each step in the right order to build your morning."
      mascot="🌅"
      coachLine={`${coachLine} (Step ${nextSlot}/3)`}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 3 · UNDER</Text>
      </View>

      <View style={styles.layout}>
        <TimelinePreview order={order} />
        <View style={styles.slotsCol}>
          <Text style={styles.slotsTitle}>ROUTINE ORDER</Text>
          {[1, 2, 3].map((n) => {
            const filled = STEPS.find((s) => order[s.id] === n);
            return (
              <DawnSlot
                key={n}
                num={n}
                active={n === nextSlot}
                filled={filled ? { emoji: filled.emoji, label: filled.label } : undefined}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.counter}>
        <Text style={styles.counterTxt}>What is step {nextSlot}?</Text>
      </View>

      <View style={styles.cardsRow}>
        {remaining.map((s) => (
          <RoutineCard key={s.id} step={s} onPress={() => handleStepTap(s.id)} shake={wrongId === s.id} />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const preview = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 110,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${DAWN.glow}55`,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 10,
    overflow: 'hidden',
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: DAWN.glow, marginBottom: 8 },
  sky: { ...StyleSheet.absoluteFillObject },
  track: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 100, gap: 4 },
  empty: { fontSize: 11, fontWeight: '600', color: LL.textMuted, textAlign: 'center' },
  node: { alignItems: 'center' },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 2,
    borderColor: DAWN.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmoji: { fontSize: 22 },
  connector: { width: 2, height: 14, backgroundColor: `${DAWN.glow}66` },
  sun: { fontSize: 22, marginTop: 6 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: `${DAWN.glow}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: DAWN.glow },
  layout: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'stretch' },
  slotsCol: { flex: 1.2, gap: 8 },
  slotsTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: DAWN.glow, marginBottom: 4 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  slotFilled: { backgroundColor: 'rgba(124,58,237,0.12)' },
  slotNum: { fontSize: 14, fontWeight: '900', color: DAWN.glow, width: 20 },
  slotEmoji: { fontSize: 26 },
  slotLabel: { fontSize: 12, fontWeight: '800', color: LL.textLight, flex: 1 },
  slotEmpty: { fontSize: 12, fontWeight: '600', color: LL.textMuted, flex: 1 },
  counter: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1,
    borderColor: `${DAWN.glow}44`,
  },
  counterTxt: { fontSize: 15, fontWeight: '800', color: DAWN.dawn },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  card: {
    width: 108,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  cardGrad: { ...StyleSheet.absoluteFillObject },
  cardEmoji: { fontSize: 36 },
  cardLabel: { fontSize: 12, fontWeight: '900', color: LL.textLight, marginTop: 6, textAlign: 'center' },
  cardDesc: { fontSize: 10, fontWeight: '600', color: DAWN.glow, marginTop: 4, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
