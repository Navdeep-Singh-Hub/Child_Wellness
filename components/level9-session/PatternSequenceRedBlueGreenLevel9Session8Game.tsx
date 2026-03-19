/**
 * Level 9 (Clockwise) — Session 8, Game 1: Pattern Sequence
 * Red, blue, green, red, blue, ? → Green (repeating: red, blue, green).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'green', 'red', 'blue'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
];
const CORRECT_ID = 'green';

const COLOR_MAP: Record<string, string> = { red: '#EF4444', blue: '#3B82F6', green: '#22C55E' };

export interface PatternSequenceRedBlueGreenLevel9Session8GameProps {
  onComplete: () => void;
}

export function PatternSequenceRedBlueGreenLevel9Session8Game({ onComplete }: PatternSequenceRedBlueGreenLevel9Session8GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What comes next? Red, blue, green, red, blue. Tap the next color.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Red, blue, green — then repeat. What comes next?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Green comes next!', 0.75);
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
        subtitle="You spotted the pattern!"
        badgeEmoji="🟢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Pattern Sequence"
      instruction="Red, blue, green, red, blue. What comes next?"
      icon="🔴"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: COLOR_MAP[id] }]} />
          ))}
          <View style={styles.questionDot} />
        </View>
        <Text style={styles.tapLabel}>Tap the next color</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, { borderColor: opt.color }, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
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
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 36, height: 36, borderRadius: 18 },
  questionDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#C7D2FE', borderWidth: 3, borderColor: '#818CF8', borderStyle: 'dashed' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 88,
  },
  pressed: { opacity: 0.9 },
  optionDot: { width: 32, height: 32, borderRadius: 16, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
