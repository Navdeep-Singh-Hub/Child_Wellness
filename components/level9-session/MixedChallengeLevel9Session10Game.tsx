/**
 * Level 9 (Clockwise) — Session 10, Game 1: Mixed Challenge
 * Identify shapes, colors, and numbers (one question per type).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type QuestionType = 'shape' | 'color' | 'number';

const QUESTIONS: { type: QuestionType; prompt: string; options: { id: string; label: string; emoji?: string; color?: string }[]; correctId: string }[] = [
  {
    type: 'shape',
    prompt: 'Which shape is a triangle?',
    options: [
      { id: 'circle', label: 'Circle', emoji: '⭕' },
      { id: 'square', label: 'Square', emoji: '⬜' },
      { id: 'triangle', label: 'Triangle', emoji: '🔺' },
    ],
    correctId: 'triangle',
  },
  {
    type: 'color',
    prompt: 'Which color is BLUE?',
    options: [
      { id: 'red', label: 'Red', color: '#EF4444' },
      { id: 'blue', label: 'Blue', color: '#3B82F6' },
      { id: 'green', label: 'Green', color: '#22C55E' },
    ],
    correctId: 'blue',
  },
  {
    type: 'number',
    prompt: 'How many stars?',
    options: [
      { id: '7', label: '7' },
      { id: '8', label: '8' },
      { id: '9', label: '9' },
      { id: '10', label: '10' },
    ],
    correctId: '8',
  },
];

export interface MixedChallengeLevel9Session10GameProps {
  onComplete: () => void;
}

export function MixedChallengeLevel9Session10Game({ onComplete }: MixedChallengeLevel9Session10GameProps) {
  const [qIndex, setQIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  const q = QUESTIONS[qIndex];

  useEffect(() => {
    speak(q.prompt, 0.75);
  }, [qIndex]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. ' + q.prompt, 0.7);
  }, [wrongShake, q.prompt]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === q.correctId) {
        speak('Correct!', 0.6);
        if (qIndex + 1 >= QUESTIONS.length) {
          speak('You got them all! Shapes, colors, and numbers!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setQIndex((i) => i + 1);
        }
      } else {
        triggerWrong();
      }
    },
    [q, qIndex, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You identified shapes, colors, and numbers!"
        badgeEmoji="🎯"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Mixed Challenge"
      instruction="Identify shapes, colors, and numbers."
      icon="🎯"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.progress}>Question {qIndex + 1} of {QUESTIONS.length}</Text>
        <Text style={styles.prompt}>{q.prompt}</Text>
        {q.type === 'number' ? (
          <View style={styles.starsWrap}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Text key={i} style={styles.star}>⭐</Text>
            ))}
          </View>
        ) : null}
        <Text style={styles.tapLabel}>Tap your answer</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {q.options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [
                styles.optionBtn,
                opt.color ? { borderColor: opt.color } : undefined,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={opt.label}
            >
              {opt.emoji ? <Text style={styles.optionEmoji}>{opt.emoji}</Text> : null}
              {opt.color ? <View style={[styles.colorDot, { backgroundColor: opt.color }]} /> : null}
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
  progress: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 12 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  starsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 20 },
  star: { fontSize: 32 },
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
    minWidth: 80,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  optionEmoji: { fontSize: 40, marginBottom: 6 },
  colorDot: { width: 36, height: 36, borderRadius: 18, marginBottom: 8 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#4338CA' },
});
