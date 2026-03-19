/**
 * Builder Session 2 — Game 3: Sorting Game
 * Drag fruits into fruit basket and toys into toy basket.
 * Tap-to-sort: tap item then tap correct basket.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const FRUITS = [
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'fruit' as const },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' as const },
  { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' as const },
];
const TOYS = [
  { id: 'ball', label: 'Ball', emoji: '⚽', category: 'toy' as const },
  { id: 'teddy', label: 'Teddy', emoji: '🧸', category: 'toy' as const },
  { id: 'block', label: 'Block', emoji: '🧱', category: 'toy' as const },
];
const ITEMS = [...FRUITS, ...TOYS];

export interface SortingGameProps {
  onComplete: () => void;
}

export function SortingGame({ onComplete }: SortingGameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Put fruits in the fruit basket and toys in the toy basket. Tap an item, then tap the correct basket.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Fruits go in the fruit basket, toys in the toy basket.', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback((id: string) => {
    if (sorted.has(id)) return;
    setSelectedId(id);
    const item = ITEMS.find((i) => i.id === id);
    speak(item?.label ?? id, 0.7);
  }, [sorted]);

  const handleBasketTap = useCallback(
    (category: 'fruit' | 'toy') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item) return;
      if (item.category !== category) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${item.label} is a ${category}!`, 0.7);
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
        variant="mint"
        title="Great Job!"
        subtitle="You sorted everything!"
        badgeEmoji="🧺"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Sorting Game"
      instruction="Put fruits in the fruit basket and toys in the toy basket."
      icon="🧺"
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
                styles.itemCard,
                selectedId === item.id && styles.itemCardSelected,
                sorted.has(item.id) && styles.itemCardSorted,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Baskets</Text>
        <View style={styles.basketsRow}>
          <Pressable
            onPress={() => handleBasketTap('fruit')}
            style={[styles.basket, styles.fruitBasket]}
            accessibilityLabel="Fruit basket"
          >
            <Text style={styles.basketEmoji}>🍎</Text>
            <Text style={styles.basketLabel}>Fruit</Text>
          </Pressable>
          <Pressable
            onPress={() => handleBasketTap('toy')}
            style={[styles.basket, styles.toyBasket]}
            accessibilityLabel="Toy basket"
          >
            <Text style={styles.basketEmoji}>🧸</Text>
            <Text style={styles.basketLabel}>Toy</Text>
          </Pressable>
        </View>
        {selectedId ? (
          <Text style={styles.hint}>
            Tap the {ITEMS.find((i) => i.id === selectedId)?.category === 'fruit' ? 'fruit' : 'toy'} basket
          </Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28, justifyContent: 'center' },
  itemCard: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  itemCardSelected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  itemCardSorted: { opacity: 0.5 },
  emoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 12, fontWeight: '700', color: '#5B21B6' },
  basketsRow: { flexDirection: 'row', gap: 24 },
  basket: {
    width: 120,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    alignItems: 'center',
  },
  fruitBasket: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  toyBasket: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  basketEmoji: { fontSize: 40, marginBottom: 8 },
  basketLabel: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
