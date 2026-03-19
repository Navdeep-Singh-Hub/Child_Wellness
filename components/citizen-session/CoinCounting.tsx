/**
 * Game 4 — Count the coins. ₹2 + ₹2 + ₹1 = ? Options ₹3, ₹4, ₹5. Correct: ₹5. Session 1: Safety Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const COINS_DISPLAY = ['₹2', '₹2', '₹1'];
const CORRECT_TOTAL = '₹5';
const OPTIONS = ['₹3', '₹4', '₹5'];
const VOICE = 'Count the coins and choose the correct amount. Two plus two plus one is five.';

export function CoinCounting({ onComplete }: { onComplete: () => void }) {
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

  const handleChoice = useCallback(
    (amount: string) => {
      if (amount !== CORRECT_TOTAL) {
        speak('Try again. Count the coins.');
        triggerShake();
        return;
      }
      speak('Correct! Five rupees!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You counted right!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Count the coins"
      instruction="Count the coins and choose the correct amount."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.coinsRow}>
          {COINS_DISPLAY.map((v, i) => (
            <View key={i} style={styles.coinChip}>
              <Text style={styles.coinText}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.prompt}>How much in total?</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === CORRECT_TOTAL ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(opt)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={opt}
              >
                <Text style={styles.optionText}>{opt}</Text>
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
  coinsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  coinChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  coinText: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
});
