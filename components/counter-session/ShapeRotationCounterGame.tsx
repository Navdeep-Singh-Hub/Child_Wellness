/**
 * Level 5 Counter — Session 3, Game 1: Shape Rotation
 * Select the rotated triangle. Options: triangle (up), triangle (rotated), square. Correct: rotated triangle.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = [
  { id: 'normal', label: 'Triangle', isRotated: false },
  { id: 'rotated', label: 'Triangle (rotated)', isRotated: true },
  { id: 'square', label: 'Square', isRotated: false },
];

const CORRECT_ID = 'rotated';

export interface ShapeRotationCounterGameProps {
  onComplete: () => void;
}

export function ShapeRotationCounterGame({ onComplete }: ShapeRotationCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Select the rotated triangle. One triangle is turned around.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Find the triangle that is rotated.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the rotated triangle!', 0.75);
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
        subtitle="You found the rotated triangle!"
        badgeEmoji="🔺"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Rotation"
      instruction="Select the rotated triangle."
      icon="🔺"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which triangle is rotated?</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.shapeWrap, opt.id === 'square' && styles.squareWrap]}>
                {opt.id === 'square' ? (
                  <View style={styles.square} />
                ) : (
                  <View style={[styles.triangle, opt.isRotated && styles.triangleRotated]} />
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
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 28, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  optionBtn: {
    minWidth: 110,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  shapeWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  squareWrap: { alignItems: 'center', justifyContent: 'center' },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 48,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0EA5E9',
  },
  triangleRotated: {
    transform: [{ rotate: '180deg' }],
    borderBottomColor: '#0369A1',
  },
  square: {
    width: 44,
    height: 44,
    backgroundColor: '#38BDF8',
    borderRadius: 8,
  },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
