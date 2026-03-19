/**
 * Builder Session 9 — Game 4: Shape Identification
 * Select rectangle. Show circle, square, rectangle, triangle; correct is rectangle.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SHAPES = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'rectangle', label: 'Rectangle', emoji: '▭' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];

const CORRECT_ID = 'rectangle';

export interface ShapeIdentificationGameProps {
  onComplete: () => void;
}

export function ShapeIdentificationGame({ onComplete }: ShapeIdentificationGameProps) {
  const prompt = 'Select the rectangle.';
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(prompt, 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the rectangle. It is longer than it is tall.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You selected the rectangle!', 0.75);
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
        subtitle="You found the rectangle!"
        badgeEmoji="▭"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Identification"
      instruction={prompt}
      icon="▭"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Select the rectangle</Text>
        <Animated.View style={[styles.shapesRow, { transform: [{ translateX: shakeX }] }]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleTap(s.id)}
              style={({ pressed }) => [styles.shapeBtn, pressed && styles.pressed]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.shapeEmoji}>{s.emoji}</Text>
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
  prompt: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 28, textAlign: 'center' },
  shapesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  shapeBtn: {
    width: 88,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  shapeEmoji: { fontSize: 36, marginBottom: 6 },
  shapeLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
});
