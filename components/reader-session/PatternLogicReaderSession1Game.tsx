/**
 * Level 7 Reader — Session 1, Game 1: Pattern Logic
 * Sequence: square, circle, triangle, square, circle, ? → triangle.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['square', 'circle', 'triangle', 'square', 'circle'];
const OPTIONS = [
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'triangle';

const SHAPE_EMOJI: Record<string, string> = { square: '⬜', circle: '⭕', triangle: '🔺' };

export interface PatternLogicReaderSession1GameProps {
  onComplete: () => void;
}

export function PatternLogicReaderSession1Game({ onComplete }: PatternLogicReaderSession1GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the pattern. Square, circle, triangle, square, circle. What comes next?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Square, circle, triangle, square, circle.', 0.7);
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
      title="Pattern Logic"
      instruction="Square, circle, triangle, square, circle. What comes next?"
      icon="🧩"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <View key={i} style={styles.patternItem}>
              <Text style={styles.patternEmoji}>{SHAPE_EMOJI[id]}</Text>
            </View>
          ))}
          <View style={styles.patternItem}>
            <Text style={styles.question}>?</Text>
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
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  patternRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  patternItem: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 3,
    borderColor: 'rgba(99,102,241,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternEmoji: { fontSize: 30 },
  question: { fontSize: 26, fontWeight: '800', color: '#64748B' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 110,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(99,102,241,0.55)',
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 40, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: 'rgba(99,102,241,0.10)' },
});

