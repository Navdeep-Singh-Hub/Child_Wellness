/**
 * Game 3 — Count mixed coins. ₹2 + ₹5 + ₹1 = ? Options ₹7, ₹8, ₹9. Correct: ₹8. Session 10: Citizen Master Challenge.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_TOTAL = '₹8';
const OPTIONS = ['₹7', '₹8', '₹9'];
const VOICE = 'Count the coins and choose the correct amount.';

export function CitizenCoinChallenge({ onComplete }: { onComplete: () => void }) {
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
        speak('Try again. Two plus five plus one is eight.');
        triggerShake();
        return;
      }
      speak('Correct! Eight rupees!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You counted ₹8!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Count the coins"
      instruction="Count the coins and choose the correct amount."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.equationRow}>
          <View style={styles.coinChip}><Text style={styles.coinText}>₹2</Text></View>
          <Text style={styles.plus}>+</Text>
          <View style={styles.coinChip}><Text style={styles.coinText}>₹5</Text></View>
          <Text style={styles.plus}>+</Text>
          <View style={styles.coinChip}><Text style={styles.coinText}>₹1</Text></View>
          <Text style={styles.equals}>=</Text>
          <Text style={styles.question}>?</Text>
        </View>
        <Text style={styles.prompt}>What is the total?</Text>
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
  equationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  coinChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  coinText: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  plus: { fontSize: 22, fontWeight: '800', color: '#374151' },
  equals: { fontSize: 22, fontWeight: '800', color: '#374151' },
  question: { fontSize: 26, fontWeight: '800', color: '#6B7280' },
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
