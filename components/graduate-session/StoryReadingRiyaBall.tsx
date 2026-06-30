/**
 * Game 1 — Read the story. Riya has a red ball, plays in the park. "What does Riya have?" Options: Ball, Book, Shoes. Correct: Ball. Session 9: Story Problem Solver.
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

const STORY = 'Riya has a red ball. She plays with it in the park.';
const QUESTION = 'What does Riya have?';
const OPTIONS = ['Ball', 'Book', 'Shoes'];
const CORRECT = 'Ball';
const VOICE = 'Read the story and choose the correct answer.';

const PALETTE = { accent: '#EA580C', glow: '#FDBA74', secondary: '#FB923C' } as const;

const OPTION_EMOJI: Record<string, string> = {
  Ball: '⚽',
  Book: '📖',
  Shoes: '👟',
};

function AnswerChip({
  label,
  selected,
  feedback,
  onPress,
}: {
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
      scale.value = withSpring(1.04, { damping: 8 });
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
    <Animated.View style={[styles.chipWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.chip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={label}
      >
        <Text style={styles.chipEmoji}>{OPTION_EMOJI[label] ?? '❓'}</Text>
        <Text style={styles.chipText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function StoryReadingRiyaBall({ onComplete }: { onComplete: () => void }) {
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
    (answer: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(answer);

      if (answer === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Riya has a ball!', 0.7);
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
        subtitle="You understood the story!"
        badgeEmoji="📖"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="STORY READING · GAME 1"
      title="Answer the question"
      instruction="Read the story and choose the correct answer."
      mascot="📖"
      coachLine="Riya is in the park with something red — read carefully!"
      onReplayVoice={playVoice}
    >
      <View style={styles.storyFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.storyGlow}
        />
        <Text style={styles.frameLabel}>STORY CARD</Text>

        <View style={styles.pictureScene}>
          <View style={styles.parkBadge}>
            <Text style={styles.parkText}>PARK STORY</Text>
          </View>
          <Text style={styles.pictureEmoji}>👧🔴⚽🌳</Text>
          <View style={styles.storyPlate}>
            <Text style={styles.storyText}>{STORY}</Text>
          </View>
        </View>

        <View style={styles.questionPlate}>
          <Text style={styles.questionLabel}>QUESTION</Text>
          <Text style={styles.questionText}>{QUESTION}</Text>
        </View>

        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <AnswerChip
              key={opt}
              label={opt}
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
  storyFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  storyGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 14,
    textAlign: 'center',
  },
  pictureScene: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(234,88,12,0.18)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  parkBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,146,60,0.25)',
    borderWidth: 1,
    borderColor: `${PALETTE.secondary}88`,
    marginBottom: 10,
  },
  parkText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
  },
  pictureEmoji: { fontSize: 44, marginBottom: 12 },
  storyPlate: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${PALETTE.glow}44`,
    backgroundColor: 'rgba(15,10,30,0.35)',
  },
  storyText: {
    fontSize: 16,
    fontWeight: '700',
    color: GR.textLight,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  questionPlate: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${PALETTE.accent}66`,
    backgroundColor: 'rgba(234,88,12,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '900',
    color: GR.textLight,
    textAlign: 'center',
  },
  optionsColumn: { width: '100%', gap: 10 },
  chipWrap: { width: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  chipEmoji: { fontSize: 26 },
  chipText: { fontSize: 16, fontWeight: '800', color: GR.textLight, flex: 1 },
  pressed: { opacity: 0.88 },
});
