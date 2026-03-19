/**
 * Builder Session 8 — Game 3: Letter Puzzle
 * Arrange letters to form SUN. Tap letters in order: S, then U, then N.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET = ['S', 'U', 'N'];
const LETTERS = ['S', 'N', 'U']; // shuffled

export interface LetterPuzzleGameProps {
  onComplete: () => void;
}

export function LetterPuzzleGame({ onComplete }: LetterPuzzleGameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Spell the word SUN. Tap the letters in order: S, then U, then N.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap S first, then U, then N.', 0.7);
  }, [wrongShake]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      const expected = TARGET[nextIndex];
      if (letter === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.6);
        if (newIndex >= TARGET.length) {
          speak('Sun! You spelled SUN!', 0.75);
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
        variant="mint"
        title="Great Job!"
        subtitle="You spelled SUN!"
        badgeEmoji="☀️"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Letter Puzzle"
      instruction="Tap the letters in order to spell SUN."
      icon="☀️"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.wordLabel}>Spell: SUN</Text>
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
  wordLabel: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 16 },
  slotsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  slot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    borderWidth: 3,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLetter: { fontSize: 28, fontWeight: '800', color: '#5B21B6' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  lettersRow: { flexDirection: 'row', gap: 20 },
  letterBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontSize: 32, fontWeight: '800', color: '#5B21B6' },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
});
