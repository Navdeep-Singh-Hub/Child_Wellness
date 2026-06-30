/**
 * Game 3 — Shape Bridge: complete the triangle-circle alternating pattern.
 * Logic Lab · Section 6 · Session 6 (Preposition BETWEEN)
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

const PATTERN = ['triangle', 'circle', 'triangle', 'circle'] as const;
type Shape = 'triangle' | 'circle' | 'square';

const CORRECT: Shape = 'triangle';
const CHOICES: { id: Shape; emoji: string; label: string; glow: string }[] = [
  { id: 'triangle', emoji: '🔺', label: 'Triangle', glow: '#F472B6' },
  { id: 'circle', emoji: '🔵', label: 'Circle', glow: '#60A5FA' },
  { id: 'square', emoji: '🟥', label: 'Square', glow: '#FCA5A5' },
];

const VOICE = 'Look at the pattern. Tap the shape that comes next.';
const MID = { rose: '#F472B6', glow: '#FBCFE8', violet: '#8B5CF6', bridge: '#6366F1' } as const;

const EMOJI: Record<'triangle' | 'circle', string> = { triangle: '🔺', circle: '🔵' };

function ShapeCell({ shape, index }: { shape: 'triangle' | 'circle'; index: number }) {
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

  const tint = shape === 'triangle' ? '#F472B633' : '#6366F133';

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, anim, { backgroundColor: tint }]} />
      <View style={[styles.cell, shape === 'triangle' ? styles.cellTri : styles.cellCircle]}>
        <Text style={styles.cellEmoji}>{EMOJI[shape]}</Text>
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
    borderColor: `rgba(251,207,232,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${MID.violet}55`, 'rgba(15,23,42,0.55)']} style={styles.blankGrad} />
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
          ? MID.glow
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

export function PatternRecognitionBetween({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Shape | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (shape: Shape) => {
      if (feedback === 'correct') return;
      setSelected(shape);
      setAttempts((a) => a + 1);

      if (shape === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! A triangle comes next!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          shape === 'circle'
            ? 'Circle was just before. Triangle and circle take turns!'
            : 'Square is not in this pattern — pick triangle or circle!',
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
      ? 'Triangle and circle alternate — what shape comes next?'
      : 'Say it: Triangle — Circle — Triangle — Circle — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Shape Bridge!"
        subtitle="You wove the middle pattern!"
        badgeEmoji="🔺"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="SHAPE BRIDGE · GAME 3"
      title="Complete the pattern"
      instruction="Tap the shape that comes next in the sequence."
      mascot="🔺"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 6 · BETWEEN</Text>
      </View>

      <View style={styles.loomWrap}>
        <LinearGradient
          colors={[`${MID.violet}44`, 'transparent', `${MID.rose}22`]}
          style={styles.loomGlow}
        />
        <Text style={styles.loomLabel}>BRIDGE WEAVE</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((s, i) => (
            <ShapeCell key={i} shape={s} index={i} />
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
        <Text style={styles.legendTxt}>Rule: 🔺 and 🔵 alternate back and forth</Text>
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
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: `${MID.violet}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: MID.glow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${MID.glow}44`,
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
    color: MID.glow,
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
  cellTri: { borderColor: `${MID.rose}88`, backgroundColor: 'rgba(244,114,182,0.12)' },
  cellCircle: { borderColor: `${MID.bridge}88`, backgroundColor: 'rgba(99,102,241,0.12)' },
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
  blankQ: { fontSize: 24, fontWeight: '900', color: MID.glow },
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
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: `${MID.violet}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: MID.glow, textAlign: 'center' },
});
