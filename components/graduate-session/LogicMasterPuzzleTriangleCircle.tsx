/**
 * Game 4 — Logic Master Puzzle. Pattern 🔺 🔵 🔺 🔵 🔺 __. Options 🔺, 🔵, 🟩. Correct: 🔵.
 * Session 10: Graduate Master Challenge (finale).
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
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

const PATTERN = ['🔺', '🔵', '🔺', '🔵', '🔺'];
const OPTIONS = ['🔺', '🔵', '🟩'];
const CORRECT = '🔵';
const VOICE = 'Choose the shape that completes the pattern.';

const PALETTE = { accent: '#4F46E5', glow: '#FCD34D', secondary: '#818CF8' } as const;

function ShapeChip({
  emoji,
  selected,
  feedback,
  onPress,
}: {
  emoji: string;
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
      ? GR.good
      : feedback === 'wrong' && selected
        ? GR.warn
        : selected
          ? PALETTE.glow
          : GR.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.shapeChip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={emoji}
      >
        <Text style={styles.shapeEmoji}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function LogicMasterPuzzleTriangleCircle({ onComplete }: { onComplete: () => void }) {
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

  const handleChoice = useCallback(
    (emoji: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(emoji);

      if (emoji === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Circle!', 0.7);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again.', 0.65);
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
        badgeEmoji="🔢"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="LOGIC MASTER · FINALE GAME 4"
      title="Complete the logic pattern"
      instruction="Choose the shape that completes the pattern."
      mascot="🔢"
      coachLine="Triangle, circle, triangle, circle — what shape comes after the last triangle?"
      onReplayVoice={playVoice}
    >
      <View style={styles.patternFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.patternGlow}
        />
        <Text style={styles.frameLabel}>SHAPE PATTERN STRIP</Text>

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>🔺</Text>
          <Text style={styles.ruleArrow}>↔</Text>
          <Text style={styles.ruleEmoji}>🔵</Text>
          <Text style={styles.ruleText}>Repeats back and forth</Text>
        </View>

        <View style={styles.patternRow}>
          {PATTERN.map((emoji, i) => (
            <View key={i} style={styles.patternCell}>
              <Text style={styles.slotLabel}>{i + 1}</Text>
              <Text style={styles.patternEmoji}>{emoji}</Text>
            </View>
          ))}
          <View style={[styles.patternCell, styles.blankCell]}>
            <Text style={styles.slotLabel}>?</Text>
            <Text style={styles.blankText}>__</Text>
          </View>
        </View>

        <Text style={styles.prompt}>What comes next?</Text>

        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <ShapeChip
              key={opt}
              emoji={opt}
              selected={selected === opt}
              feedback={feedback}
              onPress={() => handleChoice(opt)}
            />
          ))}
        </View>
      </View>
    </GraduateGameShell>
  );
}

const styles = StyleSheet.create({
  patternFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
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
    gap: 6,
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(79,70,229,0.15)',
  },
  ruleEmoji: { fontSize: 20 },
  ruleArrow: { fontSize: 16, fontWeight: '900', color: PALETTE.glow },
  ruleText: { fontSize: 13, fontWeight: '700', color: GR.textLight },
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
    backgroundColor: 'rgba(79,70,229,0.22)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 48,
  },
  blankCell: {
    borderColor: GR.amberGlow,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  patternEmoji: { fontSize: 28 },
  blankText: { fontSize: 22, fontWeight: '900', color: GR.amberGlow },
  prompt: {
    fontSize: 18,
    fontWeight: '900',
    color: GR.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
  },
  shapeChip: {
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  shapeEmoji: { fontSize: 42 },
  pressed: { opacity: 0.88 },
});
