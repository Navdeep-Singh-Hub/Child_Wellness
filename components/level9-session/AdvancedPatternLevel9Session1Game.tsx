/**
 * Level 9 (Clockwise) — Session 1, Game 1: Advanced Pattern
 * triangle, square, circle, triangle, square, ? → circle
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['triangle', 'square', 'circle', 'triangle', 'square'];
const OPTIONS = [
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'circle', label: 'Circle', emoji: '⭕' },
];
const CORRECT_ID = 'circle';

const SHAPE_EMOJI: Record<string, string> = { triangle: '🔺', square: '⬜', circle: '⭕' };

export interface AdvancedPatternLevel9Session1GameProps {
  onComplete: () => void;
}

export function AdvancedPatternLevel9Session1Game({ onComplete }: AdvancedPatternLevel9Session1GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the pattern. Triangle, square, circle, triangle, square. What comes next?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Triangle, square, circle, then triangle, square.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Circle comes next!', 0.75);
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
        subtitle="You completed the pattern!"
        badgeEmoji="🔺"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Advanced Pattern"
      instruction="Triangle, square, circle, triangle, square. What comes next?"
      icon="🔺"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <Text key={i} style={styles.patternEmoji}>{SHAPE_EMOJI[id]}</Text>
          ))}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>
        <Text style={styles.tapLabel}>Tap the next shape</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
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
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 16 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  patternEmoji: { fontSize: 36 },
  questionBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 22, fontWeight: '800', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 90,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  optionEmoji: { fontSize: 38, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
