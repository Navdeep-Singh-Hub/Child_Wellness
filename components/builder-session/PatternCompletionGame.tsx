/**
 * Builder Session 4 — Game 3: Pattern Completion
 * Complete the pattern: circle, square, circle, ?
 * Options: circle, square, triangle. Correct: square.
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

export interface PatternCompletionGameProps {
  onComplete: () => void;
}

export function PatternCompletionGame({ onComplete }: PatternCompletionGameProps) {
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
    speak('Try again. Look at the pattern: circle, square, circle.', 0.7);
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
        badgeEmoji="⬜"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  const patternEmoji: Record<string, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };

  return (
    <GameLayout
      title="Pattern Completion"
      instruction="Circle, square, circle. What comes next?"
      icon="🔁"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((p, i) => (
            <Text key={i} style={styles.patternItem}>{patternEmoji[p]}</Text>
          ))}
          <Text style={styles.question}>?</Text>
        </View>
        <Text style={styles.chooseLabel}>Tap what comes next</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
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
  patternItem: { fontSize: 44 },
  question: { fontSize: 36, fontWeight: '800', color: '#8B5CF6', marginLeft: 4 },
  chooseLabel: { fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  optionCard: {
    width: 90,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
  optionEmoji: { fontSize: 40, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
});
