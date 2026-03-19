/**
 * Level 5 Counter — Session 7, Game 3: Letter Match
 * Match uppercase with lowercase. Show "A", options: a, b, c. Correct: a.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const UPPER = 'A';
const OPTIONS = [
  { id: 'a', letter: 'a', isCorrect: true },
  { id: 'b', letter: 'b', isCorrect: false },
  { id: 'c', letter: 'c', isCorrect: false },
];
const CORRECT_ID = 'a';

export interface LetterMatchCounterGameProps {
  onComplete: () => void;
}

export function LetterMatchCounterGame({ onComplete }: LetterMatchCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match uppercase A with the lowercase letter. Tap the small a.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Big A matches small a.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Big A and small a match!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You matched the letters!"
        badgeEmoji="🔤"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Letter Match"
      instruction="Match uppercase with lowercase. Tap the small letter that goes with big A."
      icon="🔤"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which lowercase letter matches?</Text>
        <View style={styles.upperBox}>
          <Text style={styles.upperLetter}>{UPPER}</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the matching lowercase letter</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={`Letter ${opt.letter}`}
            >
              <Text style={styles.optionLetter}>{opt.letter}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#0369A1', marginBottom: 16 },
  upperBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  upperLetter: { fontSize: 48, fontWeight: '800', color: '#0C4A6E' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 20 },
  optionBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: { fontSize: 36, fontWeight: '800', color: '#0C4A6E' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
