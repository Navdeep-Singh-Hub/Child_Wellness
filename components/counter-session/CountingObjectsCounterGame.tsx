/**
 * Level 5 Counter — Session 6, Game 2: Counting Objects
 * Count 9 apples; user taps the correct number (options 7, 8, 9, 10).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const APPLE_COUNT = 9;
const OPTIONS = [7, 8, 9, 10];

export interface CountingObjectsCounterGameProps {
  onComplete: () => void;
}

export function CountingObjectsCounterGame({ onComplete }: CountingObjectsCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('How many apples? Count the apples, then tap the number.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Count the apples carefully.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === APPLE_COUNT) {
        speak('Correct! Nine apples!', 0.75);
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
        subtitle="You counted 9 apples!"
        badgeEmoji="🍎"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Counting Objects"
      instruction="How many apples? Tap the correct number."
      icon="🍎"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>How many apples?</Text>
        <View style={styles.applesWrap}>
          {Array.from({ length: APPLE_COUNT }, (_, i) => (
            <Text key={i} style={styles.apple}>🍎</Text>
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
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16 },
  applesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 220, marginBottom: 24 },
  apple: { fontSize: 32 },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 12 },
  optionsRow: { flexDirection: 'row', gap: 16 },
  optionBtn: {
    minWidth: 64,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  optionText: { fontSize: 28, fontWeight: '800', color: '#0C4A6E' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
