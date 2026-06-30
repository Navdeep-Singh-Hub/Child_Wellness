/**
 * Game 3 — Coin Tap: Find the correct coin. Display ₹1, ₹2, ₹5, ₹10. Answer: ₹10.
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

const COINS = [
  { id: '1', value: '₹1', label: '1 rupee', size: 72 },
  { id: '2', value: '₹2', label: '2 rupees', size: 80 },
  { id: '5', value: '₹5', label: '5 rupees', size: 88 },
  { id: '10', value: '₹10', label: '10 rupees', size: 96 },
] as const;

type CoinId = (typeof COINS)[number]['id'];
const CORRECT_ID: CoinId = '10';
const VOICE = 'Tap the ten rupees coin.';

const DINING = { accent: '#F59E0B', glow: '#FDE68A', rose: '#EC4899' } as const;

function CoinOrb({
  coin,
  selected,
  feedback,
  onPress,
}: {
  coin: (typeof COINS)[number];
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
          ? DINING.glow
          : `${DINING.accent}88`;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.coin,
          { width: coin.size, height: coin.size, borderRadius: coin.size / 2, borderColor: border },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={coin.label}
      >
        <LinearGradient
          colors={[`${DINING.glow}55`, `${DINING.accent}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: coin.size / 2 }]}
        />
        <Text style={styles.coinValue}>{coin.value}</Text>
        <Text style={styles.coinRing}>◯</Text>
      </Pressable>
    </Animated.View>
  );
}

export function RestaurantCoinValueTap({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<CoinId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: CoinId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Ten rupees!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap the ten rupee coin.', 0.7);
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
      ? 'At the restaurant, bigger coins pay more — find ₹10!'
      : '₹10 is the biggest coin here — not ₹1, ₹2, or ₹5.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Coin Tap!"
        subtitle="You found ₹10!"
        badgeEmoji="🪙"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="COIN TAP · GAME 3"
      title="Find the correct coin"
      instruction="Tap the ₹10 coin."
      mascot="🪙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.tillFrame}>
        <LinearGradient
          colors={[`${DINING.accent}33`, 'transparent', `${DINING.rose}22`]}
          style={styles.tillGlow}
        />
        <Text style={styles.tillLabel}>RESTAURANT TILL</Text>
        <Text style={styles.prompt}>Which coin is ₹10?</Text>
        <View style={styles.coinsRow}>
          {COINS.map((coin) => (
            <CoinOrb
              key={coin.id}
              coin={coin}
              selected={selected === coin.id}
              feedback={feedback}
              onPress={() => handleTap(coin.id)}
            />
          ))}
        </View>
        <Text style={styles.hint}>₹1 · ₹2 · ₹5 · ₹10 — tap the ten-rupee coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  tillFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${DINING.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tillGlow: { ...StyleSheet.absoluteFillObject },
  tillLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DINING.glow,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  coin: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinValue: { fontSize: 22, fontWeight: '900', color: CZ.textLight },
  coinRing: {
    position: 'absolute',
    fontSize: 10,
    color: DINING.glow,
    opacity: 0.5,
    bottom: 8,
  },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: DINING.glow,
    textAlign: 'center',
  },
});
