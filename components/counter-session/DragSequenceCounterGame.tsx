/**
 * Level 5 Counter — Session 2, Game 3: Drag Sequence
 * Arrange numbers in order: 4, 5, 6, 7. User taps numbers in order.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SEQUENCE = [4, 5, 6, 7];
const NUMBERS = [5, 4, 7, 6]; // shuffled

export interface DragSequenceCounterGameProps {
  onComplete: () => void;
}

export function DragSequenceCounterGame({ onComplete }: DragSequenceCounterGameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the numbers in order: 4, 5, 6, 7.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap 4, then 5, then 6, then 7.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      const expected = SEQUENCE[nextIndex];
      if (num === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(String(num), 0.6);
        if (newIndex >= SEQUENCE.length) {
          speak('Correct! 4, 5, 6, 7!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        triggerWrong();
      }
    },
    [nextIndex, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You put the numbers in order!"
        badgeEmoji="🔢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Number Sequence"
      instruction="Tap the numbers in order: 4, 5, 6, 7."
      icon="🔢"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Order: 4, 5, 6, 7</Text>
        <View style={styles.slotsRow}>
          {SEQUENCE.map((_, i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotText}>{i < nextIndex ? SEQUENCE[i] : '?'}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.tapLabel}>Tap the numbers in order</Text>
        <Animated.View style={[styles.numbersRow, { transform: [{ translateX: shakeX }] }]}>
          {NUMBERS.map((num, i) => (
            <Pressable
              key={`${num}-${i}`}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
            >
              <Text style={styles.numText}>{num}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16 },
  slotsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontSize: 24, fontWeight: '800', color: '#0C4A6E' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  numbersRow: { flexDirection: 'row', gap: 16 },
  numBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 28, fontWeight: '800', color: '#0C4A6E' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
