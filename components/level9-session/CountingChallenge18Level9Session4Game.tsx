/**
 * Level 9 (Clockwise) — Session 4, Game 1: Counting Challenge
 * Count 18 stars. Tap the correct number.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const STAR_COUNT = 18;
const OPTIONS = [16, 17, 18, 19];

export interface CountingChallenge18Level9Session4GameProps {
  onComplete: () => void;
}

export function CountingChallenge18Level9Session4Game({ onComplete }: CountingChallenge18Level9Session4GameProps) {
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
        speak('Correct! Eighteen stars!', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You counted 18 stars!"
        badgeEmoji="⭐"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Counting Challenge"
      instruction="How many stars? Count them, then tap the correct number."
      icon="⭐"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>How many stars?</Text>
        <View style={styles.starsWrap}>
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
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 16 },
  starsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 24, maxWidth: 280 },
  star: { fontSize: 24 },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    minWidth: 68,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  optionText: { fontSize: 24, fontWeight: '800', color: '#4338CA' },
});
