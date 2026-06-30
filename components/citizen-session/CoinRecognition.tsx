/**
 * Game 3 — Coin Spotter: Find the coin. Display ₹1, ₹2, ₹5. Answer: ₹5.
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
  { id: '1', value: '₹1', label: '1 rupee', size: 78 },
  { id: '2', value: '₹2', label: '2 rupees', size: 86 },
  { id: '5', value: '₹5', label: '5 rupees', size: 94 },
] as const;

type CoinId = (typeof COINS)[number]['id'];
const CORRECT_ID: CoinId = '5';
const VOICE = 'Tap the 5 rupee coin.';

const COIN = { accent: '#F59E0B', glow: '#FCD34D', rose: '#EC4899' } as const;

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
          ? COIN.glow
          : `${COIN.accent}88`;

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
          colors={[`${COIN.glow}55`, `${COIN.accent}44`, 'rgba(11,10,26,0.6)']}
          style={[styles.coinGrad, { borderRadius: coin.size / 2 }]}
        />
        <Text style={styles.coinValue}>{coin.value}</Text>
        <Text style={styles.coinRing}>◯</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CoinRecognition({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap the 5 rupee coin.', 0.7);
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
      ? 'Look for the biggest value — which coin says ₹5?'
      : '₹5 is worth more than ₹1 and ₹2. Find it!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Coin Spotter!"
        subtitle="You found ₹5!"
        badgeEmoji="🪙"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="COIN SPOTTER · GAME 3"
      title="Find the coin"
      instruction="Tap the ₹5 coin."
      mascot="🪙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.vaultFrame}>
        <LinearGradient
          colors={[`${COIN.accent}33`, 'transparent', `${COIN.rose}22`]}
          style={styles.vaultGlow}
        />
        <Text style={styles.vaultLabel}>COIN VAULT</Text>
        <Text style={styles.prompt}>Tap the ₹5 coin</Text>
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
        <Text style={styles.hint}>₹1 · ₹2 · ₹5 — find the five-rupee coin</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  vaultFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${COIN.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  vaultGlow: { ...StyleSheet.absoluteFillObject },
  vaultLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: COIN.glow,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  coin: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coinGrad: { ...StyleSheet.absoluteFillObject },
  coinValue: { fontSize: 24, fontWeight: '900', color: CZ.textLight },
  coinRing: {
    position: 'absolute',
    fontSize: 10,
    color: COIN.glow,
    opacity: 0.5,
    bottom: 8,
  },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: COIN.glow,
    textAlign: 'center',
  },
});
