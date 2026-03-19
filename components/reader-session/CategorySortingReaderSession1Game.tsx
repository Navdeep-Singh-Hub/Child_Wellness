/**
 * Level 7 Reader — Session 1, Game 4: Category Sorting
 * Sort objects into Food / Animals / Vehicles. Tap item then category.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'apple', category: 'food' as const, label: 'Apple', emoji: '🍎' },
  { id: 'pizza', category: 'food' as const, label: 'Pizza', emoji: '🍕' },
  { id: 'dog', category: 'animals' as const, label: 'Dog', emoji: '🐶' },
  { id: 'cat', category: 'animals' as const, label: 'Cat', emoji: '🐱' },
  { id: 'car', category: 'vehicles' as const, label: 'Car', emoji: '🚗' },
  { id: 'bus', category: 'vehicles' as const, label: 'Bus', emoji: '🚌' },
];

type Category = 'food' | 'animals' | 'vehicles';

export interface CategorySortingReaderSession1GameProps {
  onComplete: () => void;
}

export function CategorySortingReaderSession1Game({ onComplete }: CategorySortingReaderSession1GameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort into Food, Animals, or Vehicles. Tap an item, then tap the category.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Is it food, an animal, or a vehicle?', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback(
    (id: string) => {
      if (sorted.has(id)) return;
      setSelectedId(id);
      const item = ITEMS.find((i) => i.id === id);
      speak(item?.label ?? id, 0.6);
    },
    [sorted]
  );

  const handleCategoryTap = useCallback(
    (category: Category) => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak('Correct!', 0.6);
      setSorted((s) => new Set(s).add(selectedId));
      setSelectedId(null);
      if (sorted.size + 1 >= ITEMS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [onComplete, selectedId, sorted, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You sorted all the categories!"
        badgeEmoji="📂"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Category Sorting"
      instruction="Put each item in Food, Animals, or Vehicles."
      icon="📂"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Items</Text>
        <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemTap(item.id)}
              style={[
                styles.itemBtn,
                selectedId === item.id && styles.selected,
                sorted.has(item.id) && styles.sorted,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Categories</Text>
        <View style={styles.categoriesRow}>
          <Pressable onPress={() => handleCategoryTap('food')} style={[styles.categoryBtn, styles.food]} accessibilityLabel="Food">
            <Text style={styles.categoryEmoji}>🍽️</Text>
            <Text style={styles.categoryLabel}>Food</Text>
          </Pressable>
          <Pressable onPress={() => handleCategoryTap('animals')} style={[styles.categoryBtn, styles.animals]} accessibilityLabel="Animals">
            <Text style={styles.categoryEmoji}>🐾</Text>
            <Text style={styles.categoryLabel}>Animals</Text>
          </Pressable>
          <Pressable onPress={() => handleCategoryTap('vehicles')} style={[styles.categoryBtn, styles.vehicles]} accessibilityLabel="Vehicles">
            <Text style={styles.categoryEmoji}>🚗</Text>
            <Text style={styles.categoryLabel}>Vehicles</Text>
          </Pressable>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 },
  itemBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: 'rgba(99,102,241,0.55)',
    alignItems: 'center',
    minWidth: 90,
  },
  selected: { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.9)' },
  sorted: { opacity: 0.6 },
  emoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  categoryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 110,
  },
  food: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  animals: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  vehicles: { backgroundColor: '#E0F2FE', borderColor: '#38BDF8' },
  categoryEmoji: { fontSize: 34, marginBottom: 6 },
  categoryLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
});

