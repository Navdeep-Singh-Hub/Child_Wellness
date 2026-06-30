/**
 * Game 2 — Meaning Match: MENU→list of food, ORDER→ask for food, PAY→give money.
 */
import { CitizenGameShell } from '@/components/citizen-session/shared/CitizenGameShell';
import { CZ } from '@/components/citizen-session/shared/citizenTheme';
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

const SIGN_STYLE: Record<string, { color: string; glow: string; emoji: string }> = {
  MENU: { color: '#1E40AF', glow: '#93C5FD', emoji: '🍽️' },
  ORDER: { color: '#166534', glow: '#86EFAC', emoji: '📝' },
  PAY: { color: '#831843', glow: '#F9A8D4', emoji: '💳' },
};

const QUESTIONS: {
  sign: string;
  correctMeaning: string;
  options: string[];
  voice: string;
}[] = [
  {
    sign: 'MENU',
    correctMeaning: 'list of food',
    options: ['list of food', 'ask for food', 'give money'],
    voice: 'What does MENU mean? Tap list of food.',
  },
  {
    sign: 'ORDER',
    correctMeaning: 'ask for food',
    options: ['list of food', 'ask for food', 'give money'],
    voice: 'What does ORDER mean? Tap ask for food.',
  },
  {
    sign: 'PAY',
    correctMeaning: 'give money',
    options: ['list of food', 'ask for food', 'give money'],
    voice: 'What does PAY mean? Tap give money.',
  },
];

const DINING = { accent: '#F59E0B', glow: '#FDE68A', rose: '#EC4899' } as const;

function MeaningChip({
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
      ? CZ.good
      : feedback === 'wrong' && selected
        ? CZ.warn
        : selected
          ? DINING.glow
          : CZ.glassBorder;

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

export function RestaurantSignMeaningMatch({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const q = QUESTIONS[questionIndex];
  const signStyle = SIGN_STYLE[q.sign];
  const isLast = questionIndex === QUESTIONS.length - 1;
  const progressPct = ((questionIndex + (feedback === 'correct' ? 1 : 0)) / QUESTIONS.length) * 100;

  const playVoice = useCallback(() => {
    speak(q.voice, 0.75).catch(() => {});
  }, [q.voice]);

  useEffect(() => {
    playVoice();
    setSelected(null);
    setFeedback('idle');
    setLock(false);
  }, [questionIndex, playVoice]);

  const handleChoice = useCallback(
    (meaning: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(meaning);

      if (meaning === q.correctMeaning) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct!', 0.7);

        if (isLast) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        } else {
          setTimeout(() => setQuestionIndex((i) => i + 1), 900);
        }
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
    [lock, feedback, q.correctMeaning, isLast, onComplete],
  );

  const coachLine =
    q.sign === 'MENU'
      ? 'MENU shows what food you can pick — tap the matching phrase!'
      : q.sign === 'ORDER'
        ? 'ORDER means telling the waiter what you want — find it!'
        : 'PAY is when you hand over money — which phrase fits?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Meaning Match!"
        subtitle="You know the restaurant signs!"
        badgeEmoji="📋"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="MEANING MATCH · GAME 2"
      title="Match sign to meaning"
      instruction="What does this sign mean? Tap the correct phrase."
      mascot="🍽️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SIGN ROUNDS</Text>
          <Text style={styles.progressCount}>
            {questionIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[DINING.accent, DINING.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.matchFrame}>
        <LinearGradient
          colors={[`${signStyle.color}33`, 'transparent', `${DINING.accent}22`]}
          style={styles.matchGlow}
        />
        <Text style={styles.matchLabel}>ACTIVE SIGN</Text>
        <View style={[styles.signBadge, { borderColor: signStyle.glow }]}>
          <Text style={styles.signEmoji}>{signStyle.emoji}</Text>
          <Text style={[styles.signText, { color: signStyle.color }]}>{q.sign}</Text>
        </View>
        <Text style={styles.prompt}>What does it mean?</Text>

        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <MeaningChip
              key={opt}
              label={opt}
              selected={selected === opt}
              feedback={feedback}
              onPress={() => handleChoice(opt)}
            />
          ))}
        </View>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: DINING.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CZ.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  matchFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${DINING.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  matchGlow: { ...StyleSheet.absoluteFillObject },
  matchLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DINING.glow,
    marginBottom: 12,
  },
  signBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.65)',
    marginBottom: 14,
    maxWidth: '100%',
  },
  signEmoji: { fontSize: 28 },
  signText: { fontSize: 18, fontWeight: '900', letterSpacing: 1, flexShrink: 1 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CZ.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  optionsColumn: { width: '100%', gap: 10 },
  chipWrap: { width: '100%' },
  chip: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipText: { fontSize: 15, fontWeight: '800', color: CZ.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
