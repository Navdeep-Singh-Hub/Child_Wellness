/**
 * Level 5 Counter — Session 1, Game 4: Category Sorting
 * Drag (tap) objects into categories: Animals / Fruits.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'dog', category: 'animals' as const, label: 'Dog', emoji: '🐕' },
  { id: 'apple', category: 'fruits' as const, label: 'Apple', emoji: '🍎' },
  { id: 'cat', category: 'animals' as const, label: 'Cat', emoji: '🐱' },
  { id: 'banana', category: 'fruits' as const, label: 'Banana', emoji: '🍌' },
];

export interface CategorySortingCounterGameProps {
  onComplete: () => void;
}

export function CategorySortingCounterGame({ onComplete }: CategorySortingCounterGameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort into categories. Put each item in Animals or Fruits. Tap an item, then tap the category.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Is it an animal or a fruit?', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback((id: string) => {
    if (sorted.has(id)) return;
    setSelectedId(id);
    const item = ITEMS.find((i) => i.id === id);
    speak(item?.label ?? id, 0.7);
  }, [sorted]);

  const handleCategoryTap = useCallback(
    (category: 'animals' | 'fruits') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${item.label} is a ${category === 'animals' ? 'animal' : 'fruit'}!`, 0.7);
      setSorted((s) => new Set(s).add(selectedId));
      setSelectedId(null);
      if (sorted.size + 1 >= ITEMS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, sorted, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
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
      instruction="Put each item in Animals or Fruits."
      icon="📂"
      backgroundVariant="ocean"
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
          <Pressable
            onPress={() => handleCategoryTap('animals')}
            style={[styles.categoryBtn, styles.animalsBtn]}
            accessibilityLabel="Animals"
          >
            <Text style={styles.categoryEmoji}>🐾</Text>
            <Text style={styles.categoryLabel}>Animals</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCategoryTap('fruits')}
            style={[styles.categoryBtn, styles.fruitsBtn]}
            accessibilityLabel="Fruits"
          >
            <Text style={styles.categoryEmoji}>🍎</Text>
            <Text style={styles.categoryLabel}>Fruits</Text>
          </Pressable>
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Tap Animals or Fruits</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, justifyContent: 'center' },
  itemBtn: {
    width: 88,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  emoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  sorted: { opacity: 0.5 },
  categoriesRow: { flexDirection: 'row', gap: 20 },
  categoryBtn: {
    minWidth: 120,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    alignItems: 'center',
  },
  animalsBtn: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  fruitsBtn: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  categoryEmoji: { fontSize: 40, marginBottom: 8 },
  categoryLabel: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  hint: { marginTop: 20, fontSize: 16, color: '#64748B', fontWeight: '600' },
});
