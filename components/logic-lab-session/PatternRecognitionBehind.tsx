/**
 * Game 3 — Grove Loom: complete the apple-banana alternating pattern.
 * Logic Lab · Section 6 · Session 5 (Preposition BEHIND)
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PATTERN = ['apple', 'banana', 'apple', 'banana'] as const;
type Fruit = 'apple' | 'banana' | 'grape';

const CORRECT: Fruit = 'apple';
const CHOICES: { id: Fruit; emoji: string; label: string; glow: string }[] = [
  { id: 'apple', emoji: '🍎', label: 'Apple', glow: '#FCA5A5' },
  { id: 'banana', emoji: '🍌', label: 'Banana', glow: '#FDE047' },
  { id: 'grape', emoji: '🍇', label: 'Grape', glow: '#C4B5FD' },
];

const VOICE = 'Look at the pattern. Tap the fruit that comes next.';
const TRAIL = { deep: '#14532D', glow: '#4ADE80', apple: '#EF4444', banana: '#EAB308' } as const;

const EMOJI: Record<'apple' | 'banana', string> = { apple: '🍎', banana: '🍌' };

function FruitCell({ fruit, index }: { fruit: 'apple' | 'banana'; index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(withTiming(1, { duration: 860 + index * 105 }), withTiming(0, { duration: 860 + index * 105 })),
      -1,
      true,
    );
  }, [drift, index]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.28 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  const tint = fruit === 'apple' ? '#EF444433' : '#EAB30833';

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, anim, { backgroundColor: tint }]} />
      <View style={[styles.cell, fruit === 'apple' ? styles.cellApple : styles.cellBanana]}>
        <Text style={styles.cellEmoji}>{EMOJI[fruit]}</Text>
        <Text style={styles.cellIdx}>{index + 1}</Text>
      </View>
    </View>
  );
}

function BlankSlot() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor: `rgba(74,222,128,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${TRAIL.glow}55`, 'rgba(15,23,42,0.55)']} style={styles.blankGrad} />
      <Text style={styles.blankQ}>?</Text>
      <Text style={styles.blankLbl}>NEXT</Text>
    </Animated.View>
  );
}

function ChoiceOrb({
  choice,
  selected,
  feedback,
  onPress,
}: {
  choice: (typeof CHOICES)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(10, { duration: 45 }),
        withTiming(-10, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [feedback, selected, shake]);

  useEffect(() => {
    if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.1, { damping: 7 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [feedback, selected, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? LL.good
      : feedback === 'wrong' && selected
        ? LL.warn
        : selected
          ? TRAIL.glow
          : LL.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={choice.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${choice.glow}22` }]} />
        <Text style={styles.orbEmoji}>{choice.emoji}</Text>
        <Text style={styles.orbLabel}>{choice.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PatternRecognitionBehind({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Fruit | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (fruit: Fruit) => {
      if (feedback === 'correct') return;
      setSelected(fruit);
      setAttempts((a) => a + 1);

      if (fruit === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! An apple comes next!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          fruit === 'banana'
            ? 'Banana was just before. Apple and banana take turns!'
            : 'Grape is not in this pattern — pick apple or banana!',
        );
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'Apple and banana alternate — what fruit comes next?'
      : 'Say it: Apple — Banana — Apple — Banana — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Grove Loom!"
        subtitle="You wove the orchard pattern!"
        badgeEmoji="🍎"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="GROVE LOOM · GAME 3"
      title="Complete the pattern"
      instruction="Tap the fruit that comes next in the sequence."
      mascot="🍎"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 5 · BEHIND</Text>
      </View>

      <View style={styles.loomWrap}>
        <LinearGradient
          colors={[`${TRAIL.deep}88`, 'transparent', `${TRAIL.glow}22`]}
          style={styles.loomGlow}
        />
        <Text style={styles.loomLabel}>ORCHARD WEAVE</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((f, i) => (
            <FruitCell key={i} fruit={f} index={i} />
          ))}
          <BlankSlot />
        </View>
      </View>

      <Text style={styles.prompt}>What comes next?</Text>

      <View style={styles.choicesRow}>
        {CHOICES.map((c) => (
          <ChoiceOrb
            key={c.id}
            choice={c}
            selected={selected === c.id}
            feedback={feedback}
            onPress={() => handleChoice(c.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Rule: 🍎 and 🍌 alternate back and forth</Text>
      </View>
    </LogicLabGameShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(20,83,45,0.2)',
    borderWidth: 1,
    borderColor: `${TRAIL.glow}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: TRAIL.glow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${TRAIL.glow}44`,
    backgroundColor: 'rgba(30,27,75,0.55)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  loomGlow: { ...StyleSheet.absoluteFillObject },
  loomLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: TRAIL.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  cell: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellApple: { borderColor: `${TRAIL.apple}88`, backgroundColor: 'rgba(239,68,68,0.12)' },
  cellBanana: { borderColor: `${TRAIL.banana}88`, backgroundColor: 'rgba(234,179,8,0.12)' },
  cellEmoji: { fontSize: 26 },
  cellIdx: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 8,
    fontWeight: '900',
    color: LL.textMuted,
  },
  blankSlot: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankGrad: { ...StyleSheet.absoluteFillObject },
  blankQ: { fontSize: 24, fontWeight: '900', color: TRAIL.glow },
  blankLbl: { fontSize: 7, fontWeight: '900', color: LL.textMuted, letterSpacing: 0.8, marginTop: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  choicesRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, flexWrap: 'wrap' },
  orb: {
    width: 96,
    height: 108,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 40 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: LL.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(20,83,45,0.25)',
    borderWidth: 1,
    borderColor: `${TRAIL.glow}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: TRAIL.glow, textAlign: 'center' },
});
