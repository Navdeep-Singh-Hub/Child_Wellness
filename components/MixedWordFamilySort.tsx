/**
 * Sort Words Into Families — -at, -in, -un. Game 1 for Grouper Session 4 (Mixed Word Families).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Family = 'at' | 'in' | 'un';
const BOXES: { id: Family; label: string }[] = [
  { id: 'at', label: '-at' },
  { id: 'in', label: '-in' },
  { id: 'un', label: '-un' },
];
const ITEMS: { id: string; label: string; family: Family }[] = [
  { id: 'cat', label: 'cat', family: 'at' },
  { id: 'hat', label: 'hat', family: 'at' },
  { id: 'pin', label: 'pin', family: 'in' },
  { id: 'tin', label: 'tin', family: 'in' },
  { id: 'sun', label: 'sun', family: 'un' },
  { id: 'bun', label: 'bun', family: 'un' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MixedWordFamilySort({ onComplete }: { onComplete: () => void }) {
  const [itemOrder] = useState(() => shuffleArray(ITEMS));
  const [boxOrder] = useState(() => shuffleArray(BOXES));
  const [assignments, setAssignments] = useState<Record<string, Family | null>>({
    cat: null, hat: null, pin: null, tin: null, sun: null, bun: null,
  });
  const [currentItem, setCurrentItem] = useState<string | null>(itemOrder[0]?.id ?? null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort the words into their word families.', 0.75);
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

  const handleBoxTap = useCallback(
    (family: Family) => {
      if (!currentItem) return;
      const item = itemOrder.find((i) => i.id === currentItem);
      if (!item) return;
      const correct = item.family === family;
      if (correct) {
        speak('Correct!');
        triggerSnap();
        setAssignments((a) => {
          const next = { ...a, [currentItem]: family };
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

  return (
    <GameLayout
      title="Sort the words"
      instruction="Tap the word family box for each word."
    >
      <View style={styles.content}>
        <View style={styles.pickArea}>
          <Text style={styles.pickLabel}>Tap a family for:</Text>
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
                <Pressable
                  style={styles.wordCard}
                  accessibilityLabel={item.label}
                >
                  <Text style={styles.wordLabel}>{item.label}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
          {!currentItem && <Text style={styles.doneHint}>All sorted!</Text>}
        </View>
        <View style={styles.boxesRow}>
          {boxOrder.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleBoxTap(b.id)}
              style={({ pressed }) => [styles.box, pressed && styles.pressed]}
              accessibilityLabel={b.label}
            >
              <Text style={styles.boxLabel}>{b.label}</Text>
              {itemOrder.filter((i) => assignments[i.id] === b.id).map((i) => (
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
  wordCard: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  wordLabel: { fontSize: 26, fontWeight: '800', color: '#3730A3' },
  doneHint: { fontSize: 18, color: '#22C55E', fontWeight: '700' },
  boxesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  box: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    minWidth: 90,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  boxLabel: { fontSize: 22, fontWeight: '800', color: '#3730A3', marginBottom: 4 },
  assignedWord: { fontSize: 16, color: '#22C55E', fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
