/**
 * Game 4 — Parking Pay: Parking fee = ₹10. Choose coin to pay ₹10. Correct: ₹10.
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

const FEE = '₹10';
const COIN_OPTIONS = ['₹1', '₹2', '₹5', '₹10'] as const;
type CoinOption = (typeof COIN_OPTIONS)[number];
const CORRECT: CoinOption = '₹10';
const VOICE = 'Choose coins to pay ten rupees.';

const COIN_SIZE: Record<CoinOption, number> = {
  '₹1': 72,
  '₹2': 78,
  '₹5': 84,
  '₹10': 90,
};

const ROAD = { accent: '#EF4444', glow: '#FCA5A5', amber: '#F59E0B', coinGlow: '#FCD34D' } as const;

function PayCoin({
  value,
  selected,
  feedback,
  onPress,
}: {
  value: CoinOption;
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const size = COIN_SIZE[value];

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
          ? ROAD.coinGlow
          : `${ROAD.amber}88`;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.coin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: border,
          },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={value}
      >
        <LinearGradient
          colors={[`${ROAD.coinGlow}55`, `${ROAD.amber}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: size / 2 }]}
        />
        <Text style={styles.coinText}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ParkingPayment({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<CoinOption | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (coin: CoinOption) => {
      if (feedback === 'correct') return;
      setSelected(coin);
      setAttempts((a) => a + 1);

      if (coin === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! You paid the fee!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. The parking fee is ten rupees.', 0.7);
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
      ? 'The parking booth shows ₹10 — which coin pays the full fee?'
      : 'Pick the coin that equals ten rupees!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Parking Pay!"
        subtitle="You paid ₹10!"
        badgeEmoji="🅿️"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="PARKING PAY · GAME 4"
      title="Pay the parking fee"
      instruction="Choose the coin to pay ₹10."
      mascot="🅿️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.boothFrame}>
        <LinearGradient
          colors={[`${ROAD.accent}33`, 'transparent', `${ROAD.amber}22`]}
          style={styles.boothGlow}
        />
        <Text style={styles.boothLabel}>PARKING BOOTH</Text>

        <View style={styles.feeCard}>
          <Text style={styles.feeIcon}>🅿️</Text>
          <Text style={styles.feeTitle}>Parking fee</Text>
          <View style={styles.feeTag}>
            <Text style={styles.feeLabel}>AMOUNT DUE</Text>
            <Text style={styles.feeAmount}>{FEE}</Text>
          </View>
        </View>

        <Text style={styles.prompt}>Which coin do you need?</Text>

        <View style={styles.coinsRow}>
          {COIN_OPTIONS.map((coin) => (
            <PayCoin
              key={coin}
              value={coin}
              selected={selected === coin}
              feedback={feedback}
              onPress={() => handleChoice(coin)}
            />
          ))}
        </View>

        <Text style={styles.hint}>🅿️ fee is ₹10 — pay with the right coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  boothFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${ROAD.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  boothGlow: { ...StyleSheet.absoluteFillObject },
  boothLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: ROAD.glow,
    marginBottom: 14,
  },
  feeCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${ROAD.accent}66`,
    backgroundColor: 'rgba(11,10,26,0.65)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 160,
  },
  feeIcon: { fontSize: 40, marginBottom: 6 },
  feeTitle: { fontSize: 20, fontWeight: '900', color: CZ.textLight, marginBottom: 10 },
  feeTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1.5,
    borderColor: `${ROAD.amber}55`,
    alignItems: 'center',
  },
  feeLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: ROAD.coinGlow },
  feeAmount: { fontSize: 28, fontWeight: '900', color: ROAD.coinGlow },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  coin: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinText: { fontSize: 20, fontWeight: '900', color: CZ.textLight },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: ROAD.glow,
    textAlign: 'center',
  },
});
