/**
 * Game 3 — Number Recognition: Tap the number 1 (display 1, 2, 4).
 * Instruction: "Tap the number 1." Correct = green glow + star, wrong = gentle shake.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const DEFAULT_NUMBERS = ['1', '2', '4'];
const DEFAULT_CORRECT = '1';

export interface NumberTapGameProps {
  onComplete: () => void;
  numbers?: string[];
  correctNumber?: string;
}

export function NumberTapGame({ onComplete, numbers = DEFAULT_NUMBERS, correctNumber = DEFAULT_CORRECT }: NumberTapGameProps) {
  const voice = `Tap the number ${correctNumber}.`;
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    numbers.reduce((acc, n) => ({ ...acc, [n]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [glowAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(voice, 0.75);
  }, [voice]);

  const triggerShake = useCallback((num: string) => {
    const a = shakeAnims[num];
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
    (num: string) => {
      if (num === correctNumber) {
        speak(`Correct! ${correctNumber}!`);
        triggerGlow();
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak('Try again.');
        triggerShake(num);
      }
    },
    [correctNumber, onComplete, triggerShake, triggerGlow]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle={`You found the number ${correctNumber}!`}
        badgeEmoji="⭐"
      />
    );
  }

  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <GameLayout
      title="Tap the number"
      instruction={voice}
      icon="🔢"
      backgroundVariant="indigo"
    >
      <View style={styles.row}>
        {numbers.map((num) => {
          const shake = shakeAnims[num];
          const isCorrect = num === correctNumber;
          const translateX = shake
            ? shake.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
            : 0;
          const scale = isCorrect ? glowScale : 1;
          return (
            <Animated.View
              key={num}
              style={[styles.wrap, { transform: [{ translateX }, { scale }] }]}
            >
              <Pressable
                onPress={() => handleTap(num)}
                style={({ pressed }) => [
                  styles.numBtn,
                  isCorrect && styles.numBtnCorrect,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={`Number ${num}`}
              >
                <Text style={[styles.num, isCorrect && styles.numCorrect]}>{num}</Text>
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
  numBtn: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    borderWidth: 4,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnCorrect: { borderColor: '#4F46E5', backgroundColor: '#C7D2FE' },
  num: { fontSize: 42, fontWeight: '800', color: '#3730A3' },
  numCorrect: { color: '#4F46E5' },
  pressed: { opacity: 0.9 },
});
