/**
 * Game 4 — Toy Counter: Toy costs ₹10; choose the correct coin (₹10).
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

const ITEM = 'Toy';
const ITEM_EMOJI = '🧸';
const PRICE = '₹10';
const COIN_OPTIONS = ['₹1', '₹2', '₹5', '₹10'] as const;
type CoinOption = (typeof COIN_OPTIONS)[number];
const CORRECT: CoinOption = '₹10';
const VOICE = 'Choose the coin that pays for the toy.';

const COIN_SIZE: Record<CoinOption, number> = {
  '₹1': 72,
  '₹2': 78,
  '₹5': 84,
  '₹10': 90,
};

const SHOP = { accent: '#F97316', glow: '#FDBA74', coinGlow: '#FCD34D', amber: '#F59E0B' } as const;

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
          ? SHOP.coinGlow
          : `${SHOP.amber}88`;

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
          colors={[`${SHOP.coinGlow}55`, `${SHOP.amber}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: size / 2 }]}
        />
        <Text style={styles.coinText}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function BuyToyGame({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! Ten rupees!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. The toy costs ten rupees.', 0.7);
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
      ? 'The toy tag says ₹10 — which coin matches the price?'
      : 'Pick the coin that equals ten rupees!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Toy Counter!"
        subtitle="You bought the toy!"
        badgeEmoji="🧸"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="TOY COUNTER · GAME 4"
      title="Buy the toy"
      instruction="Choose the coin that pays for the toy."
      mascot="🧸"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.counterFrame}>
        <LinearGradient
          colors={[`${SHOP.accent}33`, 'transparent', `${CZ.accent}22`]}
          style={styles.counterGlow}
        />
        <Text style={styles.counterLabel}>TOY COUNTER</Text>

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

        <Text style={styles.hint}>🧸 costs ₹10 — pay with the right coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  counterFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SHOP.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  counterGlow: { ...StyleSheet.absoluteFillObject },
  counterLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: SHOP.glow,
    marginBottom: 14,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${CZ.accent}66`,
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
    borderColor: `${SHOP.amber}55`,
    alignItems: 'center',
  },
  priceLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SHOP.coinGlow },
  priceValue: { fontSize: 24, fontWeight: '900', color: SHOP.coinGlow },
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
    color: SHOP.glow,
    textAlign: 'center',
  },
});
