/**
 * Game 4 — Juice Bar: Juice costs ₹10; choose the correct coin (₹10).
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

const ITEM = 'Juice';
const ITEM_EMOJI = '🧃';
const PRICE = '₹10';
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

const DINING = { accent: '#F59E0B', glow: '#FDE68A', coinGlow: '#FCD34D', rose: '#EC4899' } as const;

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
          ? DINING.coinGlow
          : `${DINING.accent}88`;

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
          colors={[`${DINING.coinGlow}55`, `${DINING.accent}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: size / 2 }]}
        />
        <Text style={styles.coinText}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PayJuiceGame({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! You paid for the juice!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. The juice costs ten rupees.', 0.7);
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
      ? 'The juice menu says ₹10 — which coin matches the price?'
      : 'Pick the coin that equals ten rupees!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Juice Bar!"
        subtitle="You paid for the juice!"
        badgeEmoji="🧃"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="JUICE BAR · GAME 4"
      title="Pay for the juice"
      instruction="Choose the coin to pay ₹10."
      mascot="🧃"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.barFrame}>
        <LinearGradient
          colors={[`${DINING.accent}33`, 'transparent', `${DINING.rose}22`]}
          style={styles.barGlow}
        />
        <Text style={styles.barLabel}>RESTAURANT JUICE BAR</Text>

        <View style={styles.itemCard}>
          <Text style={styles.itemEmoji}>{ITEM_EMOJI}</Text>
          <Text style={styles.itemName}>{ITEM}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceLabel}>PRICE</Text>
            <Text style={styles.priceValue}>{PRICE}</Text>
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

        <Text style={styles.hint}>🧃 costs ₹10 — pay with the right coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  barFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${DINING.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  barGlow: { ...StyleSheet.absoluteFillObject },
  barLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DINING.glow,
    marginBottom: 14,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${DINING.rose}66`,
    backgroundColor: 'rgba(11,10,26,0.65)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 160,
  },
  itemEmoji: { fontSize: 48, marginBottom: 6 },
  itemName: { fontSize: 22, fontWeight: '900', color: CZ.textLight, marginBottom: 10 },
  priceTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1.5,
    borderColor: `${DINING.accent}55`,
    alignItems: 'center',
  },
  priceLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: DINING.coinGlow },
  priceValue: { fontSize: 24, fontWeight: '900', color: DINING.coinGlow },
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
    color: DINING.glow,
    textAlign: 'center',
  },
});
