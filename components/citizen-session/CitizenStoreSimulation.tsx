/**
 * Game 4 — Store Simulation: Buy the Apple. Apple ₹5, choose ₹5.
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

const ITEM = 'Apple';
const ITEM_EMOJI = '🍎';
const PRICE = '₹5';
const COIN_OPTIONS = ['₹1', '₹2', '₹5', '₹10'] as const;
type CoinOption = (typeof COIN_OPTIONS)[number];
const CORRECT: CoinOption = '₹5';
const VOICE = 'Choose coins to buy the apple.';

const SHELF = [
  { emoji: '🧃', label: 'Juice', price: '₹10' },
  { emoji: '🍎', label: 'Apple', price: '₹5', target: true },
  { emoji: '🧸', label: 'Toy', price: '₹20' },
] as const;

const COIN_SIZE: Record<CoinOption, number> = {
  '₹1': 72,
  '₹2': 78,
  '₹5': 84,
  '₹10': 90,
};

const MASTER = { accent: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', coinGlow: '#FCD34D' } as const;

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
          ? MASTER.coinGlow
          : `${MASTER.accent}88`;

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
          colors={[`${MASTER.coinGlow}55`, `${MASTER.accent}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: size / 2 }]}
        />
        <Text style={styles.coinText}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CitizenStoreSimulation({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! You bought the apple!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. The apple costs five rupees.', 0.7);
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
      ? 'Find the apple on the shelf — it costs ₹5!'
      : 'Pick the coin that equals five rupees!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Store Sim!"
        subtitle="You bought the apple!"
        badgeEmoji="🛒"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="STORE SIM · GAME 4"
      title="Buy the item"
      instruction="Choose coins to buy the apple."
      mascot="🛒"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.storeFrame}>
        <LinearGradient
          colors={[`${MASTER.accent}33`, 'transparent', `${MASTER.violet}22`]}
          style={styles.storeGlow}
        />
        <Text style={styles.storeLabel}>CIVIC MARKET STALL</Text>

        <View style={styles.shelfRow}>
          {SHELF.map((item) => (
            <View
              key={item.label}
              style={[styles.shelfItem, 'target' in item && item.target && styles.shelfItemTarget]}
            >
              <Text style={styles.shelfEmoji}>{item.emoji}</Text>
              <Text style={styles.shelfName}>{item.label}</Text>
              <Text style={[styles.shelfPrice, 'target' in item && item.target && styles.shelfPriceTarget]}>
                {item.price}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.targetCard}>
          <Text style={styles.targetEmoji}>{ITEM_EMOJI}</Text>
          <Text style={styles.targetName}>Buy: {ITEM}</Text>
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

        <Text style={styles.hint}>🍎 costs ₹5 — pay with the right coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  storeFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${MASTER.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  storeGlow: { ...StyleSheet.absoluteFillObject },
  storeLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: MASTER.glow,
    marginBottom: 14,
  },
  shelfRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 14 },
  shelfItem: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: CZ.glassBorder,
    backgroundColor: 'rgba(11,10,26,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  shelfItemTarget: {
    borderColor: MASTER.accent,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  shelfEmoji: { fontSize: 24, marginBottom: 4 },
  shelfName: { fontSize: 11, fontWeight: '800', color: CZ.textMuted },
  shelfPrice: { fontSize: 13, fontWeight: '900', color: CZ.textLight, marginTop: 2 },
  shelfPriceTarget: { color: MASTER.glow },
  targetCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${MASTER.accent}66`,
    backgroundColor: 'rgba(11,10,26,0.65)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
    minWidth: 160,
  },
  targetEmoji: { fontSize: 40, marginBottom: 4 },
  targetName: { fontSize: 18, fontWeight: '900', color: CZ.textLight, marginBottom: 8 },
  priceTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.18)',
    borderWidth: 1.5,
    borderColor: `${MASTER.accent}55`,
    alignItems: 'center',
  },
  priceLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: MASTER.coinGlow },
  priceValue: { fontSize: 24, fontWeight: '900', color: MASTER.coinGlow },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    textAlign: 'center',
    marginBottom: 14,
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
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: MASTER.glow,
    textAlign: 'center',
  },
});
