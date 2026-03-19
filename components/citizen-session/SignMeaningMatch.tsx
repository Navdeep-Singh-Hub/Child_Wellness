/**
 * Game 2 — Match sign to meaning. STOP → stop walking, EXIT → door to leave, GO → move forward. Session 1: Safety Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTIONS: {
  sign: string;
  correctMeaning: string;
  options: string[];
  voice: string;
}[] = [
  { sign: 'STOP', correctMeaning: 'stop walking', options: ['stop walking', 'door to leave', 'move forward'], voice: 'What does STOP mean? Tap stop walking.' },
  { sign: 'EXIT', correctMeaning: 'door to leave', options: ['stop walking', 'door to leave', 'move forward'], voice: 'What does EXIT mean? Tap door to leave.' },
  { sign: 'GO', correctMeaning: 'move forward', options: ['stop walking', 'door to leave', 'move forward'], voice: 'What does GO mean? Tap move forward.' },
];

export function SignMeaningMatch({ onComplete }: { onComplete: () => void }) {
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
    (meaning: string) => {
      if (meaning !== q.correctMeaning) {
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
    [q.correctMeaning, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You know the signs!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Match the sign with its meaning"
      instruction="What does this sign mean?"
      icon="🛑"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.signLabel}>{q.sign}</Text>
        <Text style={styles.prompt}>What does it mean?</Text>
        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === q.correctMeaning ? 0 : shakeX }] }}>
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
        <Text style={styles.progressText}>Question {questionIndex + 1} of {QUESTIONS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  signLabel: { fontSize: 28, fontWeight: '800', color: '#DC2626', marginBottom: 12 },
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20 },
  optionsColumn: { gap: 12, width: '100%', maxWidth: 320 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  progressText: { fontSize: 14, color: '#6B7280', marginTop: 20 },
});
