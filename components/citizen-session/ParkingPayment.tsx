/**
 * Game 4 — Pay the parking fee. Parking fee = ₹10. Choose coin to pay ₹10. Correct: ₹10. Session 5: Traffic Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const FEE = '₹10';
const COIN_OPTIONS = ['₹1', '₹2', '₹5', '₹10'] as const;
const CORRECT = '₹10';
const VOICE = 'Choose coins to pay ten rupees.';

export function ParkingPayment({ onComplete }: { onComplete: () => void }) {
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
    (coin: string) => {
      if (coin !== CORRECT) {
        speak('Try again. The parking fee is ten rupees.');
        triggerShake();
        return;
      }
      speak('Correct! You paid the fee!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You paid ₹10!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Pay the parking fee"
      instruction="Choose the coin to pay ₹10."
      icon="🅿️"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.feeCard}>
          <Text style={styles.feeLabel}>Parking fee</Text>
          <Text style={styles.feeAmount}>{FEE}</Text>
        </View>
        <Text style={styles.prompt}>Which coin do you need?</Text>
        <View style={styles.optionsRow}>
          {COIN_OPTIONS.map((coin) => (
            <Animated.View key={coin} style={{ transform: [{ translateX: coin === CORRECT ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(coin)}
                style={({ pressed }) => [styles.coinCard, pressed && styles.pressed]}
                accessibilityLabel={coin}
              >
                <Text style={styles.coinText}>{coin}</Text>
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
  feeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#EC4899',
    alignItems: 'center',
    marginBottom: 24,
    minWidth: 160,
  },
  feeLabel: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  feeAmount: { fontSize: 28, fontWeight: '800', color: '#EC4899' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  coinCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderWidth: 4,
    borderColor: '#F59E0B',
  },
  pressed: { opacity: 0.85 },
  coinText: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
});
