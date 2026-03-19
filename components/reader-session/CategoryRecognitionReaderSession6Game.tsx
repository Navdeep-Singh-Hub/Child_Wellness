/**
 * Level 7 Reader — Session 6, Game 2: Category Recognition
 * Select all animals. Tap each animal (dog, cat, bird); avoid non-animals.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'dog', label: 'Dog', emoji: '🐕', isAnimal: true },
  { id: 'car', label: 'Car', emoji: '🚗', isAnimal: false },
  { id: 'cat', label: 'Cat', emoji: '🐱', isAnimal: true },
  { id: 'apple', label: 'Apple', emoji: '🍎', isAnimal: false },
  { id: 'bird', label: 'Bird', emoji: '🐦', isAnimal: true },
  { id: 'sun', label: 'Sun', emoji: '☀️', isAnimal: false },
];
const ANIMAL_IDS = ITEMS.filter((i) => i.isAnimal).map((i) => i.id);
const TOTAL_ANIMALS = ANIMAL_IDS.length;

export interface CategoryRecognitionReaderSession6GameProps {
  onComplete: () => void;
}

export function CategoryRecognitionReaderSession6Game({ onComplete }: CategoryRecognitionReaderSession6GameProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap all the animals. Find the dog, the cat, and the bird.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('That is not an animal. Tap only the animals.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return;
      if (item.isAnimal) {
        const next = new Set(selected).add(id);
        setSelected(next);
        speak(item.label, 0.5);
        if (next.size >= TOTAL_ANIMALS) {
          speak('You found all the animals!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        triggerWrong();
      }
    },
    [onComplete, selected, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You selected all the animals!"
        badgeEmoji="🐾"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Category Recognition"
      instruction="Tap ALL the animals. Do not tap things that are not animals."
      icon="🐾"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Select all animals ({selected.size}/{TOTAL_ANIMALS})</Text>
        <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={[
                styles.itemBtn,
                selected.has(item.id) && styles.itemSelected,
                { borderColor: selected.has(item.id) ? '#22C55E' : '#818CF8' },
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {selected.has(item.id) ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 20 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 16 },
  itemBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 88,
  },
  itemSelected: { backgroundColor: '#DCFCE7' },
  itemEmoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  check: { position: 'absolute', top: 4, right: 6, fontSize: 16, color: '#22C55E', fontWeight: '800' },
});
