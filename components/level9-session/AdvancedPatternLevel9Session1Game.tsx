/**
 * Level 9 (Clockwise) — Session 1, Game 1: Advanced Pattern
 * triangle, square, circle, triangle, square, ? → circle
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PATTERN = ['triangle', 'square', 'circle', 'triangle', 'square'] as const;
const OPTIONS = [
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'circle', label: 'Circle', emoji: '⭕' },
] as const;
const CORRECT_ID = 'circle';

const SHAPE_EMOJI: Record<(typeof PATTERN)[number], string> = {
  triangle: '🔺',
  square: '⬜',
  circle: '⭕',
};

const VOICE =
  'Complete the pattern. Triangle, square, circle, triangle, square. What comes next?';

const PALETTE = { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' } as const;

function ShapeChip({
  emoji,
  label,
  selected,
  feedback,
  onPress,
}: {
  emoji: string;
  label: string;
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
        style={({ pressed }) => [styles.shapeChip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={label}
      >
        <Text style={styles.shapeEmoji}>{emoji}</Text>
        <Text style={styles.shapeLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface AdvancedPatternLevel9Session1GameProps {
  onComplete: () => void;
}

export function AdvancedPatternLevel9Session1Game({ onComplete }: AdvancedPatternLevel9Session1GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(id);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Circle comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Triangle, square, circle, then triangle, square.', 0.7);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [lock, feedback, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You completed the pattern!"
        badgeEmoji="🔺"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="ADVANCED PATTERN · GAME 1"
      title="Complete the shape pattern"
      instruction="Triangle, square, circle, triangle, square. What comes next?"
      mascot="🔺"
      coachLine="Three shapes repeat — triangle, square, circle — then start again!"
      onReplayVoice={playVoice}
    >
      <View style={styles.patternFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.patternGlow}
        />
        <Text style={styles.frameLabel}>SHAPE ORBIT STRIP</Text>

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>🔺</Text>
          <Text style={styles.ruleArrow}>→</Text>
          <Text style={styles.ruleEmoji}>⬜</Text>
          <Text style={styles.ruleArrow}>→</Text>
          <Text style={styles.ruleEmoji}>⭕</Text>
          <Text style={styles.ruleText}>Repeats every three</Text>
        </View>

        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <View key={i} style={styles.patternCell}>
              <Text style={styles.slotLabel}>{i + 1}</Text>
              <Text style={styles.patternEmoji}>{SHAPE_EMOJI[id]}</Text>
            </View>
          ))}
          <View style={[styles.patternCell, styles.blankCell]}>
            <Text style={styles.slotLabel}>?</Text>
            <Text style={styles.blankText}>__</Text>
          </View>
        </View>

        <Text style={styles.prompt}>Tap the next shape</Text>

        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <ShapeChip
              key={opt.id}
              emoji={opt.emoji}
              label={opt.label}
              selected={selected === opt.id}
              feedback={feedback}
              onPress={() => handleTap(opt.id)}
            />
          ))}
        </View>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  patternFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  patternGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 12,
    textAlign: 'center',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(99,102,241,0.15)',
    flexWrap: 'wrap',
  },
  ruleEmoji: { fontSize: 18 },
  ruleArrow: { fontSize: 14, fontWeight: '900', color: PALETTE.glow },
  ruleText: { fontSize: 12, fontWeight: '700', color: CW.textLight, marginLeft: 4 },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    width: '100%',
  },
  patternCell: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(99,102,241,0.22)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 48,
  },
  blankCell: {
    borderColor: CW.cyanGlow,
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  patternEmoji: { fontSize: 28 },
  blankText: { fontSize: 22, fontWeight: '900', color: CW.cyanGlow },
  prompt: {
    fontSize: 18,
    fontWeight: '900',
    color: CW.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  shapeChip: {
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(8,12,40,0.7)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 96,
  },
  shapeEmoji: { fontSize: 36 },
  shapeLabel: { fontSize: 12, fontWeight: '800', color: PALETTE.glow, marginTop: 6 },
  pressed: { opacity: 0.88 },
});
