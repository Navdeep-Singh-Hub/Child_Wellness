/**
 * Game 2 — Place Match: 🚍→bus stop, 🏥→hospital, 🚔→police.
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

const ICON_STYLE: Record<string, { color: string; glow: string; label: string }> = {
  '🚍': { color: '#166534', glow: '#86EFAC', label: 'BUS' },
  '🏥': { color: '#991B1B', glow: '#FCA5A5', label: 'CARE' },
  '🚔': { color: '#1E40AF', glow: '#93C5FD', label: 'POLICE' },
};

const QUESTIONS: {
  icon: string;
  correctPlace: string;
  options: string[];
  voice: string;
}[] = [
  {
    icon: '🚍',
    correctPlace: 'bus stop',
    options: ['hospital', 'police', 'bus stop'],
    voice: 'What place is this? Tap bus stop.',
  },
  {
    icon: '🏥',
    correctPlace: 'hospital',
    options: ['hospital', 'police', 'bus stop'],
    voice: 'What place is this? Tap hospital.',
  },
  {
    icon: '🚔',
    correctPlace: 'police',
    options: ['hospital', 'police', 'bus stop'],
    voice: 'What place is this? Tap police.',
  },
];

const COMMUNITY = { accent: '#10B981', glow: '#6EE7B7', violet: '#8B5CF6' } as const;

function PlaceChip({
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
          ? COMMUNITY.glow
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

export function CommunitySignMeaningMatch({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const q = QUESTIONS[questionIndex];
  const iconStyle = ICON_STYLE[q.icon];
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
    (place: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(place);

      if (place === q.correctPlace) {
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
    [lock, feedback, q.correctPlace, isLast, onComplete],
  );

  const coachLine =
    q.icon === '🚍'
      ? 'Bus icon means bus stop — which place matches?'
      : q.icon === '🏥'
        ? 'Hospital cross means medical care — find hospital!'
        : 'Police car means officers help here — pick police!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Place Match!"
        subtitle="You know the community places!"
        badgeEmoji="📋"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="PLACE MATCH · GAME 2"
      title="Match sign to place"
      instruction="Which place does this sign show? Tap the correct word."
      mascot="🚍"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>ICON ROUNDS</Text>
          <Text style={styles.progressCount}>
            {questionIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[COMMUNITY.accent, COMMUNITY.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.matchFrame}>
        <LinearGradient
          colors={[`${iconStyle.color}33`, 'transparent', `${COMMUNITY.violet}22`]}
          style={styles.matchGlow}
        />
        <Text style={styles.matchLabel}>ACTIVE ICON</Text>
        <View style={[styles.iconBadge, { borderColor: iconStyle.glow }]}>
          <Text style={styles.iconEmoji}>{q.icon}</Text>
          <Text style={[styles.iconTag, { color: iconStyle.color }]}>{iconStyle.label}</Text>
        </View>
        <Text style={styles.prompt}>Which place is it?</Text>

        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <PlaceChip
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
    color: COMMUNITY.glow,
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
    borderColor: `${COMMUNITY.accent}55`,
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
    color: COMMUNITY.glow,
    marginBottom: 12,
  },
  iconBadge: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.65)',
    marginBottom: 14,
    gap: 6,
  },
  iconEmoji: { fontSize: 48 },
  iconTag: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
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
