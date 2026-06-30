/**
 * Level 7 Reader — Session 6, Game 1: Fragment Forge
 * Complete half of a picture. Show half-circle, user selects the shape that completes it (circle).
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
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

const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕', glyph: '●' },
  { id: 'square', label: 'Square', emoji: '⬜', glyph: '◆' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺', glyph: '▲' },
] as const;

type ShapeId = (typeof OPTIONS)[number]['id'];
const CORRECT_ID: ShapeId = 'circle';

const VOICE =
  'Complete the picture. This is half of a shape. Which shape completes it?';
const FORGE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

function HalfShapeDisplay() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      true,
    );
  }, [pulse]);

  const voidAnim = useAnimatedStyle(() => ({
    borderColor: `rgba(16,185,129,${0.35 + pulse.value * 0.45})`,
    opacity: 0.7 + pulse.value * 0.3,
  }));

  return (
    <View style={display.wrap}>
      <Text style={display.label}>FRAGMENT SCAN</Text>
      <View style={display.frame}>
        <LinearGradient
          colors={[`${FORGE.accent}33`, 'transparent', `${FORGE.mint}22`]}
          style={display.glow}
        />
        <View style={display.row}>
          <View style={display.halfCircle}>
            <View style={display.halfFill} />
          </View>
          <Animated.View style={[display.voidHalf, voidAnim]}>
            <Text style={display.voidQ}>?</Text>
            <Text style={display.voidLbl}>MISSING</Text>
          </Animated.View>
        </View>
        <Text style={display.hint}>left half shown · right half missing</Text>
      </View>
    </View>
  );
}

function ShapeOrb({
  option,
  selected,
  feedback,
  onPress,
}: {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.08, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? FORGE.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${FORGE.accent}22` }]} />
        <Text style={styles.orbEmoji}>{option.emoji}</Text>
        <Text style={styles.orbGlyph}>{option.glyph}</Text>
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface VisualPuzzleReaderSession6GameProps {
  onComplete: () => void;
}

export function VisualPuzzleReaderSession6Game({ onComplete }: VisualPuzzleReaderSession6GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ShapeId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! A circle completes the picture!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'square'
            ? 'A square has corners — this half is curved!'
            : 'A triangle has three sides — look at the curved edge!',
          0.7,
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
      ? 'The missing piece has a curved edge — which whole shape fits?'
      : 'Imagine folding the half — what full shape do you see?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Fragment Forge!"
        subtitle="You completed the picture — it's a circle!"
        badgeEmoji="🧩"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="FRAGMENT FORGE · GAME 1"
      title="Complete the picture"
      instruction="Half of a shape is shown. Tap the shape that completes it."
      mascot="🧩"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <HalfShapeDisplay />

      <Text style={styles.prompt}>Tap the shape that completes it</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((opt) => (
          <ShapeOrb
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Two matching halves make one whole shape</Text>
      </View>
    </ReaderGameShell>
  );
}

const display = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 18 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: FORGE.glow, marginBottom: 10 },
  frame: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FORGE.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.55)',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: { ...StyleSheet.absoluteFillObject },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  halfCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: FORGE.glow,
    borderRightWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  halfFill: {
    width: 40,
    height: 80,
    backgroundColor: `${FORGE.accent}55`,
  },
  voidHalf: {
    width: 44,
    height: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderLeftWidth: 0,
    marginLeft: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  voidQ: { fontSize: 28, fontWeight: '900', color: FORGE.glow },
  voidLbl: { fontSize: 7, fontWeight: '900', color: RD.textMuted, letterSpacing: 0.8, marginTop: 2 },
  hint: { fontSize: 12, fontWeight: '700', color: RD.textMuted },
});

const styles = StyleSheet.create({
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  orb: {
    minWidth: 100,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 36, marginBottom: 2 },
  orbGlyph: { fontSize: 14, fontWeight: '900', color: FORGE.glow, marginBottom: 4 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: `${FORGE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: FORGE.glow, textAlign: 'center' },
});
