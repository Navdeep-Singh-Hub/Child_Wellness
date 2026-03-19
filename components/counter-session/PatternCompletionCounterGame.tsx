/**
 * Level 5 Counter — Session 1, Game 1: Pattern Completion
 * Pattern: circle, square, triangle, circle, square, ? → user selects correct shape (triangle).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['circle', 'square', 'triangle', 'circle', 'square'];
const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'triangle';

const SHAPE_EMOJI: Record<string, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };

export interface PatternCompletionCounterGameProps {
  onComplete: () => void;
}

export function PatternCompletionCounterGame({ onComplete }: PatternCompletionCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the pattern. Circle, square, triangle, circle, square. What comes next?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Look at the pattern: circle, square, triangle, circle, square.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Triangle comes next!', 0.75);
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
        subtitle="You completed the pattern!"
        badgeEmoji="🔺"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Pattern Completion"
      instruction="Circle, square, triangle, circle, square. What comes next?"
      icon="🔁"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((p, i) => (
            <View key={i} style={styles.shapeDot}>
              <Text style={styles.shapeEmoji}>{SHAPE_EMOJI[p]}</Text>
            </View>
          ))}
          <View style={styles.questionDot}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>
        <Text style={styles.chooseLabel}>Tap the correct shape</Text>
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
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' },
  shapeDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeEmoji: { fontSize: 24 },
  questionDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 22, fontWeight: '800', color: '#0C4A6E' },
  chooseLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 16 },
  optionBtn: {
    minWidth: 96,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 36, marginBottom: 6 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
