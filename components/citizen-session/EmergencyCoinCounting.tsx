/**
 * Game 3 — Coin Counter: ₹2 + ₹2 + ₹5 = ? Options ₹7, ₹9, ₹10. Correct: ₹9.
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

const COINS_DISPLAY = ['₹2', '₹2', '₹5'] as const;
const CORRECT_TOTAL = '₹9';
const OPTIONS = ['₹7', '₹9', '₹10'] as const;
const VOICE = 'Count the coins and choose the correct total.';

const EMERGENCY = { accent: '#DC2626', glow: '#FCA5A5', amber: '#F59E0B', coinGlow: '#FCD34D' } as const;

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
          ? EMERGENCY.coinGlow
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

export function EmergencyCoinCounting({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! Nine rupees!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Two plus two plus five is nine.', 0.7);
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
      ? 'Add them up: ₹2 + ₹2 + ₹5 — what is the total?'
      : 'Count each coin, then pick the total amount!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Coin Counter!"
        subtitle="You counted ₹9!"
        badgeEmoji="🪙"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="COIN COUNTER · GAME 3"
      title="Count the coins"
      instruction="Count the coins and choose the correct total."
      mascot="🪙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.tallyFrame}>
        <LinearGradient
          colors={[`${EMERGENCY.accent}33`, 'transparent', `${EMERGENCY.amber}22`]}
          style={styles.tallyGlow}
        />
        <Text style={styles.tallyLabel}>EMERGENCY KIT FUND</Text>

        <View style={styles.coinsRow}>
          {COINS_DISPLAY.map((v, i) => (
            <View key={i} style={styles.coinOrb}>
              <LinearGradient
                colors={[`${EMERGENCY.coinGlow}55`, `${EMERGENCY.amber}44`]}
                style={styles.coinGrad}
              />
              <Text style={styles.coinText}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.equationRow}>
          <Text style={styles.equation}>₹2 + ₹2 + ₹5 = ?</Text>
        </View>

        <Text style={styles.prompt}>How much in total?</Text>

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
  tallyFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${EMERGENCY.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tallyGlow: { ...StyleSheet.absoluteFillObject },
  tallyLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: EMERGENCY.glow,
    marginBottom: 14,
  },
  coinsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  coinOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: `${EMERGENCY.coinGlow}88`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinText: { fontSize: 20, fontWeight: '900', color: CZ.textLight },
  equationRow: {
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.12)',
    borderWidth: 1,
    borderColor: `${EMERGENCY.accent}44`,
  },
  equation: { fontSize: 16, fontWeight: '800', color: EMERGENCY.glow },
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
