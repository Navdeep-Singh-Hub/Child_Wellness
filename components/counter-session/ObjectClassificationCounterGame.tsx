/**
 * Level 5 Counter — Session 5, Game 4: Object Classification
 * Sort objects into Kitchen / Bedroom. Tap item then category.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'spoon', category: 'kitchen' as const, label: 'Spoon', emoji: '🥄' },
  { id: 'bed', category: 'bedroom' as const, label: 'Bed', emoji: '🛏️' },
  { id: 'plate', category: 'kitchen' as const, label: 'Plate', emoji: '🍽️' },
  { id: 'teddy', category: 'bedroom' as const, label: 'Teddy', emoji: '🧸' },
];

export interface ObjectClassificationCounterGameProps {
  onComplete: () => void;
}

export function ObjectClassificationCounterGame({ onComplete }: ObjectClassificationCounterGameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort into Kitchen or Bedroom. Tap an item, then tap the room.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Is it from the kitchen or the bedroom?', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback((id: string) => {
    if (sorted.has(id)) return;
    setSelectedId(id);
    const item = ITEMS.find((i) => i.id === id);
    speak(item?.label ?? id, 0.7);
  }, [sorted]);

  const handleCategoryTap = useCallback(
    (category: 'kitchen' | 'bedroom') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      const roomName = category === 'kitchen' ? 'kitchen' : 'bedroom';
      speak(`Correct! ${item.label} goes in the ${roomName}!`, 0.7);
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
        subtitle="You sorted Kitchen and Bedroom!"
        badgeEmoji="🏠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Object Classification"
      instruction="Put each item in Kitchen or Bedroom."
      icon="🏠"
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
        <Text style={styles.label}>Rooms</Text>
        <View style={styles.categoriesRow}>
          <Pressable
            onPress={() => handleCategoryTap('kitchen')}
            style={[styles.categoryBtn, styles.kitchenBtn]}
            accessibilityLabel="Kitchen"
          >
            <Text style={styles.categoryEmoji}>🍳</Text>
            <Text style={styles.categoryLabel}>Kitchen</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCategoryTap('bedroom')}
            style={[styles.categoryBtn, styles.bedroomBtn]}
            accessibilityLabel="Bedroom"
          >
            <Text style={styles.categoryEmoji}>🛏️</Text>
            <Text style={styles.categoryLabel}>Bedroom</Text>
          </Pressable>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 },
  itemBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
    minWidth: 88,
  },
  selected: { backgroundColor: '#E0F2FE', borderColor: '#0EA5E9' },
  sorted: { opacity: 0.6 },
  emoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  categoriesRow: { flexDirection: 'row', gap: 16 },
  categoryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 120,
  },
  kitchenBtn: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  bedroomBtn: { backgroundColor: '#E0E7FF', borderColor: '#6366F1' },
  categoryEmoji: { fontSize: 40, marginBottom: 8 },
  categoryLabel: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
});
