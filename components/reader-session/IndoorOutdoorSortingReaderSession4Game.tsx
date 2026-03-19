/**
 * Level 7 Reader — Session 4, Game 4: Sorting Game
 * Sort objects into Indoor / Outdoor. Tap item then category.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'couch', category: 'indoor' as const, label: 'Couch', emoji: '🛋️' },
  { id: 'tree', category: 'outdoor' as const, label: 'Tree', emoji: '🌳' },
  { id: 'bed', category: 'indoor' as const, label: 'Bed', emoji: '🛏️' },
  { id: 'sun', category: 'outdoor' as const, label: 'Sun', emoji: '☀️' },
  { id: 'lamp', category: 'indoor' as const, label: 'Lamp', emoji: '💡' },
  { id: 'flower', category: 'outdoor' as const, label: 'Flower', emoji: '🌸' },
];

type Category = 'indoor' | 'outdoor';

export interface IndoorOutdoorSortingReaderSession4GameProps {
  onComplete: () => void;
}

export function IndoorOutdoorSortingReaderSession4Game({ onComplete }: IndoorOutdoorSortingReaderSession4GameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort into Indoor or Outdoor. Tap an item, then tap the category.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Is it usually inside or outside?', 0.7);
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
        subtitle="You sorted Indoor and Outdoor!"
        badgeEmoji="📂"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Sorting Game"
      instruction="Put each item in Indoor or Outdoor."
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
          <Pressable
            onPress={() => handleCategoryTap('indoor')}
            style={[styles.categoryBtn, styles.indoor]}
            accessibilityLabel="Indoor"
          >
            <Text style={styles.categoryEmoji}>🏠</Text>
            <Text style={styles.categoryLabel}>Indoor</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCategoryTap('outdoor')}
            style={[styles.categoryBtn, styles.outdoor]}
            accessibilityLabel="Outdoor"
          >
            <Text style={styles.categoryEmoji}>🌲</Text>
            <Text style={styles.categoryLabel}>Outdoor</Text>
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
    minWidth: 88,
  },
  selected: { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.9)' },
  sorted: { opacity: 0.6 },
  emoji: { fontSize: 34, marginBottom: 4 },
  itemLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  categoryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 120,
  },
  indoor: { backgroundColor: '#E0E7FF', borderColor: '#6366F1' },
  outdoor: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  categoryEmoji: { fontSize: 36, marginBottom: 6 },
  categoryLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
});
