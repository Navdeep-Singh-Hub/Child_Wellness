/**
 * Game 1 — Find the position word. Two sentences: ball IN box, cat UNDER table. Session 8: Pattern Builder.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTIONS: {
  sentence: string;
  correct: string;
  options: string[];
  voice: string;
}[] = [
  {
    sentence: 'The ball is **in** the box.',
    correct: 'in',
    options: ['in', 'on', 'under'],
    voice: 'Find the position word. The ball is in the box. Tap IN.',
  },
  {
    sentence: 'The cat is **under** the table.',
    correct: 'under',
    options: ['on', 'under', 'next to'],
    voice: 'Find the position word. The cat is under the table. Tap UNDER.',
  },
];

export function PrepositionSentenceGame({ onComplete }: { onComplete: () => void }) {
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
    (word: string) => {
      if (word !== q.correct) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found the position words!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const displaySentence = q.sentence.replace(/\*\*(.*?)\*\*/, '_____');

  return (
    <GameLayout
      title="Find the position word"
      instruction="Tap the word that completes the sentence."
      icon="📝"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.sentence}>{displaySentence}</Text>
        <Text style={styles.prompt}>Which word is correct?</Text>
        <View style={styles.optionsRow}>
          {q.options.map((word) => (
            <Animated.View key={word} style={{ transform: [{ translateX: word === q.correct ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(word)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={word}
              >
                <Text style={styles.optionText}>{word.toUpperCase()}</Text>
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
  sentence: { fontSize: 20, fontWeight: '700', color: '#3730A3', marginBottom: 20, textAlign: 'center', paddingHorizontal: 16 },
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
