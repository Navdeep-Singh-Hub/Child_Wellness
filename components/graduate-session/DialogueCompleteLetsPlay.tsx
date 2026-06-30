/**
 * Game 2 — Finish the dialogue. Friend: Let's play. You: ______. Options: Yes, Sleep, Run away. Correct: Yes.
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

const DIALOGUE = "Let's play";
const OPTIONS = ['Yes', 'Sleep', 'Run away'];
const CORRECT = 'Yes';
const VOICE = 'Choose the best reply.';

const PALETTE = { accent: '#F59E0B', glow: '#FDE68A', secondary: '#FBBF24' } as const;

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

export function DialogueCompleteLetsPlay({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! Yes!', 0.7);
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
        subtitle="You chose the best reply!"
        badgeEmoji="💬"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="DIALOGUE COMPLETE · GAME 2"
      title="Choose the correct reply"
      instruction="Choose the best reply."
      mascot="💬"
      coachLine={'When a friend says "Let\'s play," saying Yes is a friendly answer!'}
      onReplayVoice={playVoice}
    >
      <View style={styles.dialogueFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.dialogueGlow}
        />
        <Text style={styles.frameLabel}>PLAYTIME SCENE</Text>

        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, styles.friendBubble]}>
            <Text style={styles.roleLabel}>FRIEND</Text>
            <Text style={styles.bubbleText}>{DIALOGUE}</Text>
          </View>
        </View>

        <View style={[styles.bubbleRow, styles.youRow]}>
          <View style={[styles.bubble, styles.youBubble]}>
            <Text style={styles.roleLabel}>YOU</Text>
            <Text style={[styles.bubbleText, styles.blankLine]}>______</Text>
          </View>
        </View>

        <Text style={styles.prompt}>What should you say?</Text>

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
  dialogueFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  dialogueGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 14,
    textAlign: 'center',
  },
  bubbleRow: { marginBottom: 10 },
  youRow: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  friendBubble: {
    alignSelf: 'flex-start',
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(245,158,11,0.22)',
  },
  youBubble: {
    alignSelf: 'flex-end',
    borderColor: `${PALETTE.secondary}88`,
    backgroundColor: 'rgba(251,191,36,0.2)',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  bubbleText: { fontSize: 20, fontWeight: '800', color: GR.textLight },
  blankLine: { color: PALETTE.glow, letterSpacing: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: GR.textLight,
    marginTop: 8,
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
