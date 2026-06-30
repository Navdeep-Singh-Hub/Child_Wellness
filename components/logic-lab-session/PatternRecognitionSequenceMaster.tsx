/**
 * Game 3 — Step Loom: complete the blue-green alternating square pattern.
 * Logic Lab · Section 6 · Session 9 (Sequence Master)
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

const PATTERN = ['blue', 'green', 'blue', 'green'] as const;
type Tile = 'blue' | 'green' | 'red';

const CORRECT: Tile = 'blue';
const CHOICES: { id: Tile; emoji: string; label: string; glow: string }[] = [
  { id: 'blue', emoji: '🟦', label: 'Blue', glow: '#60A5FA' },
  { id: 'green', emoji: '🟩', label: 'Green', glow: '#4ADE80' },
  { id: 'red', emoji: '🟥', label: 'Red', glow: '#F87171' },
];

const VOICE = 'Complete the pattern. Choose the shape that comes next.';

const SEQ = { amber: '#F59E0B', glow: '#FDE68A', indigo: '#6366F1', midnight: '#1E1B4B', step: '#38BDF8' } as const;

const EMOJI: Record<'blue' | 'green', string> = { blue: '🟦', green: '🟩' };

function TileCell({ color, index }: { color: 'blue' | 'green'; index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(withTiming(1, { duration: 820 + index * 100 }), withTiming(0, { duration: 820 + index * 100 })),
      -1,
      true,
    );
  }, [drift, index]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.28 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  const tint = color === 'blue' ? '#60A5FA33' : '#4ADE8033';

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, anim, { backgroundColor: tint }]} />
      <View style={[styles.cell, color === 'blue' ? styles.cellBlue : styles.cellGreen]}>
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
    borderColor: `rgba(253,230,138,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${SEQ.amber}55`, 'rgba(15,23,42,0.55)']} style={styles.blankGrad} />
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
          ? SEQ.glow
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

export function PatternRecognitionSequenceMaster({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (tile: Tile) => {
      if (feedback === 'correct') return;
      setSelected(tile);
      setAttempts((a) => a + 1);

      if (tile === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Blue comes next!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          tile === 'green'
            ? 'Green was just before. Blue and green take turns!'
            : 'Red is not in this pattern — pick blue or green!',
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
      ? 'Blue and green squares alternate — what comes next?'
      : 'Say it: Blue — Green — Blue — Green — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Step Loom!"
        subtitle="You completed the sequence!"
        badgeEmoji="🟦"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="STEP LOOM · GAME 3"
      title="Complete the pattern"
      instruction="Tap the square that comes next in the sequence."
      mascot="🟦"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 9 · SEQUENCE MASTER</Text>
      </View>

      <View style={styles.loomWrap}>
        <LinearGradient
          colors={[`${SEQ.indigo}44`, 'transparent', `${SEQ.amber}22`]}
          style={styles.loomGlow}
        />
        <Text style={styles.loomLabel}>TILE SEQUENCE</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((c, i) => (
            <TileCell key={i} color={c} index={i} />
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
        <Text style={styles.legendTxt}>Rule: 🟦 and 🟩 alternate — 5th tile completes the step</Text>
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
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${SEQ.amber}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SEQ.glow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SEQ.glow}44`,
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
    color: SEQ.glow,
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
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  cell: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBlue: { borderColor: '#60A5FA88', backgroundColor: 'rgba(96,165,250,0.12)' },
  cellGreen: { borderColor: '#4ADE8088', backgroundColor: 'rgba(74,222,128,0.12)' },
  cellEmoji: { fontSize: 24 },
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
    borderRadius: 10,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankGrad: { ...StyleSheet.absoluteFillObject },
  blankQ: { fontSize: 22, fontWeight: '900', color: SEQ.glow },
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
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: `${SEQ.indigo}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: SEQ.glow, textAlign: 'center' },
});
