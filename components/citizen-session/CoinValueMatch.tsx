/**
 * Game 3 — Value Spotter: Match coin with value. ₹5 → five rupees, ₹10 → ten rupees.
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

const COIN_STYLE: Record<string, { size: number; glow: string }> = {
  '₹5': { size: 96, glow: '#FCD34D' },
  '₹10': { size: 104, glow: '#FDE68A' },
};

const QUESTIONS: {
  coin: string;
  correctLabel: string;
  options: string[];
  voice: string;
}[] = [
  {
    coin: '₹5',
    correctLabel: 'five rupees',
    options: ['five rupees', 'ten rupees', 'fifteen rupees'],
    voice: 'What is 5 rupees? Tap five rupees.',
  },
  {
    coin: '₹10',
    correctLabel: 'ten rupees',
    options: ['five rupees', 'ten rupees', 'fifteen rupees'],
    voice: 'What is 10 rupees? Tap ten rupees.',
  },
];

const PLAZA = { accent: '#38BDF8', glow: '#BAE6FD', amber: '#F59E0B', coinGlow: '#FCD34D' } as const;

function ValueChip({
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
          ? PLAZA.coinGlow
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

export function CoinValueMatch({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const q = QUESTIONS[questionIndex];
  const coinStyle = COIN_STYLE[q.coin];
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
    (label: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(label);

      if (label === q.correctLabel) {
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
    [lock, feedback, q.correctLabel, isLast, onComplete],
  );

  const coachLine =
    q.coin === '₹5'
      ? '₹5 is worth five rupees — which words match?'
      : '₹10 is a bigger coin — find the ten rupees label!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Value Spotter!"
        subtitle="You know the coin values!"
        badgeEmoji="🪙"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="VALUE SPOTTER · GAME 3"
      title="Match coin with value"
      instruction="Tap the words that match the coin."
      mascot="🪙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>VALUE ROUNDS</Text>
          <Text style={styles.progressCount}>
            {questionIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PLAZA.accent, PLAZA.amber]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.exchangeFrame}>
        <LinearGradient
          colors={[`${PLAZA.amber}33`, 'transparent', `${PLAZA.accent}22`]}
          style={styles.exchangeGlow}
        />
        <Text style={styles.exchangeLabel}>COIN EXCHANGE</Text>

        <View
          style={[
            styles.coinOrb,
            {
              width: coinStyle.size,
              height: coinStyle.size,
              borderRadius: coinStyle.size / 2,
              borderColor: coinStyle.glow,
            },
          ]}
        >
          <LinearGradient
            colors={[`${PLAZA.coinGlow}55`, `${PLAZA.amber}44`, 'rgba(11,10,26,0.6)']}
            style={[styles.coinGrad, { borderRadius: coinStyle.size / 2 }]}
          />
          <Text style={styles.coinValue}>{q.coin}</Text>
        </View>

        <Text style={styles.prompt}>How much is it?</Text>

        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <ValueChip
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
    color: PLAZA.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CZ.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  exchangeFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PLAZA.amber}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  exchangeGlow: { ...StyleSheet.absoluteFillObject },
  exchangeLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PLAZA.coinGlow,
    marginBottom: 14,
  },
  coinOrb: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinValue: { fontSize: 30, fontWeight: '900', color: CZ.textLight },
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
  chipText: { fontSize: 16, fontWeight: '800', color: CZ.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
