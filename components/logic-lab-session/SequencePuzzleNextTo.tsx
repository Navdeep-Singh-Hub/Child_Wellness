/**
 * Game 4 — Sink Studio: order the hand-washing steps.
 * Logic Lab · Section 6 · Session 4 (Preposition NEXT TO)
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
  { id: 'water', label: 'Turn on water', emoji: '🚿', correctOrder: 1, desc: 'Wet hands' },
  { id: 'soap', label: 'Use soap', emoji: '🧼', correctOrder: 2, desc: 'Lather up' },
  { id: 'rinse', label: 'Rinse hands', emoji: '💧', correctOrder: 3, desc: 'Wash away' },
  { id: 'dry', label: 'Dry hands', emoji: '🧻', correctOrder: 4, desc: 'Finish clean' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const VOICE = 'Arrange the steps for washing hands. Turn on water, use soap, rinse, then dry.';

const SINK = { coral: '#F97316', glow: '#FDBA74', mint: '#34D399', aqua: '#5EEAD4' } as const;

function FlowPreview({ order }: { order: Partial<Record<StepId, number>> }) {
  const placed = [1, 2, 3, 4]
    .map((n) => STEPS.find((s) => order[s.id] === n))
    .filter(Boolean) as (typeof STEPS)[number][];

  return (
    <View style={preview.wrap}>
      <Text style={preview.label}>WASH FLOW</Text>
      <LinearGradient colors={[`${SINK.mint}33`, 'transparent']} style={preview.wash} />
      <View style={preview.track}>
        {placed.length === 0 ? (
          <Text style={preview.empty}>Steps line up here</Text>
        ) : (
          <View style={preview.row}>
            {placed.map((s, i) => (
              <View key={s.id} style={preview.nodeWrap}>
                <View style={preview.node}>
                  <Text style={preview.nodeEmoji}>{s.emoji}</Text>
                </View>
                {i < placed.length - 1 && <Text style={preview.arrow}>→</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={preview.icon}>🧼</Text>
    </View>
  );
}

function SinkSlot({
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
    borderColor: active && !filled ? `rgba(253,186,116,${0.45 + pulse.value * 0.4})` : filled ? SINK.glow : LL.glassBorder,
    transform: [{ scale: active && !filled ? 1 + pulse.value * 0.04 : 1 }],
  }));

  return (
    <Animated.View style={[styles.slot, anim, filled && styles.slotFilled]}>
      <Text style={styles.slotNum}>{num}</Text>
      {filled ? (
        <>
          <Text style={styles.slotEmoji}>{filled.emoji}</Text>
          <Text style={styles.slotLabel} numberOfLines={1}>
            {filled.label}
          </Text>
        </>
      ) : (
        <Text style={styles.slotEmpty}>{active ? 'Pick' : '—'}</Text>
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
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityLabel={`${step.label}: ${step.desc}`}
      >
        <LinearGradient colors={[`${SINK.coral}33`, 'rgba(15,23,42,0.55)']} style={styles.cardGrad} />
        <Text style={styles.cardEmoji}>{step.emoji}</Text>
        <Text style={styles.cardLabel}>{step.label}</Text>
        <Text style={styles.cardDesc}>{step.desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SequencePuzzleNextTo({ onComplete }: { onComplete: () => void }) {
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

      if (nextSlot === 4) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Sparkling clean! All steps in order!');
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
      ? 'Start by turning on the water.'
      : nextSlot === 2
        ? 'Soap comes next — lather those hands!'
        : nextSlot === 3
          ? 'Rinse the soap away with water.'
          : 'Last step: dry your hands!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Sink Studio!"
        subtitle="Water → Soap → Rinse → Dry — perfect!"
        badgeEmoji="🧼"
      />
    );
  }

  const remaining = STEPS.filter((s) => !order[s.id]);

  return (
    <LogicLabGameShell
      studio="SINK STUDIO · GAME 4"
      title="Wash your hands"
      instruction="Tap each step in the right order to build the routine."
      mascot="🧼"
      coachLine={`${coachLine} (Step ${nextSlot}/4)`}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 4 · NEXT TO</Text>
      </View>

      <View style={styles.layout}>
        <FlowPreview order={order} />
        <View style={styles.slotsCol}>
          <Text style={styles.slotsTitle}>STEP ORDER</Text>
          {[1, 2, 3, 4].map((n) => {
            const filled = STEPS.find((s) => order[s.id] === n);
            return (
              <SinkSlot
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
          <StepCard key={s.id} step={s} onPress={() => handleStepTap(s.id)} shake={wrongId === s.id} />
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
    borderColor: `${SINK.mint}55`,
    backgroundColor: 'rgba(30,27,75,0.45)',
    padding: 10,
    overflow: 'hidden',
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: SINK.aqua, marginBottom: 8 },
  wash: { ...StyleSheet.absoluteFillObject },
  track: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 80 },
  empty: { fontSize: 11, fontWeight: '600', color: LL.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 2 },
  nodeWrap: { flexDirection: 'row', alignItems: 'center' },
  node: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderWidth: 2,
    borderColor: SINK.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeEmoji: { fontSize: 18 },
  arrow: { fontSize: 12, fontWeight: '900', color: SINK.glow, marginHorizontal: 2 },
  icon: { fontSize: 20, marginTop: 6 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderWidth: 1,
    borderColor: `${SINK.coral}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SINK.glow },
  layout: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'stretch' },
  slotsCol: { flex: 1.2, gap: 6 },
  slotsTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SINK.glow, marginBottom: 4 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    backgroundColor: 'rgba(15,23,42,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  slotFilled: { backgroundColor: 'rgba(249,115,22,0.1)' },
  slotNum: { fontSize: 13, fontWeight: '900', color: SINK.glow, width: 18 },
  slotEmoji: { fontSize: 22 },
  slotLabel: { fontSize: 11, fontWeight: '800', color: LL.textLight, flex: 1 },
  slotEmpty: { fontSize: 11, fontWeight: '600', color: LL.textMuted, flex: 1 },
  counter: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: `${SINK.mint}44`,
  },
  counterTxt: { fontSize: 15, fontWeight: '800', color: SINK.aqua },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  card: {
    width: 104,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LL.glassBorder,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  cardGrad: { ...StyleSheet.absoluteFillObject },
  cardEmoji: { fontSize: 32 },
  cardLabel: { fontSize: 11, fontWeight: '900', color: LL.textLight, marginTop: 6, textAlign: 'center' },
  cardDesc: { fontSize: 9, fontWeight: '600', color: SINK.mint, marginTop: 3, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
