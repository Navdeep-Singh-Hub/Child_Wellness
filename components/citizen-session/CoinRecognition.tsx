/**
 * Game 3 — Find the coin. Display ₹1, ₹2, ₹5. "Tap the ₹5 coin." Session 1: Safety Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const COINS = [
  { id: '1', value: '₹1', label: '1 rupee' },
  { id: '2', value: '₹2', label: '2 rupees' },
  { id: '5', value: '₹5', label: '5 rupees' },
];
const CORRECT_ID = '5';
const VOICE = 'Tap the 5 rupee coin.';

export function CoinRecognition({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleTap = useCallback(
    (id: string) => {
      if (id !== CORRECT_ID) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found ₹5!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Find the coin"
      instruction="Tap the ₹5 coin."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Tap the ₹5 coin.</Text>
        <View style={styles.coinsRow}>
          {COINS.map((coin) => (
            <Animated.View
              key={coin.id}
              style={[
                styles.coinCard,
                coin.id === CORRECT_ID && styles.coinCardHighlight,
                { transform: [{ translateX: coin.id === CORRECT_ID ? 0 : shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(coin.id)}
                style={({ pressed }) => [styles.coinTouch, pressed && styles.pressed]}
                accessibilityLabel={coin.label}
              >
                <Text style={styles.coinValue}>{coin.value}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 24, textAlign: 'center' },
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  coinCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    padding: 28,
    borderWidth: 4,
    borderColor: '#F59E0B',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCardHighlight: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  coinTouch: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.9 },
  coinValue: { fontSize: 28, fontWeight: '800', color: '#1f2937' },
});
