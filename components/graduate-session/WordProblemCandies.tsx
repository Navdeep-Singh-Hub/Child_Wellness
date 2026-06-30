/**
 * Game 3 — Word problem. 5 candies, eat 2. How many left? Options 2, 3, 4. Correct: 3.
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

const OPTIONS = ['2', '3', '4'];
const CORRECT = '3';
const VOICE = 'Read the story and choose the correct number.';

const PALETTE = { accent: '#0EA5E9', glow: '#7DD3FC', secondary: '#38BDF8' } as const;

function NumberChip({
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
        style={({ pressed }) => [styles.numberChip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={label}
      >
        <Text style={styles.numberText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function WordProblemCandies({ onComplete }: { onComplete: () => void }) {
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
    (num: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(num);

      if (num === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Three candies left!', 0.7);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Five minus two is three.', 0.65);
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
        subtitle="You solved the problem!"
        badgeEmoji="🍬"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="STORY PROBLEM · GAME 3"
      title="Solve the story problem"
      instruction="Read the story and choose the correct number."
      mascot="🍬"
      coachLine="Start with five candies, eat two — how many are left?"
      onReplayVoice={playVoice}
    >
      <View style={styles.storyFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.storyGlow}
        />
        <Text style={styles.frameLabel}>STORY CARD</Text>

        <Text style={styles.storyLine}>
          You have <Text style={styles.highlight}>5 candies</Text>.
        </Text>
        <Text style={styles.storyLine}>
          You eat <Text style={styles.highlight}>2 candies</Text>.
        </Text>

        <View style={styles.visualRow}>
          <View style={styles.candyGroup}>
            {Array.from({ length: 5 }, (_, i) => (
              <Text key={i} style={styles.candyEmoji}>
                🍬
              </Text>
            ))}
          </View>
          <Text style={styles.minusSign}>−</Text>
          <View style={styles.candyGroup}>
            <Text style={styles.candyEmoji}>🍬</Text>
            <Text style={styles.candyEmoji}>🍬</Text>
          </View>
          <Text style={styles.equalsSign}>=</Text>
          <Text style={styles.questionMark}>?</Text>
        </View>

        <Text style={styles.question}>How many candies are left?</Text>

        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <NumberChip
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
    alignItems: 'center',
  },
  storyGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 12,
    textAlign: 'center',
  },
  storyLine: {
    fontSize: 17,
    fontWeight: '600',
    color: GR.textLight,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  highlight: { fontWeight: '900', color: PALETTE.glow },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(11,10,26,0.55)',
    width: '100%',
  },
  candyGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 120 },
  candyEmoji: { fontSize: 20 },
  minusSign: { fontSize: 22, fontWeight: '900', color: GR.warn },
  equalsSign: { fontSize: 22, fontWeight: '900', color: PALETTE.glow },
  questionMark: { fontSize: 28, fontWeight: '900', color: GR.amberGlow },
  question: {
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
    gap: 12,
    width: '100%',
  },
  numberChip: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 18,
    paddingHorizontal: 28,
    minWidth: 72,
    alignItems: 'center',
  },
  numberText: { fontSize: 26, fontWeight: '900', color: GR.textLight },
  pressed: { opacity: 0.88 },
});
