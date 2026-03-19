/**
 * Game 4 — Buy the item. Apple costs ₹5; choose the correct coin (₹5). Session 3: Direction Signs.
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
const VOICE = 'Choose the coin to buy the apple.';

export function BuyItemGame({ onComplete }: { onComplete: () => void }) {
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
      speak('Correct! Five rupees!');
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
      instruction="Choose the coin to buy the apple."
      icon="🍎"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.itemCard}>
          <Text style={styles.itemEmoji}>🍎</Text>
          <Text style={styles.itemName}>{ITEM}</Text>
          <Text style={styles.itemPrice}>{PRICE}</Text>
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
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#EC4899',
    alignItems: 'center',
    marginBottom: 24,
    minWidth: 160,
  },
  itemEmoji: { fontSize: 48, marginBottom: 8 },
  itemName: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 4 },
  itemPrice: { fontSize: 24, fontWeight: '800', color: '#EC4899' },
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
