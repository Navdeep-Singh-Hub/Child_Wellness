/**
 * Game 1 — Greeting choice. When you meet someone in the morning, what do you say? Correct: Good morning.
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

const OPTIONS = ['Good morning', 'Good night'];
const CORRECT = 'Good morning';
const VOICE = 'When you meet someone in the morning, what do you say?';

const PALETTE = { accent: '#10B981', glow: '#6EE7B7', secondary: '#34D399' } as const;

const GREETING_EMOJI: Record<string, string> = {
  'Good morning': '☀️',
  'Good night': '🌙',
};

function GreetingChip({
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
        <Text style={styles.chipEmoji}>{GREETING_EMOJI[label] ?? '👋'}</Text>
        <Text style={styles.chipText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function GreetingChoice({ onComplete }: { onComplete: () => void }) {
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
    (greeting: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(greeting);

      if (greeting === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Good morning!', 0.7);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. In the morning we say Good morning.', 0.65);
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
        subtitle="You chose the right greeting!"
        badgeEmoji="👋"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="GREETING CHOICE · GAME 1"
      title="Choose the correct greeting"
      instruction="When you meet someone in the morning, what do you say?"
      mascot="👋"
      coachLine="In the morning, the sun is up — say Good morning!"
      onReplayVoice={playVoice}
    >
      <View style={styles.greetingFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.greetingGlow}
        />
        <Text style={styles.frameLabel}>MORNING MEETING</Text>

        <View style={styles.sceneRow}>
          <Text style={styles.sunEmoji}>☀️</Text>
          <View style={styles.meetingBubble}>
            <Text style={styles.roleLabel}>SITUATION</Text>
            <Text style={styles.sceneText}>You meet a friend in the morning</Text>
          </View>
        </View>

        <Text style={styles.prompt}>What do you say?</Text>

        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <GreetingChip
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
  greetingFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  greetingGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 14,
    textAlign: 'center',
  },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  sunEmoji: { fontSize: 36 },
  meetingBubble: { flex: 1 },
  roleLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  sceneText: { fontSize: 16, fontWeight: '800', color: GR.textLight, lineHeight: 22 },
  prompt: {
    fontSize: 17,
    fontWeight: '900',
    color: GR.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  optionsColumn: { width: '100%', gap: 12 },
  chipWrap: { width: '100%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  chipEmoji: { fontSize: 26 },
  chipText: { fontSize: 17, fontWeight: '800', color: GR.textLight, flex: 1 },
  pressed: { opacity: 0.88 },
});
