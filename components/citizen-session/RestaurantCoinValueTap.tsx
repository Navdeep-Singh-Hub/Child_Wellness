/**
 * Game 3 — Find the correct coin. Tap the ₹10 coin. Display ₹1, ₹2, ₹5, ₹10. Session 7: Restaurant Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const COINS = [
  { id: '₹1', label: '₹1', color: '#374151', bg: '#F3F4F6' },
  { id: '₹2', label: '₹2', color: '#374151', bg: '#E5E7EB' },
  { id: '₹5', label: '₹5', color: '#1f2937', bg: '#FEF3C7' },
  { id: '₹10', label: '₹10', color: '#1f2937', bg: '#FDE68A' },
];
const CORRECT = '₹10';
const VOICE = 'Tap the ten rupees coin.';

export function RestaurantCoinValueTap({ onComplete }: { onComplete: () => void }) {
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
      if (id !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! Ten rupees!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found ₹10!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Find the correct coin"
      instruction="Tap the ₹10 coin."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which coin is ₹10?</Text>
        <View style={styles.coinsRow}>
          {COINS.map((coin) => (
            <Animated.View
              key={coin.id}
              style={[
                styles.coinCard,
                { backgroundColor: coin.bg, borderColor: '#F59E0B' },
                coin.id === CORRECT && { borderWidth: 4 },
                { transform: [{ translateX: coin.id === CORRECT ? 0 : shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(coin.id)}
                style={({ pressed }) => [styles.coinTouch, pressed && styles.pressed]}
                accessibilityLabel={`Coin ${coin.label}`}
              >
                <Text style={[styles.coinText, { color: coin.color }]}>{coin.label}</Text>
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
  coinsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  coinCard: {
    borderRadius: 999,
    padding: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  coinTouch: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.9 },
  coinText: { fontSize: 22, fontWeight: '800' },
});
