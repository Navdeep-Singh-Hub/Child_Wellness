/**
 * Level 9 (Clockwise) — Session 1, Game 3: Word Builder
 * Letters B, R, I, D, G, E — user builds "BRIDGE".
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET = ['B', 'R', 'I', 'D', 'G', 'E'];
const LETTERS = ['E', 'B', 'R', 'I', 'D', 'G'];

export interface WordBuilderBridgeLevel9Session1GameProps {
  onComplete: () => void;
}

export function WordBuilderBridgeLevel9Session1Game({ onComplete }: WordBuilderBridgeLevel9Session1GameProps) {
  const [nextIndex, setNextIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the word BRIDGE. Tap the letters in order: B, R, I, D, G, E.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap B, then R, then I, then D, then G, then E.', 0.7);
  }, [wrongShake]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      const expected = TARGET[nextIndex];
      if (letter === expected) {
        const newIndex = nextIndex + 1;
        setNextIndex(newIndex);
        speak(letter, 0.6);
        if (newIndex >= TARGET.length) {
          speak('Bridge! You built BRIDGE!', 0.75);
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
        subtitle="You built BRIDGE!"
        badgeEmoji="🌉"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Word Builder"
      instruction="Tap the letters in order to spell BRIDGE."
      icon="🌉"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.wordLabel}>Build: BRIDGE</Text>
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
  wordLabel: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 16 },
  slotsRow: { flexDirection: 'row', gap: 6, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  slot: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLetter: { fontSize: 24, fontWeight: '800', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  lettersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  letterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: '#EEF2FF', opacity: 0.9 },
  letterText: { fontSize: 22, fontWeight: '800', color: '#4338CA' },
});
