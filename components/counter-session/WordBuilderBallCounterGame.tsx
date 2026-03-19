/**
 * Level 5 Counter — Session 1, Game 3: Word Builder
 * Letters B, A, L, L — user taps letters in order to build "BALL".
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET = ['B', 'A', 'L', 'L'];
const LETTERS = ['B', 'L', 'A', 'L'];

export interface WordBuilderBallCounterGameProps {
  onComplete: () => void;
}

export function WordBuilderBallCounterGame({ onComplete }: WordBuilderBallCounterGameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the word BALL. Tap the letters in order: B, A, L, L.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap B, then A, then L, then L.', 0.7);
  }, [wrongShake]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      const expected = TARGET[nextIndex];
      if (letter === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.6);
        if (newIndex >= TARGET.length) {
          speak('Ball! You built BALL!', 0.75);
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
        subtitle="You built BALL!"
        badgeEmoji="⚽"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Word Builder"
      instruction="Tap the letters in order to spell BALL."
      icon="⚽"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.wordLabel}>Build: BALL</Text>
        <View style={styles.slotsRow}>
          {TARGET.map((letter, i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotLetter}>{i < nextIndex ? letter : '?'}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.tapLabel}>Tap the letters in order</Text>
        <Animated.View style={[styles.lettersRow, { transform: [{ translateX: shakeX }] }]}>
          {LETTERS.map((letter, i) => (
            <Pressable
              key={`${letter}-${i}`}
              onPress={() => handleLetterTap(letter)}
              style={({ pressed }) => [styles.letterBtn, pressed && styles.pressed]}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  wordLabel: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16 },
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
  slotLetter: { fontSize: 26, fontWeight: '800', color: '#0C4A6E' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  lettersRow: { flexDirection: 'row', gap: 16 },
  letterBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontSize: 28, fontWeight: '800', color: '#0C4A6E' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
