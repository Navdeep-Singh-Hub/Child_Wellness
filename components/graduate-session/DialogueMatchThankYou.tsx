/**
 * Game 2 — Match the polite response. Thank you → ______. Options: Welcome, Jump, Sleep. Correct: Welcome.
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

const PROMPT = 'Thank you';
const OPTIONS = ['Welcome', 'Jump', 'Sleep'];
const CORRECT = 'Welcome';
const VOICE = 'Choose the correct response.';

const PALETTE = { accent: '#10B981', glow: '#6EE7B7', secondary: '#34D399' } as const;

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

export function DialogueMatchThankYou({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! Welcome!', 0.7);
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
        subtitle="You matched the polite response!"
        badgeEmoji="💬"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="DIALOGUE MATCH · GAME 2"
      title="Match the polite response"
      instruction="Choose the correct response."
      mascot="💬"
      coachLine='When someone says "Thank you," a polite reply is Welcome!'
      onReplayVoice={playVoice}
    >
      <View style={styles.matchFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.matchGlow}
        />
        <Text style={styles.frameLabel}>POLITE PAIR</Text>

        <View style={styles.pairRow}>
          <View style={styles.promptBubble}>
            <Text style={styles.roleLabel}>THEY SAY</Text>
            <Text style={styles.promptText}>{PROMPT}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.blankBubble}>
            <Text style={styles.roleLabel}>YOU SAY</Text>
            <Text style={styles.blankText}>______</Text>
          </View>
        </View>

        <Text style={styles.question}>What is the correct reply?</Text>

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
  matchFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  matchGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 14,
    textAlign: 'center',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  promptBubble: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(16,185,129,0.22)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 110,
    alignItems: 'center',
  },
  blankBubble: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${PALETTE.secondary}88`,
    backgroundColor: 'rgba(52,211,153,0.18)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 110,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  promptText: { fontSize: 18, fontWeight: '800', color: GR.textLight },
  blankText: { fontSize: 18, fontWeight: '900', color: PALETTE.glow, letterSpacing: 2 },
  arrow: { fontSize: 24, fontWeight: '900', color: PALETTE.glow },
  question: {
    fontSize: 17,
    fontWeight: '800',
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
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipText: { fontSize: 17, fontWeight: '800', color: GR.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
