/**
 * Game 1 — Find the Letter: Tap the correct letter (A among A, B, D).
 * AAC-friendly: large letters, audio "Tap the letter A", green glow + star on correct, gentle shake on wrong.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const DEFAULT_LETTERS = ['A', 'B', 'D'];
const DEFAULT_CORRECT = 'A';

export interface LetterTapGameProps {
  onComplete: () => void;
  /** Letters shown (e.g. ['A','B','D'] or ['C','G','O']) */
  letters?: string[];
  /** Correct letter to tap */
  correctLetter?: string;
}

export function LetterTapGame({ onComplete, letters = DEFAULT_LETTERS, correctLetter = DEFAULT_CORRECT }: LetterTapGameProps) {
  const voice = `Tap the letter ${correctLetter}.`;
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    letters.reduce((acc, l) => ({ ...acc, [l]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [glowAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(voice, 0.75);
  }, [voice]);

  const triggerShake = useCallback((letter: string) => {
    const a = shakeAnims[letter];
    if (!a) return;
    a.setValue(0);
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerGlow = useCallback(() => {
    glowAnim.setValue(0);
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [glowAnim]);

  const handleTap = useCallback(
    (letter: string) => {
      if (letter === correctLetter) {
        speak('Correct!');
        triggerGlow();
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak('Try again.');
        triggerShake(letter);
      }
    },
    [correctLetter, onComplete, triggerShake, triggerGlow]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle={`You found the letter ${correctLetter}!`}
        badgeEmoji="⭐"
      />
    );
  }

  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <GameLayout
      title="Tap the correct letter"
      instruction={voice}
      icon="🔤"
      backgroundVariant="indigo"
    >
      <View style={styles.row}>
        {letters.map((letter) => {
          const shake = shakeAnims[letter];
          const isCorrect = letter === correctLetter;
          const translateX = shake
            ? shake.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
            : 0;
          const scale = isCorrect ? glowScale : 1;
          return (
            <Animated.View
              key={letter}
              style={[
                styles.wrap,
                isCorrect && styles.wrapCorrect,
                { transform: [{ translateX }, { scale }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(letter)}
                style={({ pressed }) => [
                  styles.letterBtn,
                  isCorrect && styles.letterBtnCorrect,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={`Letter ${letter}`}
              >
                <Text style={[styles.letter, isCorrect && styles.letterCorrect]}>{letter}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
  },
  wrap: {},
  wrapCorrect: {},
  letterBtn: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    borderWidth: 4,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBtnCorrect: {
    borderColor: '#4F46E5',
    backgroundColor: '#C7D2FE',
  },
  letter: {
    fontSize: 42,
    fontWeight: '800',
    color: '#3730A3',
  },
  letterCorrect: {
    color: '#4F46E5',
  },
  pressed: { opacity: 0.9 },
});
