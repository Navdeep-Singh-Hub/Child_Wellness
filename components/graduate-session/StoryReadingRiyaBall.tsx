/**
 * Game 1 — Read the story. Riya has a red ball, plays in the park. "What does Riya have?" Options: Ball, Book, Shoes. Correct: Ball. Session 9: Story Problem Solver.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const STORY = 'Riya has a red ball. She plays with it in the park.';
const QUESTION = 'What does Riya have?';
const OPTIONS = ['Ball', 'Book', 'Shoes'];
const CORRECT = 'Ball';
const VOICE = 'Read the story and choose the correct answer.';

export function StoryReadingRiyaBall({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleChoice = useCallback(
    (answer: string) => {
      if (answer !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! Riya has a ball!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You understood the story!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Answer the question"
      instruction="Read the story and choose the correct answer."
      icon="📖"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.storyBox}>
          <Text style={styles.storyText}>"{STORY}"</Text>
        </View>
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{QUESTION}</Text>
        </View>
        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === CORRECT ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(opt)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={opt}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  storyBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 16,
    minWidth: 260,
  },
  storyText: { fontSize: 17, fontWeight: '700', color: '#5B21B6', textAlign: 'center' },
  questionBox: { marginBottom: 20 },
  questionText: { fontSize: 20, fontWeight: '800', color: '#374151' },
  optionsColumn: { gap: 12, width: '100%', maxWidth: 280 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
});
