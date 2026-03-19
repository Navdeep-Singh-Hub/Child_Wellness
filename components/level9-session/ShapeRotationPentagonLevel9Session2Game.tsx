/**
 * Level 9 (Clockwise) — Session 2, Game 3: Shape Rotation
 * Select the rotated pentagon. Options: circle, square, pentagon (normal), pentagon (rotated).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = [
  { id: 'circle', label: 'Circle', symbol: '⭕' },
  { id: 'square', label: 'Square', symbol: '⬜' },
  { id: 'pentagon', label: 'Pentagon', symbol: '⬠', rotated: false },
  { id: 'pentagonRotated', label: 'Pentagon (rotated)', symbol: '⬠', rotated: true },
];
const CORRECT_ID = 'pentagonRotated';

export interface ShapeRotationPentagonLevel9Session2GameProps {
  onComplete: () => void;
}

export function ShapeRotationPentagonLevel9Session2Game({ onComplete }: ShapeRotationPentagonLevel9Session2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Find the rotated pentagon. One pentagon is turned.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Find the pentagon that is rotated.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the rotated pentagon!', 0.75);
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
        subtitle="You found the rotated pentagon!"
        badgeEmoji="⬠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Rotation"
      instruction="Tap the rotated pentagon."
      icon="⬠"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which shape is the rotated pentagon?</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.symbolWrap, opt.rotated && styles.rotatedWrap]}>
                <Text style={styles.symbol}>{opt.symbol}</Text>
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
  prompt: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 88,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  symbolWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  rotatedWrap: { transform: [{ rotate: '72deg' }] },
  symbol: { fontSize: 36 },
  optionLabel: { fontSize: 12, fontWeight: '700', color: '#4338CA', textAlign: 'center' },
});
