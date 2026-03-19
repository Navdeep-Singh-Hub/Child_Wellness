/**
 * FairyDotMaze — Game 4: Frog Lily-Pad Maze (1–12)
 * Count dots on lily pads, tap number to make frog hop. Counting range 1–12.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [4, 7, 10, 12, 3, 8]; // counts 1–12

export function FairyDotMaze({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [frogOffset] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));
  const count = ROUNDS[roundIndex];

  useEffect(() => {
    frogOffset.setValue(0);
    speak('Count the lily-pad dots and help the frog hop. How many dots?', 0.75);
  }, [roundIndex]);

  const triggerFrogHop = useCallback(() => {
    frogOffset.setValue(0);
    Animated.timing(frogOffset, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [frogOffset]);

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
        triggerFrogHop();
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
    [count, roundIndex, onComplete, triggerFrogHop, triggerWrong]
  );

  if (showSuccess) return <SuccessCelebration variant="sunset" title="Great Job!" subtitle="Lily-pad maze complete!" />;

  const moveX = frogOffset.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const frogTranslateX = Animated.add(moveX, shakeX);

  return (
    <GameLayout
      title="Frog Lily-Pad Maze"
      instruction="Count the dots on the lily pads. Tap the number to make the frog hop."
    >
      <View style={styles.content}>
        <View style={styles.pondWrap}>
          <View style={styles.pond}>
            <Text style={styles.dots} numberOfLines={1}>{'• '.repeat(Math.min(count, 12)).trim()}</Text>
            <Animated.View style={[styles.frogWrap, { transform: [{ translateX: frogTranslateX }] }]}>
              <Text style={styles.frogEmoji}>🐸</Text>
            </Animated.View>
          </View>
        </View>
        <Text style={styles.prompt}>Tap the number of dots:</Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
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
  pondWrap: { marginBottom: 24 },
  pond: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#16A34A',
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { fontSize: 22, color: '#166534', letterSpacing: 2, flex: 1 },
  frogWrap: { marginLeft: 8 },
  frogEmoji: { fontSize: 36 },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 18 },
  numbersRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333EA',
    borderWidth: 2,
    borderColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#15803d' },
});
