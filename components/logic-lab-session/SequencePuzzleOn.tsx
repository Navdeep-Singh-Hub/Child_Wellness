/**
 * Game 4 — Stack Studio: order sandwich steps (bread → cheese ON bread → bread).
 * Logic Lab · Section 6 · Session 2 (Preposition ON)
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
  { id: 'bread1', label: 'Bottom Bread', emoji: '🍞', correctOrder: 1, desc: 'Base layer' },
  { id: 'cheese', label: 'Cheese', emoji: '🧀', correctOrder: 2, desc: 'ON the bread' },
  { id: 'bread2', label: 'Top Bread', emoji: '🍞', correctOrder: 3, desc: 'ON the cheese' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const VOICE = 'Arrange the steps to make a sandwich. First bread, then cheese ON the bread, then bread ON top.';

const STACK = { amber: '#F59E0B', cream: '#FFFBEB', cheese: '#FCD34D', crust: '#92400E' } as const;

function StackSlot({
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
    borderColor: active && !filled ? `rgba(245,158,11,${0.45 + pulse.value * 0.4})` : filled ? STACK.amber : LL.glassBorder,
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
        <Text style={styles.slotEmpty}>{active ? 'Add layer' : '—'}</Text>
      )}
    </Animated.View>
  );
}

function StackPreview({ order }: { order: Partial<Record<StepId, number>> }) {
  const layers = [1, 2, 3]
    .map((n) => STEPS.find((s) => order[s.id] === n))
    .filter(Boolean) as (typeof STEPS)[number][];

  return (
    <View style={preview.wrap}>
      <Text style={preview.label}>SANDWICH STACK</Text>
      <View style={preview.tower}>
        {layers.length === 0 ? (
          <Text style={preview.empty}>Stack builds here</Text>
        ) : (
          [...layers].reverse().map((s) => (
            <View key={s.id} style={[preview.layer, s.id === 'cheese' && preview.cheeseLayer]}>
              <Text style={preview.layerEmoji}>{s.emoji}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function IngredientCard({
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
        <LinearGradient colors={[`${STACK.amber}33`, 'rgba(15,23,42,0.55)']} style={styles.cardGrad} />
        <Text style={styles.cardEmoji}>{step.emoji}</Text>
        <Text style={styles.cardLabel}>{step.label}</Text>
        <Text style={styles.cardDesc}>{step.desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SequencePuzzleOn({ onComplete }: { onComplete: () => void }) {
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
      if (step.correctOrder !== nextSlot) {
        setAttempts((a) => a + 1);
        setWrongId(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          step.correctOrder < nextSlot
            ? `${step.label} goes earlier. What is layer ${nextSlot}?`
            : `${step.label} goes later. Build layer ${nextSlot} first!`,
        );
        setTimeout(() => setWrongId(null), 700);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak(`Layer ${nextSlot}: ${step.label}!`);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));

      if (nextSlot === 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Perfect stack! Cheese is ON the bread!');
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
      ? 'Start with bottom bread — the base of the stack.'
      : nextSlot === 2
        ? 'Place cheese ON the bottom bread.'
        : 'Top bread goes ON the cheese!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Stack Studio!"
        subtitle="Bread → Cheese ON → Bread — perfect!"
        badgeEmoji="🥪"
      />
    );
  }

  const remaining = STEPS.filter((s) => !order[s.id]);

  return (
    <LogicLabGameShell
      studio="STACK STUDIO · GAME 4"
      title="Make a sandwich"
      instruction="Build the layers in order — cheese goes ON the bread."
      mascot="🥪"
      coachLine={`${coachLine} (Layer ${nextSlot}/3)`}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 2 · ON</Text>
      </View>

      <View style={styles.layout}>
        <StackPreview order={order} />
        <View style={styles.slotsCol}>
          <Text style={styles.slotsTitle}>BUILD ORDER</Text>
          {[1, 2, 3].map((n) => {
            const filled = STEPS.find((s) => order[s.id] === n);
            return (
              <StackSlot
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
        <Text style={styles.counterTxt}>What is layer {nextSlot}?</Text>
      </View>

      <View style={styles.cardsRow}>
        {remaining.map((s) => (
          <IngredientCard key={s.id} step={s} onPress={() => handleStepTap(s.id)} shake={wrongId === s.id} />
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
    borderColor: `${STACK.crust}66`,
    backgroundColor: 'rgba(30,27,75,0.4)',
    padding: 10,
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: STACK.cream, marginBottom: 8 },
  tower: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', minHeight: 120, gap: 4 },
  empty: { fontSize: 11, fontWeight: '600', color: LL.textMuted, textAlign: 'center' },
  layer: {
    width: 72,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.25)',
    borderWidth: 1,
    borderColor: STACK.amber,
    alignItems: 'center',
  },
  cheeseLayer: { backgroundColor: 'rgba(252,211,77,0.35)', borderColor: STACK.cheese },
  layerEmoji: { fontSize: 28 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${STACK.amber}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: STACK.cream },
  layout: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'stretch' },
  slotsCol: { flex: 1.2, gap: 8 },
  slotsTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: STACK.amber, marginBottom: 4 },
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
  slotFilled: { backgroundColor: 'rgba(245,158,11,0.1)' },
  slotNum: { fontSize: 14, fontWeight: '900', color: STACK.amber, width: 20 },
  slotEmoji: { fontSize: 26 },
  slotLabel: { fontSize: 12, fontWeight: '800', color: LL.textLight, flex: 1 },
  slotEmpty: { fontSize: 12, fontWeight: '600', color: LL.textMuted, flex: 1 },
  counter: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: `${STACK.amber}44`,
  },
  counterTxt: { fontSize: 15, fontWeight: '800', color: STACK.cream },
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
  cardDesc: { fontSize: 10, fontWeight: '600', color: STACK.cheese, marginTop: 4, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
