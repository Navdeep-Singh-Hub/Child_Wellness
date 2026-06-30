/**
 * Game 4 — Value Builder: ₹5 + ₹5 = ? Options ₹5, ₹10, ₹15. Correct: ₹10.
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

const COINS_DISPLAY = ['₹5', '₹5'] as const;
const CORRECT_TOTAL = '₹10';
const OPTIONS = ['₹5', '₹10', '₹15'] as const;
const VOICE = 'Five plus five is ten. Tap the correct total.';

const PLAZA = { accent: '#38BDF8', glow: '#BAE6FD', amber: '#F59E0B', coinGlow: '#FCD34D' } as const;

function TotalChip({
  amount,
  selected,
  feedback,
  onPress,
}: {
  amount: string;
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
      ? CZ.good
      : feedback === 'wrong' && selected
        ? CZ.warn
        : selected
          ? PLAZA.coinGlow
          : CZ.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.totalChip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={amount}
      >
        <Text style={styles.totalText}>{amount}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CoinValueBuilder({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (amount: string) => {
      if (feedback === 'correct') return;
      setSelected(amount);
      setAttempts((a) => a + 1);

      if (amount === CORRECT_TOTAL) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Ten rupees!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Five plus five is ten.', 0.7);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'Add the two ₹5 coins together — what is the total?'
      : '₹5 + ₹5 equals ten rupees — pick ₹10!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Value Builder!"
        subtitle="You made ₹10!"
        badgeEmoji="💰"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="VALUE BUILDER · GAME 4"
      title="Make the correct value"
      instruction="₹5 + ₹5 = ? Tap the correct total."
      mascot="💰"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.builderFrame}>
        <LinearGradient
          colors={[`${PLAZA.amber}33`, 'transparent', `${PLAZA.accent}22`]}
          style={styles.builderGlow}
        />
        <Text style={styles.builderLabel}>VALUE BUILDER</Text>

        <View style={styles.coinsRow}>
          {COINS_DISPLAY.map((v, i) => (
            <View key={i} style={styles.coinOrb}>
              <LinearGradient
                colors={[`${PLAZA.coinGlow}55`, `${PLAZA.amber}44`]}
                style={styles.coinGrad}
              />
              <Text style={styles.coinText}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.equationRow}>
          <Text style={styles.equation}>₹5 + ₹5 = ?</Text>
        </View>

        <Text style={styles.prompt}>What is the total?</Text>

        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <TotalChip
              key={opt}
              amount={opt}
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
  builderFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PLAZA.amber}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  builderGlow: { ...StyleSheet.absoluteFillObject },
  builderLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PLAZA.coinGlow,
    marginBottom: 14,
  },
  coinsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  coinOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: `${PLAZA.coinGlow}88`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinText: { fontSize: 22, fontWeight: '900', color: CZ.textLight },
  equationRow: {
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${PLAZA.amber}44`,
  },
  equation: { fontSize: 16, fontWeight: '800', color: PLAZA.coinGlow },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  totalChip: {
    minWidth: 80,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
  },
  totalText: { fontSize: 22, fontWeight: '900', color: CZ.textLight },
  pressed: { opacity: 0.88 },
});
