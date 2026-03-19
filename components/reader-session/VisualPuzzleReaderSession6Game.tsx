/**
 * Level 7 Reader — Session 6, Game 1: Visual Puzzle
 * Complete half of a picture. Show half-circle, user selects the shape that completes it (circle).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'circle';

export interface VisualPuzzleReaderSession6GameProps {
  onComplete: () => void;
}

export function VisualPuzzleReaderSession6Game({ onComplete }: VisualPuzzleReaderSession6GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the picture. This is half of a shape. Which shape completes it?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Look at the half shape. What whole shape does it make?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! A circle completes the picture!', 0.75);
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
      instruction="Complete the picture. Which shape fits the half?"
      icon="🧩"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Complete the picture</Text>
        <View style={styles.halfPictureWrap}>
          <View style={styles.halfCircle} />
          <View style={styles.missingHalf} />
        </View>
        <Text style={styles.tapLabel}>Tap the shape that completes it</Text>
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
  halfPictureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 80,
  },
  halfCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#6366F1',
    borderRightWidth: 0,
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  missingHalf: {
    width: 40,
    height: 80,
    borderWidth: 4,
    borderColor: '#C7D2FE',
    borderLeftWidth: 0,
    borderStyle: 'dashed',
    marginLeft: -2,
  },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 42, marginBottom: 8 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#4338CA' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
