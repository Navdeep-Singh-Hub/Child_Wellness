/**
 * JungleDotMaze — Game 4: Dot Maze Counting
 * Count the dots (1–6) on the vine, tap the correct number to move the monkey.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [2, 4, 1, 5, 3, 6]; // dot counts 1–6

export function JungleDotMaze({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [monkeyOffset] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));
  const count = ROUNDS[roundIndex];

  useEffect(() => {
    monkeyOffset.setValue(0);
    speak(`Count the dots and move the monkey. How many dots?`, 0.75);
  }, [roundIndex]);

  const triggerMonkeyMove = useCallback(() => {
    monkeyOffset.setValue(0);
    Animated.timing(monkeyOffset, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [monkeyOffset]);

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
        triggerMonkeyMove();
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
    [count, roundIndex, onComplete, triggerMonkeyMove, triggerWrong]
  );

  if (showSuccess) return <SuccessCelebration variant="mint" title="Great Job!" subtitle="Dot maze complete!" />;

  const moveX = monkeyOffset.interpolate({ inputRange: [0, 1], outputRange: [0, 80] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Monkey Dot Maze"
      instruction="Count the dots on the vine. Tap the number to move the monkey."
    >
      <View style={styles.content}>
        <View style={styles.vineWrap}>
          <View style={styles.vine}>
            <Text style={styles.dots}>{'• '.repeat(count).trim()}</Text>
            <Animated.View style={[styles.monkeyWrap, { transform: [{ translateX: moveX }, { translateX: shakeX }] }]}>
              <Text style={styles.monkey}>🐒</Text>
            </Animated.View>
          </View>
        </View>
        <Text style={styles.prompt}>Tap the number of dots:</Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
  vineWrap: { marginBottom: 28 },
  vine: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#22C55E',
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { fontSize: 28, color: '#166534', letterSpacing: 4 },
  monkeyWrap: { marginLeft: 8 },
  monkey: { fontSize: 40 },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  numbersRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
