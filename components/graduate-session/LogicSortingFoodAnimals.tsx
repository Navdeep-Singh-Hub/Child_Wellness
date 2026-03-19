/**
 * Game 4 — Sort the pictures. Categories: Food, Animals. Items: Apple, Banana, Dog, Cat. Session 3: Question & Answer.
 * One item at a time: "Where does this go? Food or Animals?"
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS: { id: string; label: string; emoji: string; category: 'food' | 'animals' }[] = [
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'food' },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'food' },
  { id: 'dog', label: 'Dog', emoji: '🐕', category: 'animals' },
  { id: 'cat', label: 'Cat', emoji: '🐱', category: 'animals' },
];
const VOICE = 'Tap Food or Animals. Put each picture in the correct group.';

export function LogicSortingFoodAnimals({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const current = ITEMS[index];

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

  const handleCategory = useCallback(
    (category: 'food' | 'animals') => {
      if (category !== current.category) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak(`Correct! ${current.label} is ${category === 'food' ? 'food' : 'an animal'}!`);
      if (index >= ITEMS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, index, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You sorted them all!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Sort the pictures"
      instruction="Put each picture in the correct group."
      icon="📂"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Where does this go?</Text>
        <View style={styles.itemDisplay}>
          <Text style={styles.itemEmoji}>{current.emoji}</Text>
          <Text style={styles.itemLabel}>{current.label}</Text>
        </View>
        <View style={styles.categoriesRow}>
          <Animated.View style={{ transform: [{ translateX: current.category === 'animals' ? shakeX : 0 }] }}>
            <Pressable
              onPress={() => handleCategory('food')}
              style={({ pressed }) => [styles.categoryCard, styles.foodCard, pressed && styles.pressed]}
              accessibilityLabel="Food"
            >
              <Text style={styles.categoryEmoji}>🍎</Text>
              <Text style={styles.categoryLabel}>Food</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: current.category === 'food' ? shakeX : 0 }] }}>
            <Pressable
              onPress={() => handleCategory('animals')}
              style={({ pressed }) => [styles.categoryCard, styles.animalsCard, pressed && styles.pressed]}
              accessibilityLabel="Animals"
            >
              <Text style={styles.categoryEmoji}>🐕</Text>
              <Text style={styles.categoryLabel}>Animals</Text>
            </Pressable>
          </Animated.View>
        </View>
        <Text style={styles.progress}>{index + 1} of {ITEMS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 20 },
  itemDisplay: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    padding: 28,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 160,
  },
  itemEmoji: { fontSize: 56, marginBottom: 8 },
  itemLabel: { fontSize: 22, fontWeight: '800', color: '#5B21B6' },
  categoriesRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  categoryCard: {
    borderRadius: 20,
    padding: 28,
    borderWidth: 4,
    minWidth: 120,
    alignItems: 'center',
  },
  foodCard: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  animalsCard: { backgroundColor: '#E0E7FF', borderColor: '#4F46E5' },
  pressed: { opacity: 0.85 },
  categoryEmoji: { fontSize: 48, marginBottom: 8 },
  categoryLabel: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  progress: { fontSize: 14, color: '#6B7280', marginTop: 16 },
});
