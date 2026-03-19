/**
 * Level 5 Counter — Session 7, Game 2: Bigger or Smaller
 * Select the smaller object. Two circles: one big, one small; user taps the smaller.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_ID = 'small';

export interface BiggerOrSmallerCounterGameProps {
  onComplete: () => void;
}

export function BiggerOrSmallerCounterGame({ onComplete }: BiggerOrSmallerCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the smaller object. Which one is smaller?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Look for the smaller circle.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That one is smaller!', 0.75);
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
        subtitle="You found the smaller one!"
        badgeEmoji="🔵"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Bigger or Smaller"
      instruction="Tap the smaller object."
      icon="⚖️"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which one is smaller?</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          <Pressable
            onPress={() => handleTap('big')}
            style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
            accessibilityLabel="Big circle"
          >
            <View style={[styles.circle, styles.circleBig]} />
          </Pressable>
          <Pressable
            onPress={() => handleTap('small')}
            style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
            accessibilityLabel="Small circle"
          >
            <View style={[styles.circle, styles.circleSmall]} />
          </Pressable>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 28 },
  optionsRow: { flexDirection: 'row', gap: 32, alignItems: 'center' },
  optionBtn: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
  },
  circle: { backgroundColor: '#3B82F6', borderRadius: 999 },
  circleBig: { width: 72, height: 72 },
  circleSmall: { width: 40, height: 40 },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
