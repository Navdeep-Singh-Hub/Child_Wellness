/**
 * Game 2 — Choose the correct reply. "How are you?" → I am fine, Banana, Good night. Correct: I am fine.
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

const PROMPT = 'How are you?';
const OPTIONS = ['I am fine', 'Banana', 'Good night'];
const CORRECT = 'I am fine';
const VOICE = 'How are you? Pick the correct answer.';

const PALETTE = { accent: '#6366F1', glow: '#A5B4FC', secondary: '#8B5CF6' } as const;

function ReplyChip({
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

export function ReplyChoice({ onComplete }: { onComplete: () => void }) {
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
    (reply: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(reply);

      if (reply === CORRECT) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! I am fine!', 0.7);
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
        subtitle="You picked the right reply!"
        badgeEmoji="💬"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="REPLY CHOICE · GAME 2"
      title="Pick the correct answer"
      instruction="How are you? Choose the right reply."
      mascot="💬"
      coachLine="When someone asks how you are, answer about yourself — like I am fine!"
      onReplayVoice={playVoice}
    >
      <View style={styles.promptFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.promptGlow}
        />
        <Text style={styles.frameLabel}>QUESTION</Text>

        <View style={styles.askRow}>
          <View style={styles.avatarBubble}>
            <Text style={styles.avatarEmoji}>👋</Text>
          </View>
          <View style={styles.questionBubble}>
            <Text style={styles.roleLabel}>FRIEND</Text>
            <Text style={styles.questionText}>"{PROMPT}"</Text>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>YOUR REPLY</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <ReplyChip
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
  promptFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  promptGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 14,
    textAlign: 'center',
  },
  askRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 16,
  },
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  questionBubble: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(99,102,241,0.22)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  questionText: { fontSize: 20, fontWeight: '800', color: GR.textLight },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: `${PALETTE.glow}44` },
  dividerLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
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
  chipText: { fontSize: 17, fontWeight: '800', color: GR.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
