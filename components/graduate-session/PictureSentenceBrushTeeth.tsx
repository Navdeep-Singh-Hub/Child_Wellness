/**
 * Game 1 — Story picture: child brushing teeth. Choose correct sentence.
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

const OPTIONS = ['I brush my teeth', 'I eat a shoe', 'I jump in water'];
const CORRECT = 'I brush my teeth';
const VOICE = 'Look at the picture and choose the correct sentence.';

const PALETTE = { accent: '#F59E0B', glow: '#FDE68A', secondary: '#FBBF24' } as const;

function SentenceChip({
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
        <Text style={styles.chipText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PictureSentenceBrushTeeth({ onComplete }: { onComplete: () => void }) {
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
    (sentence: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(sentence);

      if (sentence === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! I brush my teeth!', 0.7);
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
        subtitle="You chose the right sentence!"
        badgeEmoji="📖"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="PICTURE SENTENCE · GAME 1"
      title="Choose the correct sentence"
      instruction="Look at the picture and choose the correct sentence."
      mascot="📖"
      coachLine="Look at the toothbrush — which sentence matches the morning picture?"
      onReplayVoice={playVoice}
    >
      <View style={styles.storyFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.storyGlow}
        />
        <Text style={styles.frameLabel}>STORY PICTURE</Text>

        <View style={styles.pictureScene}>
          <View style={styles.morningBadge}>
            <Text style={styles.morningText}>MORNING</Text>
          </View>
          <Text style={styles.pictureEmoji}>🪥</Text>
          <Text style={styles.pictureCaption}>A child brushing teeth in the morning</Text>
        </View>

        <Text style={styles.prompt}>What is happening?</Text>

        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <SentenceChip
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
    backgroundColor: 'rgba(245,158,11,0.18)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  morningBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderWidth: 1,
    borderColor: `${PALETTE.secondary}88`,
    marginBottom: 10,
  },
  morningText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
  },
  pictureEmoji: { fontSize: 56, marginBottom: 8 },
  pictureCaption: {
    fontSize: 15,
    fontWeight: '700',
    color: GR.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  prompt: {
    fontSize: 17,
    fontWeight: '900',
    color: GR.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  optionsColumn: { width: '100%', gap: 10 },
  chipWrap: { width: '100%' },
  chip: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  chipText: { fontSize: 16, fontWeight: '800', color: GR.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
