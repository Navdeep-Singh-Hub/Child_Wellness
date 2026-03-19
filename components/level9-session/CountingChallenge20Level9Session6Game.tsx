/**
 * Level 9 (Clockwise) — Session 6, Game 4: Counting Challenge
 * Count 20 objects. Tap the correct number.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OBJECT_COUNT = 20;
const OPTIONS = [18, 19, 20, 21];

export interface CountingChallenge20Level9Session6GameProps {
  onComplete: () => void;
}

export function CountingChallenge20Level9Session6Game({ onComplete }: CountingChallenge20Level9Session6GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('How many objects? Count them, then tap the number.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Count the objects carefully.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === OBJECT_COUNT) {
        speak('Correct! Twenty objects!', 0.75);
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
        subtitle="You counted 20 objects!"
        badgeEmoji="🔵"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Counting Challenge"
      instruction="How many objects? Count them, then tap the correct number."
      icon="🔵"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>How many objects?</Text>
        <View style={styles.objectsWrap}>
          {Array.from({ length: OBJECT_COUNT }, (_, i) => (
            <View key={i} style={styles.dot} />
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
  objectsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 24, maxWidth: 300 },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#6366F1' },
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
