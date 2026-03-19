/**
 * Level 7 Reader — Session 7, Game 3: Word Builder
 * Letters C, H, A, I, R — user taps letters in order to build "CHAIR".
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET = ['C', 'H', 'A', 'I', 'R'];
const LETTERS = ['R', 'C', 'A', 'I', 'H'];

export interface WordBuilderChairReaderSession7GameProps {
  onComplete: () => void;
}

export function WordBuilderChairReaderSession7Game({ onComplete }: WordBuilderChairReaderSession7GameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the word CHAIR. Tap the letters in order: C, H, A, I, R.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap C, then H, then A, then I, then R.', 0.7);
  }, [wrongShake]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      const expected = TARGET[nextIndex];
      if (letter === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.6);
        if (newIndex >= TARGET.length) {
          speak('Chair! You built CHAIR!', 0.75);
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
        subtitle="You built CHAIR!"
        badgeEmoji="🪑"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Word Builder"
      instruction="Tap the letters in order to spell CHAIR."
      icon="🪑"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.wordLabel}>Build: CHAIR</Text>
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
  wordLabel: { fontSize: 22, fontWeight: '800', color: '#4338CA', marginBottom: 16 },
  slotsRow: { flexDirection: 'row', gap: 10, marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap' },
  slot: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 4,
    borderColor: 'rgba(99,102,241,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLetter: { fontSize: 26, fontWeight: '800', color: '#312E81' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  lettersRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  letterBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(99,102,241,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontSize: 28, fontWeight: '800', color: '#312E81' },
  pressed: { opacity: 0.9, backgroundColor: 'rgba(99,102,241,0.10)' },
});
