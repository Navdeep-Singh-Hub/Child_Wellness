/**
 * Sort the shapes — Circle, Square, Triangle. Game 4 for Grouper Session 4.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type ShapeType = 'circle' | 'square' | 'triangle';
const BASKETS: { id: ShapeType; label: string; emoji: string }[] = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '🟦' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const ITEMS: { id: string; shape: ShapeType; label: string }[] = [
  { id: 'c1', shape: 'circle', label: 'Circle' },
  { id: 'c2', shape: 'circle', label: 'Circle' },
  { id: 's1', shape: 'square', label: 'Square' },
  { id: 's2', shape: 'square', label: 'Square' },
  { id: 't1', shape: 'triangle', label: 'Triangle' },
  { id: 't2', shape: 'triangle', label: 'Triangle' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ShapeSortingMixed({ onComplete }: { onComplete: () => void }) {
  const [itemOrder] = useState(() => shuffleArray(ITEMS));
  const [basketOrder] = useState(() => shuffleArray(BASKETS));
  const initialAssignments = itemOrder.reduce((acc, i) => ({ ...acc, [i.id]: null }), {} as Record<string, ShapeType | null>);
  const [assignments, setAssignments] = useState<Record<string, ShapeType | null>>(initialAssignments);
  const [currentItem, setCurrentItem] = useState<string | null>(itemOrder[0]?.id ?? null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort the shapes. Tap a basket for each shape.', 0.75);
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
    (shape: ShapeType) => {
      if (!currentItem) return;
      const item = itemOrder.find((i) => i.id === currentItem);
      if (!item) return;
      const correct = item.shape === shape;
      if (correct) {
        speak('Correct!');
        triggerSnap();
        setAssignments((a) => {
          const next = { ...a, [currentItem]: shape };
          const nextItem = itemOrder.find((i) => !next[i.id])?.id ?? null;
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
    [currentItem, itemOrder, onComplete, triggerSnap, triggerWrong]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" />;

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const scale = snapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  const shapeEmoji = (s: ShapeType) => (s === 'circle' ? '⭕' : s === 'square' ? '🟦' : '🔺');

  return (
    <GameLayout
      title="Sort the shapes"
      instruction="Tap the basket where each shape belongs."
    >
      <View style={styles.content}>
        <View style={styles.pickArea}>
          <Text style={styles.pickLabel}>Tap a basket for:</Text>
          {itemOrder.map((item) => {
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
                <View style={styles.shapeCard}>
                  <Text style={styles.shapeEmoji}>{shapeEmoji(item.shape)}</Text>
                  <Text style={styles.shapeLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            );
          })}
          {!currentItem && <Text style={styles.doneHint}>All sorted!</Text>}
        </View>
        <View style={styles.basketsRow}>
          {basketOrder.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleBasketTap(b.id)}
              style={({ pressed }) => [styles.basket, pressed && styles.pressed]}
              accessibilityLabel={b.label}
            >
              <Text style={styles.basketEmoji}>{b.emoji}</Text>
              <Text style={styles.basketLabel}>{b.label}</Text>
              {itemOrder.filter((i) => assignments[i.id] === b.id).map((i) => (
                <Text key={i.id} style={styles.assignedShape}>{shapeEmoji(i.shape)}</Text>
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
  shapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4F46E5',
    gap: 12,
  },
  shapeEmoji: { fontSize: 40 },
  shapeLabel: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
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
  assignedShape: { fontSize: 24, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
