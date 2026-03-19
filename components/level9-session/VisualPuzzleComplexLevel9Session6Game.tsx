/**
 * Level 9 (Clockwise) — Session 6, Game 1: Visual Puzzle
 * Complete missing part of a complex image. 2x3 grid with one missing piece; pick the piece that completes it.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

// Grid: row1 = circle, square, triangle; row2 = circle, ?, triangle. Middle column should be square (symmetry).
const GRID_TOP = ['⭕', '⬜', '🔺'];
const GRID_BOTTOM_LEFT = '⭕';
const GRID_BOTTOM_RIGHT = '🔺';
const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'square';

export interface VisualPuzzleComplexLevel9Session6GameProps {
  onComplete: () => void;
}

export function VisualPuzzleComplexLevel9Session6Game({ onComplete }: VisualPuzzleComplexLevel9Session6GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the picture. One piece is missing. Which piece fits?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Look at the pattern. Which shape fits in the middle?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! The square completes the picture!', 0.75);
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
        subtitle="You completed the picture!"
        badgeEmoji="🧩"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Visual Puzzle"
      instruction="Complete the image. Which piece fits in the empty space?"
      icon="🧩"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Complete the picture</Text>
        <View style={styles.gridWrap}>
          <View style={styles.gridRow}>
            {GRID_TOP.map((emoji, i) => (
              <View key={i} style={styles.cell}>
                <Text style={styles.cellEmoji}>{emoji}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gridRow}>
            <View style={styles.cell}>
              <Text style={styles.cellEmoji}>{GRID_BOTTOM_LEFT}</Text>
            </View>
            <View style={styles.missingCell}>
              <Text style={styles.questionMark}>?</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellEmoji}>{GRID_BOTTOM_RIGHT}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.tapLabel}>Tap the piece that completes it</Text>
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
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  gridWrap: { marginBottom: 24 },
  gridRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingCell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#A5B4FC',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 28 },
  questionMark: { fontSize: 26, fontWeight: '800', color: '#6366F1' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 88,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  optionEmoji: { fontSize: 36, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
