/**
 * Level 9 (Clockwise) — Session 10, Game 3: Word Builder
 * Letters E, D, U, C, A, T, I, O, N — user builds "EDUCATION".
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET = ['E', 'D', 'U', 'C', 'A', 'T', 'I', 'O', 'N'];
const LETTERS = ['N', 'O', 'E', 'D', 'U', 'C', 'A', 'T', 'I'];

export interface WordBuilderEducationLevel9Session10GameProps {
  onComplete: () => void;
}

export function WordBuilderEducationLevel9Session10Game({ onComplete }: WordBuilderEducationLevel9Session10GameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the word EDUCATION. Tap the letters in order.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap E, D, U, C, A, T, I, O, N.', 0.7);
  }, [wrongShake]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      const expected = TARGET[nextIndex];
      if (letter === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.5);
        if (newIndex >= TARGET.length) {
          speak('Education! You built EDUCATION!', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You built EDUCATION!"
        badgeEmoji="📚"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Word Builder"
      instruction="Tap the letters in order to spell EDUCATION."
      icon="📚"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.wordLabel}>Build: EDUCATION</Text>
        <View style={styles.slotsRow}>
          {TARGET.map((letter, i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotLetter}>{i < nextIndex ? letter : '?'}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.tapLabel}>Tap the next letter</Text>
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
  wordLabel: { fontSize: 16, fontWeight: '800', color: '#4338CA', marginBottom: 14 },
  slotsRow: { flexDirection: 'row', gap: 3, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' },
  slot: {
    width: 34,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#C7D2FE',
    borderWidth: 2,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLetter: { fontSize: 16, fontWeight: '800', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 14 },
  lettersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5 },
  letterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: '#EEF2FF', opacity: 0.9 },
  letterText: { fontSize: 16, fontWeight: '800', color: '#4338CA' },
});
