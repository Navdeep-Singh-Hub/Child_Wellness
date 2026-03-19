/**
 * Level 9 (Clockwise) — Session 4, Game 2: Shape Recognition
 * Select the hexagon. Options: circle, square, triangle, pentagon, hexagon.
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
  { id: 'hexagon', label: 'Hexagon', symbol: '⬡' },
];
const CORRECT_ID = 'hexagon';

export interface ShapeRecognitionHexagonLevel9Session4GameProps {
  onComplete: () => void;
}

export function ShapeRecognitionHexagonLevel9Session4Game({ onComplete }: ShapeRecognitionHexagonLevel9Session4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the hexagon. A hexagon has six sides.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. A hexagon has six sides.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the hexagon!', 0.75);
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
        subtitle="You found the hexagon!"
        badgeEmoji="⬡"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Recognition"
      instruction="Tap the hexagon. It has six sides."
      icon="⬡"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which shape is the hexagon?</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleTap(s.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.symbol}>{s.symbol}</Text>
              <Text style={styles.optionLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 76,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  symbol: { fontSize: 34, marginBottom: 6 },
  optionLabel: { fontSize: 12, fontWeight: '700', color: '#4338CA' },
});
