/**
 * Builder Session 3 — Game 3: Drag Letters (Build word DOG)
 * Tap letters in order: D, then O, then G.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGET_WORD = 'DOG';
const LETTERS = ['D', 'O', 'G'];

export interface DragLettersGameProps {
  onComplete: () => void;
}

export function DragLettersGame({ onComplete }: DragLettersGameProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the letters in order to spell DOG. D, then O, then G.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Tap D first, then O, then G.', 0.7);
  }, [wrongShake]);

  const nextIndex = slots.findIndex((s) => s === null);
  const expectedLetter = nextIndex >= 0 ? TARGET_WORD[nextIndex] : null;

  const handleLetterTap = useCallback(
    (letter: string) => {
      if (nextIndex < 0) return;
      if (letter !== expectedLetter) {
        triggerWrong();
        return;
      }
      const next = [...slots];
      next[nextIndex] = letter;
      setSlots(next);
      speak(letter, 0.7);
      if (nextIndex === 2) {
        speak('DOG! Great job!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [slots, nextIndex, expectedLetter, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You spelled DOG!"
        badgeEmoji="🐕"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Build DOG"
      instruction="Tap the letters in order: D, then O, then G."
      icon="🐕"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Spell DOG</Text>
        <Animated.View style={[styles.slotsRow, { transform: [{ translateX: shakeX }] }]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotLetter}>{slots[i] ?? '?'}</Text>
            </View>
          ))}
        </Animated.View>
        <Text style={styles.lettersLabel}>Tap in order</Text>
        <View style={styles.lettersRow}>
          {LETTERS.map((letter) => (
            <Pressable
              key={letter}
              onPress={() => handleLetterTap(letter)}
              style={({ pressed }) => [styles.letterBtn, pressed && styles.pressed]}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
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
  slotLetter: { fontSize: 36, fontWeight: '800', color: '#5B21B6' },
  lettersLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  lettersRow: { flexDirection: 'row', gap: 24 },
  letterBtn: {
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
  letterText: { fontSize: 40, fontWeight: '800', color: '#5B21B6' },
});
