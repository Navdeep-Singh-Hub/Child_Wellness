/**
 * Builder Session 10 — Game 4: Drag Pattern Game
 * Complete the pattern sequence. Circle, Square, Circle, ? → Square.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['circle', 'square', 'circle'];
const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'square';

export interface DragPatternGameProps {
  onComplete: () => void;
}

export function DragPatternGame({ onComplete }: DragPatternGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the pattern. Circle, square, circle. What comes next?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Circle, square, circle. What is next?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Square comes next!', 0.75);
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
        subtitle="You completed the pattern!"
        badgeEmoji="🔁"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const patternEmoji: Record<string, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };

  return (
    <GameLayout
      title="Complete the Pattern"
      instruction="Circle, square, circle. What comes next?"
      icon="🔁"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((p, i) => (
            <View key={i} style={styles.patternDot}>
              <Text style={styles.patternEmoji}>{patternEmoji[p]}</Text>
            </View>
          ))}
          <View style={styles.questionDot}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>
        <Text style={styles.chooseLabel}>Tap what comes next</Text>
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
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  patternDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternEmoji: { fontSize: 28 },
  questionDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 24, fontWeight: '800', color: '#9CA3AF' },
  chooseLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 16 },
  optionBtn: {
    width: 88,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 32, marginBottom: 4 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
});
