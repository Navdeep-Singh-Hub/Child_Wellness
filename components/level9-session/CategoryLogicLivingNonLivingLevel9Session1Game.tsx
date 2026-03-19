/**
 * Level 9 (Clockwise) — Session 1, Game 4: Category Logic
 * Sort objects into Living / Non-living.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'dog', category: 'living' as const, label: 'Dog', emoji: '🐕' },
  { id: 'car', category: 'nonliving' as const, label: 'Car', emoji: '🚗' },
  { id: 'flower', category: 'living' as const, label: 'Flower', emoji: '🌸' },
  { id: 'book', category: 'nonliving' as const, label: 'Book', emoji: '📚' },
  { id: 'bird', category: 'living' as const, label: 'Bird', emoji: '🐦' },
  { id: 'chair', category: 'nonliving' as const, label: 'Chair', emoji: '🪑' },
];

type Category = 'living' | 'nonliving';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'living', label: 'Living', emoji: '🌱' },
  { id: 'nonliving', label: 'Non-living', emoji: '📦' },
];

export interface CategoryLogicLivingNonLivingLevel9Session1GameProps {
  onComplete: () => void;
}

export function CategoryLogicLivingNonLivingLevel9Session1Game({ onComplete }: CategoryLogicLivingNonLivingLevel9Session1GameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort into Living or Non-living. Tap an item, then tap the category.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Is it alive or not alive?', 0.7);
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
      const nextSorted = new Set(sorted).add(selectedId);
      setSorted(nextSorted);
      setSelectedId(null);
      if (nextSorted.size >= ITEMS.length) {
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
        subtitle="You sorted Living and Non-living!"
        badgeEmoji="🌱"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Category Logic"
      instruction="Put each item in Living or Non-living."
      icon="🌱"
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
                sorted.has(item.id) && styles.placed,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Categories — tap to place</Text>
        <View style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCategoryTap(cat.id)}
              style={[styles.catBtn, selectedId && styles.catBtnActive]}
              accessibilityLabel={cat.label}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  itemBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 72,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.5 },
  itemEmoji: { fontSize: 32, marginBottom: 4 },
  itemLabel: { fontSize: 12, fontWeight: '700', color: '#4338CA' },
  categoriesRow: { flexDirection: 'row', gap: 16 },
  catBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 100,
  },
  catBtnActive: { backgroundColor: '#EEF2FF' },
  catEmoji: { fontSize: 36, marginBottom: 6 },
  catLabel: { fontSize: 16, fontWeight: '700', color: '#4338CA' },
});
