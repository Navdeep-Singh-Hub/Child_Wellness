/**
 * Level 9 (Clockwise) — Session 6, Game 1: Visual Puzzle
 * 2×3 grid: row1 circle, square, triangle; row2 circle, ?, triangle. Answer: square.
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
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

const GRID_TOP = ['⭕', '⬜', '🔺'] as const;
const GRID_BOTTOM_LEFT = '⭕';
const GRID_BOTTOM_RIGHT = '🔺';

const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
] as const;

type ShapeId = (typeof OPTIONS)[number]['id'];
const CORRECT_ID: ShapeId = 'square';

const VOICE =
  'Complete the picture. One piece is missing. Which piece fits in the empty space?';
const PALETTE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

function PuzzleGrid() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 750 }), withTiming(0, { duration: 750 })),
      -1,
      true,
    );
  }, [pulse]);

  const voidAnim = useAnimatedStyle(() => ({
    borderColor: `rgba(16,185,129,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  return (
    <View style={grid.wrap}>
      <Text style={grid.label}>FRAGMENT SCAN</Text>
      <View style={grid.frame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.mint}22`]}
          style={grid.glow}
        />
        <View style={grid.row}>
          {GRID_TOP.map((emoji, i) => (
            <View key={i} style={grid.cell}>
              <Text style={grid.emoji}>{emoji}</Text>
            </View>
          ))}
        </View>
        <View style={grid.row}>
          <View style={grid.cell}>
            <Text style={grid.emoji}>{GRID_BOTTOM_LEFT}</Text>
          </View>
          <Animated.View style={[grid.missing, voidAnim]}>
            <Text style={grid.q}>?</Text>
            <Text style={grid.missingLbl}>GAP</Text>
          </Animated.View>
          <View style={grid.cell}>
            <Text style={grid.emoji}>{GRID_BOTTOM_RIGHT}</Text>
          </View>
        </View>
        <Text style={grid.hint}>Look at the pattern — what shape belongs in the gap?</Text>
      </View>
    </View>
  );
}

function PieceOrb({
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
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}44`, 'rgba(8,12,40,0.55)']}
          style={styles.orbGrad}
        />
        <Text style={styles.orbEmoji}>{option.emoji}</Text>
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface VisualPuzzleComplexLevel9Session6GameProps {
  onComplete: () => void;
}

export function VisualPuzzleComplexLevel9Session6Game({
  onComplete,
}: VisualPuzzleComplexLevel9Session6GameProps) {
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
        speak('Correct! The square completes the picture!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'circle'
            ? 'A circle is round — look at the straight edges in the grid!'
            : 'A triangle has three corners — the gap needs four equal sides!',
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
      ? 'Each row and column follows a pattern — what shape fills the gap?'
      : 'The top row has a square in the middle — what matches below?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Fragment Forge!"
        subtitle="The square completes the picture!"
        badgeEmoji="🧩"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="FRAGMENT FORGE · GAME 1"
      title="Complete the picture"
      instruction="One piece is missing from the grid. Tap the shape that fits."
      mascot="🧩"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <PuzzleGrid />

      <Text style={styles.prompt}>Tap the piece that completes it</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((opt) => (
          <PieceOrb
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>⭕ ⬜ 🔺 on top · ⭕ ? 🔺 on bottom — find the match</Text>
      </View>
    </ClockwiseGameShell>
  );
}

const grid = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 18 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: PALETTE.glow, marginBottom: 10 },
  frame: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.55)',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: { ...StyleSheet.absoluteFillObject },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cell: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: `${PALETTE.glow}88`,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  missing: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(16,185,129,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  q: { fontSize: 26, fontWeight: '900', color: PALETTE.glow },
  missingLbl: { fontSize: 7, fontWeight: '900', color: CW.textMuted, letterSpacing: 0.8, marginTop: 2 },
  hint: { fontSize: 12, fontWeight: '700', color: CW.textMuted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
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
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbGrad: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 36, marginBottom: 4 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: CW.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});
