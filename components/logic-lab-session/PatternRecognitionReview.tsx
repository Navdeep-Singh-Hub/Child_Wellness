/**
 * Game 3 — Complete the pattern. Two rounds: 🟥🟩🟥🟩__ → 🟥, then ⭐🌙⭐🌙__ → ⭐. Session 7: Mixed Prepositions Review.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS: {
  pattern: string[];
  correct: string;
  choices: { emoji: string; id: string }[];
  voice: string;
}[] = [
  {
    pattern: ['🟥', '🟩', '🟥', '🟩'],
    correct: '🟥',
    choices: [{ emoji: '🟥', id: 'red' }, { emoji: '🟩', id: 'green' }, { emoji: '🟦', id: 'blue' }],
    voice: 'Choose the shape that completes the pattern.',
  },
  {
    pattern: ['⭐', '🌙', '⭐', '🌙'],
    correct: '⭐',
    choices: [{ emoji: '⭐', id: 'star' }, { emoji: '🌙', id: 'moon' }, { emoji: '🌟', id: 'glow' }],
    voice: 'Choose the shape that completes the pattern.',
  },
];

export function PatternRecognitionReview({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const round = ROUNDS[roundIndex];
  const isLast = roundIndex === ROUNDS.length - 1;

  useEffect(() => {
    speak(round.voice, 0.75);
  }, [roundIndex]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleChoice = useCallback(
    (emoji: string) => {
      if (emoji !== round.correct) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      if (isLast) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setRoundIndex((i) => i + 1);
      }
    },
    [round.correct, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Patterns complete!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Complete the pattern"
      instruction="Choose the shape that completes the pattern."
      icon="🔺"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.patternRow}>
          {round.pattern.map((e, i) => (
            <Text key={i} style={styles.patternDot}>{e}</Text>
          ))}
          <View style={styles.blank}>
            <Text style={styles.blankText}>?</Text>
          </View>
        </View>
        <Text style={styles.prompt}>What comes next?</Text>
        <View style={styles.choicesRow}>
          {round.choices.map((c) => (
            <Animated.View key={c.id} style={{ transform: [{ translateX: c.emoji === round.correct ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(c.emoji)}
                style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}
                accessibilityLabel={c.id}
              >
                <Text style={styles.choiceEmoji}>{c.emoji}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
        <Text style={styles.progressText}>Pattern {roundIndex + 1} of {ROUNDS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  patternDot: { fontSize: 44 },
  blank: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankText: { fontSize: 24, fontWeight: '800', color: '#9CA3AF' },
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20 },
  choicesRow: { flexDirection: 'row', gap: 20 },
  choiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  choiceEmoji: { fontSize: 48 },
  progressText: { fontSize: 14, color: '#6B7280', marginTop: 20 },
});
