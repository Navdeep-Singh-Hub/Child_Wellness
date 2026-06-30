/**
 * Game 3 — Pattern Arena: complete two master patterns (RGB trio + blue/green tiles).
 * Logic Lab · Section 6 · Session 10 (Logic Lab Master)
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

const ROUNDS = [
  {
    id: 'rgb',
    label: 'RGB TRIO',
    pattern: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢'],
    correct: '🔴',
    choices: [
      { emoji: '🔴', id: 'red', label: 'Red', glow: '#F87171' },
      { emoji: '🔵', id: 'blue', label: 'Blue', glow: '#60A5FA' },
      { emoji: '🟢', id: 'green', label: 'Green', glow: '#4ADE80' },
    ],
    voice: 'Complete the pattern. Choose the shape that comes next.',
    coach: 'Red, blue, green repeat in a cycle.',
    wrongMsg: (id: string) =>
      id === 'blue'
        ? 'Blue comes after red. The cycle is red — blue — green!'
        : 'Green was just before. After green comes red!',
  },
  {
    id: 'tiles',
    label: 'SQUARE DUO',
    pattern: ['🟦', '🟩', '🟦', '🟩'],
    correct: '🟦',
    choices: [
      { emoji: '🟦', id: 'blue', label: 'Blue', glow: '#60A5FA' },
      { emoji: '🟩', id: 'green', label: 'Green', glow: '#4ADE80' },
      { emoji: '🟥', id: 'red', label: 'Red', glow: '#F87171' },
    ],
    voice: 'Complete the pattern. Choose the shape that comes next.',
    coach: 'Blue and green squares alternate.',
    wrongMsg: (id: string) =>
      id === 'green' ? 'Green was just before. Blue and green take turns!' : 'Red is not in this pattern!',
  },
] as const;

const VOICE_INTRO = 'Complete two patterns. Tap the shape that comes next.';

const CROWN = { gold: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', amber: '#F59E0B', deep: '#1E1B4B' } as const;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <LinearGradient
          colors={[CROWN.gold, CROWN.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[bar.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={bar.label}>Pattern {done + 1} of {total}</Text>
    </View>
  );
}

function PatternCell({ emoji, index }: { emoji: string; index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(withTiming(1, { duration: 860 + index * 90 }), withTiming(0, { duration: 860 + index * 90 })),
      -1,
      true,
    );
  }, [drift, index]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.3 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, anim]} />
      <View style={styles.cell}>
        <Text style={styles.cellEmoji}>{emoji}</Text>
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
    borderColor: `rgba(254,243,199,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${CROWN.gold}55`, 'rgba(15,23,42,0.55)']} style={styles.blankGrad} />
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
  choice: (typeof ROUNDS)[number]['choices'][number];
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
          ? CROWN.glow
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

export function PatternChallengeLogicLabMaster({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const round = ROUNDS[roundIndex];
  const isLast = roundIndex === ROUNDS.length - 1;

  const playVoice = useCallback(() => {
    speak(roundIndex === 0 ? VOICE_INTRO : round.voice, 0.75).catch(() => {});
  }, [roundIndex, round.voice]);

  useEffect(() => {
    speak(round.voice, 0.75).catch(() => {});
  }, [roundIndex, round.voice]);

  const handleChoice = useCallback(
    (choice: (typeof round.choices)[number]) => {
      if (feedback === 'correct') return;
      setSelectedId(choice.id);

      if (choice.emoji !== round.correct) {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(round.wrongMsg(choice.id));
        setTimeout(() => {
          setFeedback('idle');
          setSelectedId(null);
        }, 900);
        return;
      }

      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak('Correct!');

      setTimeout(() => {
        if (isLast) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        } else {
          setRoundIndex((i) => i + 1);
          setSelectedId(null);
          setFeedback('idle');
        }
      }, 1100);
    },
    [feedback, round, isLast, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Pattern Arena!"
        subtitle="Both patterns mastered!"
        badgeEmoji="🔴"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="PATTERN ARENA · GAME 3"
      title="Complete the pattern"
      instruction="Tap the shape that comes next in each pattern."
      mascot="🔴"
      coachLine={round.coach}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 10 · LOGIC LAB MASTER</Text>
      </View>

      <ProgressBar done={roundIndex} total={ROUNDS.length} />

      <View style={styles.loomWrap}>
        <LinearGradient colors={[`${CROWN.violet}44`, 'transparent', `${CROWN.gold}22`]} style={styles.loomGlow} />
        <Text style={styles.loomLabel}>{round.label}</Text>
        <View style={styles.patternRow}>
          {round.pattern.map((e, i) => (
            <PatternCell key={i} emoji={e} index={i} />
          ))}
          <BlankSlot />
        </View>
      </View>

      <Text style={styles.prompt}>What comes next?</Text>

      <View style={styles.choicesRow}>
        {round.choices.map((c) => (
          <ChoiceOrb
            key={c.id}
            choice={c}
            selected={selectedId === c.id}
            feedback={feedback}
            onPress={() => handleChoice(c)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: CROWN.glow, textAlign: 'center' },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: `${CROWN.gold}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: CROWN.glow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${CROWN.gold}44`,
    backgroundColor: 'rgba(30,27,75,0.55)',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 18,
    overflow: 'hidden',
  },
  loomGlow: { ...StyleSheet.absoluteFillObject },
  loomLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: CROWN.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: `${CROWN.violet}66`,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 22 },
  cellIdx: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 7,
    fontWeight: '900',
    color: LL.textMuted,
  },
  blankSlot: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankGrad: { ...StyleSheet.absoluteFillObject },
  blankQ: { fontSize: 22, fontWeight: '900', color: CROWN.glow },
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
});
