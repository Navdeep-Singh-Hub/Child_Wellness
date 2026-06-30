/**
 * Builder Session 9 — Game 2: Counting Game
 * Count the stars. Show 4 stars; options 3, 4, 5. Correct: 4.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const STAR_COUNT = 4;
const OPTIONS = [3, 4, 5];

export interface CountingGameProps {
  onComplete: () => void;
}

export function CountingGame({ onComplete }: CountingGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('How many stars? Count the stars, then tap the number.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Count the stars carefully.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === STAR_COUNT) {
        speak('Correct! Four stars!', 0.75);
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
        variant="mint"
        title="Great Job!"
        subtitle="You counted the stars!"
        badgeEmoji="⭐"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Counting Game"
      instruction="How many stars? Tap the correct number."
      icon="⭐"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>How many stars?</Text>
        <View style={styles.starsRow}>
          {Array.from({ length: STAR_COUNT }, (_, i) => (
            <Text key={i} style={styles.star}>⭐</Text>
          ))}
        </View>
        <Text style={styles.tapLabel}>Tap the number</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
            >
              <Text style={styles.optionText}>{num}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  star: { fontSize: 40 },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 24 },
  optionBtn: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { fontSize: 36, fontWeight: '800', color: '#5B21B6' },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
});
