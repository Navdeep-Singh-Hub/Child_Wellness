/**
 * Builder Session 7 — Game 3: Pattern Drag Game
 * Complete the visual pattern. Red, Blue, Red, ? → Blue.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'red'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
];
const CORRECT_ID = 'blue';

export interface PatternDragGameProps {
  onComplete: () => void;
}

export function PatternDragGame({ onComplete }: PatternDragGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the pattern. Red, blue, red. What comes next?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Red, blue, red. What is next?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Blue comes next!', 0.75);
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
        badgeEmoji="🔵"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  const patternColors: Record<string, string> = { red: '#EF4444', blue: '#3B82F6', green: '#22C55E' };

  return (
    <GameLayout
      title="Complete the Pattern"
      instruction="Red, blue, red. What comes next?"
      icon="🔁"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((p, i) => (
            <View key={i} style={[styles.patternDot, { backgroundColor: patternColors[p] }]} />
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
              style={({ pressed }) => [styles.optionBtn, { backgroundColor: opt.color }, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
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
  patternDot: { width: 48, height: 48, borderRadius: 24 },
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
    width: 90,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
});
