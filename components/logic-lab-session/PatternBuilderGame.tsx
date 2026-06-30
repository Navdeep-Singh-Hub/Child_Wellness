/**
 * Game 3 — Builder Loom: complete the 5-bead red-blue pattern.
 * Logic Lab · Section 6 · Session 8 (Pattern Builder)
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

const PATTERN = ['red', 'blue', 'red', 'blue', 'red'] as const;
type Color = 'red' | 'blue' | 'green';

const CORRECT: Color = 'blue';
const CHOICES: { id: Color; emoji: string; label: string; glow: string }[] = [
  { id: 'red', emoji: '🔴', label: 'Red', glow: '#F87171' },
  { id: 'blue', emoji: '🔵', label: 'Blue', glow: '#60A5FA' },
  { id: 'green', emoji: '🟢', label: 'Green', glow: '#4ADE80' },
];

const VOICE = 'Complete the pattern. Choose the shape that comes next.';
const WEAVE = { teal: '#14B8A6', glow: '#5EEAD4', thread: '#EC4899', ink: '#134E4A' } as const;

const EMOJI: Record<'red' | 'blue', string> = { red: '🔴', blue: '🔵' };

function BeadCell({ color, index }: { color: 'red' | 'blue'; index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(withTiming(1, { duration: 820 + index * 90 }), withTiming(0, { duration: 820 + index * 90 })),
      -1,
      true,
    );
  }, [drift, index]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.28 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  const tint = color === 'red' ? '#F8717133' : '#60A5FA33';

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, anim, { backgroundColor: tint }]} />
      <View style={[styles.cell, color === 'red' ? styles.cellRed : styles.cellBlue]}>
        <Text style={styles.cellEmoji}>{EMOJI[color]}</Text>
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
    borderColor: `rgba(94,234,212,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${WEAVE.teal}55`, 'rgba(15,23,42,0.55)']} style={styles.blankGrad} />
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
          ? WEAVE.glow
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

export function PatternBuilderGame({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Color | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (color: Color) => {
      if (feedback === 'correct') return;
      setSelected(color);
      setAttempts((a) => a + 1);

      if (color === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Blue comes next!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          color === 'red'
            ? 'Red was just before. Red and blue take turns!'
            : 'Green is not in this pattern — pick red or blue!',
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
      ? 'Five beads alternate red and blue — what comes next?'
      : 'Say it: Red — Blue — Red — Blue — Red — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Builder Loom!"
        subtitle="You built the pattern!"
        badgeEmoji="🔵"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="BUILDER LOOM · GAME 3"
      title="Complete the pattern"
      instruction="Tap the bead that comes next in the sequence."
      mascot="🔴"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 8 · PATTERN BUILDER</Text>
      </View>

      <View style={styles.loomWrap}>
        <LinearGradient
          colors={[`${WEAVE.teal}44`, 'transparent', `${WEAVE.thread}22`]}
          style={styles.loomGlow}
        />
        <Text style={styles.loomLabel}>BEAD SEQUENCE</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((c, i) => (
            <BeadCell key={i} color={c} index={i} />
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
        <Text style={styles.legendTxt}>Rule: 🔴 and 🔵 alternate — 6th bead completes the weave</Text>
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
    backgroundColor: 'rgba(20,184,166,0.12)',
    borderWidth: 1,
    borderColor: `${WEAVE.teal}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: WEAVE.glow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${WEAVE.glow}44`,
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
    color: WEAVE.glow,
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
    borderRadius: 24,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellRed: { borderColor: '#F8717188', backgroundColor: 'rgba(248,113,113,0.12)' },
  cellBlue: { borderColor: '#60A5FA88', backgroundColor: 'rgba(96,165,250,0.12)' },
  cellEmoji: { fontSize: 22 },
  cellIdx: {
    position: 'absolute',
    bottom: 1,
    right: 3,
    fontSize: 7,
    fontWeight: '900',
    color: LL.textMuted,
  },
  blankSlot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankGrad: { ...StyleSheet.absoluteFillObject },
  blankQ: { fontSize: 22, fontWeight: '900', color: WEAVE.glow },
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
    backgroundColor: 'rgba(20,184,166,0.12)',
    borderWidth: 1,
    borderColor: `${WEAVE.teal}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: WEAVE.glow, textAlign: 'center' },
});
