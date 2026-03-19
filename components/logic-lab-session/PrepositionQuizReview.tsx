/**
 * Game 1 — Choose correct preposition. 3 questions: cat under table, book on table, ball in box. Session 7: Mixed Prepositions Review.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Preposition = 'in' | 'on' | 'under' | 'behind' | 'between';
const QUESTIONS: {
  scene: string;
  correct: Preposition;
  options: Preposition[];
  voice: string;
}[] = [
  {
    scene: 'Cat under table',
    correct: 'under',
    options: ['under', 'on', 'in'],
    voice: 'Where is the cat? Tap UNDER.',
  },
  {
    scene: 'Book on table',
    correct: 'on',
    options: ['in', 'on', 'behind'],
    voice: 'Where is the book? Tap ON.',
  },
  {
    scene: 'Ball in box',
    correct: 'in',
    options: ['under', 'in', 'between'],
    voice: 'Where is the ball? Tap IN.',
  },
];

export function PrepositionQuizReview({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const q = QUESTIONS[questionIndex];
  const isLast = questionIndex === QUESTIONS.length - 1;

  useEffect(() => {
    speak(q.voice, 0.75);
  }, [questionIndex]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleChoice = useCallback(
    (prep: Preposition) => {
      if (prep !== q.correct) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      if (isLast) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setQuestionIndex((i) => i + 1);
      }
    },
    [q.correct, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You know your positions!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the object?"
      instruction="Tap the word that matches the position."
      icon="📍"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.sceneLabel}>{q.scene}</Text>
        <Text style={styles.prompt}>Which word is correct?</Text>
        <View style={styles.optionsRow}>
          {q.options.map((prep) => (
            <Animated.View key={prep} style={{ transform: [{ translateX: prep === q.correct ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(prep)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={`${prep}`}
              >
                <Text style={styles.optionText}>{prep.toUpperCase()}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
        <Text style={styles.progressText}>Question {questionIndex + 1} of {QUESTIONS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  sceneLabel: { fontSize: 20, fontWeight: '800', color: '#3730A3', marginBottom: 12, textAlign: 'center' },
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
  progressText: { fontSize: 14, color: '#6B7280', marginTop: 20 },
});
