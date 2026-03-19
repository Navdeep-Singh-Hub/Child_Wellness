/**
 * Level 7 Reader — Session 4, Game 2: Shape Rotation
 * Identify the rotated rectangle. Options: circle, square, rectangle (normal), rectangle (rotated).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = [
  { id: 'circle', label: 'Circle', shape: 'circle' as const },
  { id: 'square', label: 'Square', shape: 'square' as const },
  { id: 'rect', label: 'Rectangle', shape: 'rect' as const, rotated: false },
  { id: 'rectRotated', label: 'Rectangle (rotated)', shape: 'rect' as const, rotated: true },
];
const CORRECT_ID = 'rectRotated';

export interface ShapeRotationRectangleReaderSession4GameProps {
  onComplete: () => void;
}

export function ShapeRotationRectangleReaderSession4Game({ onComplete }: ShapeRotationRectangleReaderSession4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Find the rotated rectangle. One rectangle is turned on its side.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Find the rectangle that is rotated.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the rotated rectangle!', 0.75);
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
        subtitle="You found the rotated rectangle!"
        badgeEmoji="▭"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Rotation"
      instruction="Tap the rotated rectangle."
      icon="▭"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which shape is the rotated rectangle?</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <View style={styles.shapeWrap}>
                {opt.shape === 'circle' && <View style={styles.circle} />}
                {opt.shape === 'square' && <View style={styles.square} />}
                {opt.shape === 'rect' && (
                  <View style={[styles.rectangle, opt.rotated && styles.rectangleRotated]} />
                )}
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 24, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  shapeWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1' },
  square: { width: 44, height: 44, backgroundColor: '#818CF8', borderRadius: 8 },
  rectangle: { width: 48, height: 32, backgroundColor: '#6366F1', borderRadius: 6 },
  rectangleRotated: { width: 32, height: 48, backgroundColor: '#6366F1', borderRadius: 6 },
  optionLabel: { fontSize: 13, fontWeight: '700', color: '#4338CA', textAlign: 'center' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
