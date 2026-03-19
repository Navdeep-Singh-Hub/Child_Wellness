/**
 * Sort the Objects — Game 4: Sort cat, rat → Animals; hat → Clothes; bat → Sports
 * Tap to assign each card to a basket. AAC-friendly: large baskets and cards.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Category = 'animals' | 'clothes' | 'sports';
const BASKETS: { id: Category; label: string; emoji: string }[] = [
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'sports', label: 'Sports', emoji: '⚾' },
];
const ITEMS: { id: string; label: string; category: Category; image: string }[] = [
  { id: 'cat', label: 'cat', category: 'animals', image: 'https://placehold.co/100x100/FED7AA/9A3412?text=cat' },
  { id: 'rat', label: 'rat', category: 'animals', image: 'https://placehold.co/100x100/E5E7EB/4B5563?text=rat' },
  { id: 'hat', label: 'hat', category: 'clothes', image: 'https://placehold.co/100x100/DDD6FE/5B21B6?text=hat' },
  { id: 'bat', label: 'bat', category: 'sports', image: 'https://placehold.co/100x100/E5E7EB/374151?text=bat' },
];

export function ObjectSorting({ onComplete }: { onComplete: () => void }) {
  const [assignments, setAssignments] = useState<Record<string, Category | null>>({
    cat: null,
    rat: null,
    hat: null,
    bat: null,
  });
  const [currentItem, setCurrentItem] = useState<string | null>('cat');
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort the items. Tap a basket for each word.', 0.75);
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

  if (showSuccess) return <SuccessCelebration variant="indigo" />;

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const scale = snapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <GameLayout
      title="Sort the items"
      instruction="Tap the basket where each word belongs."
    >
      <View style={styles.content}>
        <View style={styles.pickArea}>
          <Text style={styles.pickLabel}>Tap a basket for:</Text>
          {ITEMS.map((item) => {
            const assigned = assignments[item.id];
            const isCurrent = currentItem === item.id;
            if (assigned) return null;
            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.cardWrap,
                  isCurrent && styles.cardCurrent,
                  { transform: [isCurrent ? { scale } : { translateX: shakeX }] },
                ]}
              >
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <Text style={styles.cardLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            );
          })}
          {!currentItem && (
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
  pickArea: { marginBottom: 24, alignItems: 'center' },
  pickLabel: { fontSize: 20, color: '#4b5563', marginBottom: 12 },
  cardWrap: { marginBottom: 8 },
  cardCurrent: { borderWidth: 4, borderColor: '#4F46E5', borderRadius: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4F46E5',
    gap: 16,
  },
  cardImage: { width: 56, height: 56, borderRadius: 10 },
  cardLabel: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  doneHint: { fontSize: 18, color: '#22C55E', fontWeight: '700' },
  basketsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  basket: {
    backgroundColor: '#E0E7FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    minWidth: 100,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  basketEmoji: { fontSize: 36, marginBottom: 8 },
  basketLabel: { fontSize: 18, fontWeight: '800', color: '#3730A3' },
  assignedWord: { fontSize: 16, color: '#22C55E', marginTop: 4, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
