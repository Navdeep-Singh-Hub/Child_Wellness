/**
 * Big Sorting Puzzle — 4 baskets: Animals, Clothes, Tools, Food. Game 4 for Grouper Session 10.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Category = 'animals' | 'clothes' | 'tools' | 'food';
const BASKETS: { id: Category; label: string; emoji: string }[] = [
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'tools', label: 'Tools', emoji: '🔧' },
  { id: 'food', label: 'Food', emoji: '🍎' },
];
const ITEMS: { id: string; label: string; category: Category; image: string }[] = [
  { id: 'dog', label: 'dog', category: 'animals', image: 'https://placehold.co/100x100/FDE68A/92400E?text=dog' },
  { id: 'cat', label: 'cat', category: 'animals', image: 'https://placehold.co/100x100/FED7AA/9A3412?text=cat' },
  { id: 'shirt', label: 'shirt', category: 'clothes', image: 'https://placehold.co/100x100/DBEAFE/1E40AF?text=shirt' },
  { id: 'hat', label: 'hat', category: 'clothes', image: 'https://placehold.co/100x100/DDD6FE/5B21B6?text=hat' },
  { id: 'hammer', label: 'hammer', category: 'tools', image: 'https://placehold.co/100x100/FEF3C7/B45309?text=hammer' },
  { id: 'screwdriver', label: 'screwdriver', category: 'tools', image: 'https://placehold.co/100x100/E5E7EB/374151?text=screw' },
  { id: 'apple', label: 'apple', category: 'food', image: 'https://placehold.co/100x100/FEE2E2/991B1B?text=apple' },
  { id: 'bread', label: 'bread', category: 'food', image: 'https://placehold.co/100x100/FEF3C7/B45309?text=bread' },
];

export function BigSortingPuzzleMaster({ onComplete }: { onComplete: () => void }) {
  const [assignments, setAssignments] = useState<Record<string, Category | null>>(
    ITEMS.reduce((acc, i) => ({ ...acc, [i.id]: null }), {} as Record<string, Category | null>)
  );
  const [currentItem, setCurrentItem] = useState<string | null>(ITEMS[0].id);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort the objects. Tap a basket for each one.', 0.75);
  }, []);

  const triggerSnap = useCallback(() => {
    snapAnim.setValue(0);
    Animated.timing(snapAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [snapAnim]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [wrongShake]);

  const handleBasketTap = useCallback(
    (category: Category) => {
      if (!currentItem) return;
      const item = ITEMS.find((i) => i.id === currentItem);
      if (!item) return;
      const correct = item.category === category;
      if (correct) {
        speak('Correct!');
        triggerSnap();
        setAssignments((a) => {
          const next = { ...a, [currentItem]: category };
          const nextItem = ITEMS.find((i) => !next[i.id])?.id ?? null;
          setCurrentItem(nextItem);
          if (!nextItem) {
            speak('Great job!');
            setShowSuccess(true);
            setTimeout(() => onComplete(), 2000);
          }
          return next;
        });
      } else {
        speak('Try again.');
        triggerWrong();
      }
    },
    [currentItem, onComplete, triggerSnap, triggerWrong]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Big sorting complete!" badgeEmoji="🏆" />;
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const scale = snapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <GameLayout
      title="Sort the objects"
      instruction="Tap the basket where each object belongs."
    >
      <View style={styles.content}>
        <View style={styles.pickArea}>
          <Text style={styles.pickLabel}>Tap a basket for:</Text>
          {currentItem ? (() => {
            const item = ITEMS.find((i) => i.id === currentItem)!;
            return (
              <Animated.View
                key={item.id}
                style={[styles.cardWrap, styles.cardCurrent, { transform: [{ translateX: shakeX }, { scale }] }]}
              >
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <Text style={styles.cardLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            );
          })() : (
            <Text style={styles.doneHint}>All sorted!</Text>
          )}
        </View>
        <View style={styles.basketsRow}>
          {BASKETS.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleBasketTap(b.id)}
              style={({ pressed }) => [styles.basket, pressed && styles.pressed]}
              accessibilityLabel={b.label}
            >
              <Text style={styles.basketEmoji}>{b.emoji}</Text>
              <Text style={styles.basketLabel}>{b.label}</Text>
              {ITEMS.filter((i) => assignments[i.id] === b.id).map((i) => (
                <Text key={i.id} style={styles.assignedWord}>{i.label}</Text>
              ))}
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 16 },
  pickArea: { marginBottom: 20, alignItems: 'center' },
  pickLabel: { fontSize: 18, color: '#4b5563', marginBottom: 10 },
  cardWrap: { marginBottom: 8 },
  cardCurrent: { borderWidth: 4, borderColor: '#4F46E5', borderRadius: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4F46E5',
    gap: 14,
  },
  cardImage: { width: 52, height: 52, borderRadius: 10 },
  cardLabel: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  doneHint: { fontSize: 18, color: '#22C55E', fontWeight: '700' },
  basketsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  basket: {
    backgroundColor: '#E0E7FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#4F46E5',
    minWidth: 88,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  basketEmoji: { fontSize: 28, marginBottom: 4 },
  basketLabel: { fontSize: 14, fontWeight: '800', color: '#3730A3' },
  assignedWord: { fontSize: 12, color: '#22C55E', marginTop: 2, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
