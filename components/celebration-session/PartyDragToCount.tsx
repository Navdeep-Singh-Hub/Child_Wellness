/**
 * PartyDragToCount — Game 4: Count the Party Items (1–15)
 * Tap balloons/cupcakes into party basket; count aloud One through Fifteen. Celebration on completion.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_ITEMS = 15;
const COUNT_WORDS = [
  'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
];

export function PartyDragToCount({ onComplete }: { onComplete: () => void }) {
  const [collected, setCollected] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOTAL_ITEMS);
  const [celebrationAnim] = useState(() => new Animated.Value(0));

  const collectOne = useCallback(() => {
    if (collected >= TOTAL_ITEMS) return;
    const next = collected + 1;
    setCollected(next);
    setVisibleCount((v) => Math.max(0, v - 1));
    speak(COUNT_WORDS[next - 1], 0.7);
    if (next === TOTAL_ITEMS) {
      speak('Great job!');
      Animated.timing(celebrationAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2500);
    }
  }, [collected, onComplete, celebrationAnim]);

  if (showSuccess) return <SuccessCelebration variant="sunset" title="Great Job!" subtitle={`${TOTAL_ITEMS} party items in the basket!`} badgeEmoji="🎉" />;

  return (
    <GameLayout
      title="Count the Party Items"
      instruction="Tap each item to put it in the party basket. Count with me!"
    >
      <View style={styles.content}>
        <View style={styles.itemsRow}>
          {Array.from({ length: visibleCount }, (_, i) => (
            <Pressable
              key={i}
              onPress={collectOne}
              style={({ pressed }) => [styles.itemWrap, pressed && styles.pressed]}
              accessibilityLabel={`Party item ${i + 1}`}
            >
              <Text style={styles.itemEmoji}>{i % 3 === 0 ? '🎈' : i % 3 === 1 ? '🎂' : '🎁'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.basketArea}>
          <Animated.View style={[styles.basketWrap, { opacity: collected > 0 ? 1 : 0.7 }]}>
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketLabel}>Party basket</Text>
            {collected > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{collected}</Text>
              </View>
            )}
          </Animated.View>
          {collected < TOTAL_ITEMS && (
            <Text style={styles.hint}>Tap an item to add it to the basket</Text>
          )}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingVertical: 16 },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    minHeight: 100,
  },
  itemWrap: { padding: 4 },
  pressed: { opacity: 0.8 },
  itemEmoji: { fontSize: 32 },
  basketArea: { alignItems: 'center', marginTop: 'auto' },
  basketWrap: {
    position: 'relative',
    padding: 20,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#F472B6',
    alignItems: 'center',
    minWidth: 160,
  },
  basketEmoji: { fontSize: 48, marginBottom: 8 },
  basketLabel: { fontSize: 18, fontWeight: '700', color: '#9D174D' },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#38BDF8',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  hint: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  finalNumber: { fontSize: 56, fontWeight: '800', color: '#F472B6' },
  finalLabel: { fontSize: 22, color: '#9D174D', marginTop: 8 },
  successText: { fontSize: 32, fontWeight: '800', color: '#DB2777', marginTop: 16 },
});
