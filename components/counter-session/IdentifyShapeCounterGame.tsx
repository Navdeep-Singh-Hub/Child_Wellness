/**
 * Level 5 Counter — Session 9, Game 4: Identify Shape
 * Tap the pentagon. Shapes: circle, square, triangle, pentagon. Correct: pentagon.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SHAPES = [
  { id: 'circle', label: 'Circle', symbol: '⭕' },
  { id: 'square', label: 'Square', symbol: '⬜' },
  { id: 'triangle', label: 'Triangle', symbol: '🔺' },
  { id: 'pentagon', label: 'Pentagon', symbol: '⬠' },
];
const CORRECT_ID = 'pentagon';

export interface IdentifyShapeCounterGameProps {
  onComplete: () => void;
}

export function IdentifyShapeCounterGame({ onComplete }: IdentifyShapeCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the pentagon. Find the shape with five sides.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. A pentagon has five sides.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the pentagon!', 0.75);
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
        subtitle="You found the pentagon!"
        badgeEmoji="⬠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Identify Shape"
      instruction="Tap the pentagon."
      icon="⬠"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the pentagon</Text>
        <Animated.View style={[styles.shapesRow, { transform: [{ translateX: shakeX }] }]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleTap(s.id)}
              style={({ pressed }) => [styles.shapeBtn, pressed && styles.pressed]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.shapeSymbol}>{s.symbol}</Text>
              <Text style={styles.shapeLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 24 },
  shapesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  shapeBtn: {
    minWidth: 88,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  shapeSymbol: { fontSize: 40, marginBottom: 8 },
  shapeLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
