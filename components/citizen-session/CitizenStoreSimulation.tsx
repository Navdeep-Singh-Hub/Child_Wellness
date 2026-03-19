/**
 * Game 4 — Store Simulation: Buy the Apple. Apple ₹5, choose ₹5. Session 10: Citizen Master Challenge.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEM = 'Apple';
const PRICE = '₹5';
const COIN_OPTIONS = ['₹1', '₹2', '₹5', '₹10'] as const;
const CORRECT = '₹5';
const VOICE = 'Choose coins to buy the apple.';

export function CitizenStoreSimulation({ onComplete }: { onComplete: () => void }) {
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
        speak('Try again. The apple costs five rupees.');
        triggerShake();
        return;
      }
      speak('Correct! You bought the apple!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You bought the apple!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Buy the item"
      instruction="Choose coins to buy the apple."
      icon="🛒"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.shelfRow}>
          <View style={styles.itemChip}><Text style={styles.itemLabel}>Juice ₹10</Text></View>
          <View style={[styles.itemChip, styles.itemHighlight]}><Text style={styles.itemLabel}>Apple ₹5</Text></View>
          <View style={styles.itemChip}><Text style={styles.itemLabel}>Toy ₹20</Text></View>
        </View>
        <Text style={styles.prompt}>Buy the Apple. Which coin?</Text>
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
  shelfRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  itemChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  itemHighlight: { backgroundColor: '#FCE7F3', borderColor: '#EC4899' },
  itemLabel: { fontSize: 16, fontWeight: '800', color: '#374151' },
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
