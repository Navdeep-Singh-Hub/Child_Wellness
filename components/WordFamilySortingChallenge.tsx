/**
 * Sort words into 5 families (-at, -in, -un, -op, -an). Game 1 for Grouper Session 9 (Family Sorting Challenge).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Family = 'at' | 'in' | 'un' | 'op' | 'an';
const BOXES: { id: Family; label: string }[] = [
  { id: 'at', label: '-at' },
  { id: 'in', label: '-in' },
  { id: 'un', label: '-un' },
  { id: 'op', label: '-op' },
  { id: 'an', label: '-an' },
];
const ITEMS: { id: string; label: string; family: Family }[] = [
  { id: 'cat', label: 'cat', family: 'at' },
  { id: 'pin', label: 'pin', family: 'in' },
  { id: 'sun', label: 'sun', family: 'un' },
  { id: 'top', label: 'top', family: 'op' },
  { id: 'fan', label: 'fan', family: 'an' },
];

export function WordFamilySortingChallenge({ onComplete }: { onComplete: () => void }) {
  const [assignments, setAssignments] = useState<Record<string, Family | null>>({
    cat: null, pin: null, sun: null, top: null, fan: null,
  });
  const [currentItem, setCurrentItem] = useState<string | null>('cat');
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
      const item = ITEMS.find((i) => i.id === currentItem);
      if (!item) return;
      const correct = item.family === family;
      if (correct) {
        speak('Correct!');
        triggerSnap();
        setAssignments((a) => {
          const next = { ...a, [currentItem]: family };
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
    return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Family sorting complete!" />;
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const scale = snapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <GameLayout
      title="Sort the words into families"
      instruction="Tap the word family box for each word."
    >
      <View style={styles.content}>
        <View style={styles.pickArea}>
          <Text style={styles.pickLabel}>Tap a family for:</Text>
          {currentItem ? (() => {
            const item = ITEMS.find((i) => i.id === currentItem)!;
            return (
              <Animated.View
                key={item.id}
                style={[styles.cardWrap, styles.cardCurrent, { transform: [{ translateX: shakeX }, { scale }] }]}
              >
                <View style={styles.wordCard}>
                  <Text style={styles.wordLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            );
          })() : (
            <Text style={styles.doneHint}>All sorted!</Text>
          )}
        </View>
        <View style={styles.boxesRow}>
          {BOXES.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => handleBoxTap(b.id)}
              style={({ pressed }) => [styles.box, pressed && styles.pressed]}
              accessibilityLabel={b.label}
            >
              <Text style={styles.boxLabel}>{b.label}</Text>
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
  cardWrap: { marginBottom: 6 },
  cardCurrent: { borderWidth: 4, borderColor: '#4F46E5', borderRadius: 12 },
  wordCard: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#4F46E5',
    alignItems: 'center',
  },
  wordLabel: { fontSize: 24, fontWeight: '800', color: '#3730A3' },
  doneHint: { fontSize: 18, color: '#22C55E', fontWeight: '700' },
  boxesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  box: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#4F46E5',
    minWidth: 56,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  boxLabel: { fontSize: 16, fontWeight: '800', color: '#3730A3' },
  assignedWord: { fontSize: 14, color: '#22C55E', marginTop: 4, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
