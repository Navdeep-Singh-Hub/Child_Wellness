/**
 * GroceryDotMaze — Game 4: Shopping Cart Dot Maze (1–10)
 * Count the dots, tap the number to move the cart. Cart moves forward on correct.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [3, 6, 9, 1, 7, 10]; // counts 1–10

export function GroceryDotMaze({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cartOffset] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));
  const count = ROUNDS[roundIndex];

  useEffect(() => {
    cartOffset.setValue(0);
    speak('Count the dots and move the cart. How many dots?', 0.75);
  }, [roundIndex]);

  const triggerCartMove = useCallback(() => {
    cartOffset.setValue(0);
    Animated.timing(cartOffset, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [cartOffset]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [wrongShake]);

  const handleNumberTap = useCallback(
    (n: number) => {
      if (n === count) {
        speak('Correct!');
        triggerCartMove();
        if (roundIndex + 1 >= ROUNDS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setTimeout(() => setRoundIndex((r) => r + 1), 700);
        }
      } else {
        speak('Try again. Count the dots.');
        triggerWrong();
      }
    },
    [count, roundIndex, onComplete, triggerCartMove, triggerWrong]
  );

  if (showSuccess) return <SuccessCelebration variant="sunset" title="Great Job!" subtitle="Shopping maze complete!" />;

  const moveX = cartOffset.interpolate({ inputRange: [0, 1], outputRange: [0, 70] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shopping Cart Dot Maze"
      instruction="Count the dots on the aisle. Tap the number to move the cart."
    >
      <View style={styles.content}>
        <View style={styles.aisleWrap}>
          <View style={styles.aisle}>
            <Text style={styles.dots} numberOfLines={1}>{'• '.repeat(Math.min(count, 10)).trim()}</Text>
            <Animated.View style={[styles.cartWrap, { transform: [{ translateX: moveX }, { translateX: shakeX }] }]}>
              <Text style={styles.cartEmoji}>🛒</Text>
            </Animated.View>
          </View>
        </View>
        <Text style={styles.prompt}>Tap the number of dots:</Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Pressable
              key={n}
              onPress={() => handleNumberTap(n)}
              style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${n}`}
            >
              <Text style={styles.numText}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 24 },
  aisleWrap: { marginBottom: 24 },
  aisle: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4ADE80',
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { fontSize: 24, color: '#166534', letterSpacing: 2, flex: 1 },
  cartWrap: { marginLeft: 8 },
  cartEmoji: { fontSize: 36 },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 18 },
  numbersRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#16A34A' },
});
