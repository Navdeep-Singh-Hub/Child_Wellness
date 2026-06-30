/**
 * Builder Session 1 — Game 2: Shape Recognition
 * Show circle, square, triangle. Prompt: "Tap the circle".
 * Large touch-friendly shapes, confetti + sound on success.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SHAPES = [
  { id: 'circle', label: 'Circle', shape: 'circle' as const },
  { id: 'square', label: 'Square', shape: 'square' as const },
  { id: 'triangle', label: 'Triangle', shape: 'triangle' as const },
];

const CORRECT_ID = 'circle';

export interface ShapeRecognitionGameProps {
  onComplete: () => void;
}

export function ShapeRecognitionGame({ onComplete }: ShapeRecognitionGameProps) {
  const prompt = 'Tap the circle.';
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
    speak('Try again. Tap the circle!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the circle!', 0.75);
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
        subtitle="You found the circle!"
        badgeEmoji="⭕"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Recognition"
      instruction={prompt}
      icon="⭕"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the circle</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleTap(s.id)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityLabel={s.label}
            >
              <View style={[styles.shapeWrap, s.shape === 'circle' && styles.circle, s.shape === 'square' && styles.square, s.shape === 'triangle' && styles.triangle]} />
              <Text style={styles.label}>{s.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const shapeSize = 72;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 28,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 24, flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: { opacity: 0.9 },
  shapeWrap: {
    width: shapeSize,
    height: shapeSize,
    marginBottom: 12,
  },
  circle: {
    borderRadius: shapeSize / 2,
    backgroundColor: '#8B5CF6',
    width: shapeSize,
    height: shapeSize,
  },
  square: {
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    width: shapeSize,
    height: shapeSize,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: shapeSize / 2,
    borderRightWidth: shapeSize / 2,
    borderBottomWidth: shapeSize,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#10B981',
  },
  label: { fontSize: 16, fontWeight: '800', color: '#374151' },
});
