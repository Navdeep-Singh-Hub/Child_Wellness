/**
 * Builder Session 5 — Game 3: Drag Numbers
 * Arrange numbers 1, 2, 3. Tap numbers in order to fill slots.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const NUMBERS = ['1', '2', '3'];
const TARGET = ['1', '2', '3'];

export interface DragNumbersGameProps {
  onComplete: () => void;
}

export function DragNumbersGame({ onComplete }: DragNumbersGameProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the numbers in order: 1, then 2, then 3.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Tap 1 first, then 2, then 3.', 0.7);
  }, [wrongShake]);

  const nextIndex = slots.findIndex((s) => s === null);
  const expected = nextIndex >= 0 ? TARGET[nextIndex] : null;

  const handleTap = useCallback(
    (num: string) => {
      if (nextIndex < 0) return;
      if (num !== expected) {
        triggerWrong();
        return;
      }
      const next = [...slots];
      next[nextIndex] = num;
      setSlots(next);
      speak(num, 0.7);
      if (nextIndex === 2) {
        speak('One, two, three! Great job!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [slots, nextIndex, expected, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You arranged 1, 2, 3!"
        badgeEmoji="🔢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Arrange Numbers"
      instruction="Tap the numbers in order: 1, then 2, then 3."
      icon="🔢"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Arrange 1, 2, 3</Text>
        <Animated.View style={[styles.slotsRow, { transform: [{ translateX: shakeX }] }]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotText}>{slots[i] ?? '?'}</Text>
            </View>
          ))}
        </Animated.View>
        <Text style={styles.numsLabel}>Tap in order</Text>
        <View style={styles.numsRow}>
          {NUMBERS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
            >
              <Text style={styles.numText}>{num}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 20, fontWeight: '800', color: '#4F46E5', marginBottom: 20 },
  slotsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  slot: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    borderWidth: 4,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontSize: 36, fontWeight: '800', color: '#5B21B6' },
  numsLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  numsRow: { flexDirection: 'row', gap: 24 },
  numBtn: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
  numText: { fontSize: 40, fontWeight: '800', color: '#5B21B6' },
});
