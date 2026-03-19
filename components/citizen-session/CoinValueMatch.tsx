/**
 * Game 3 — Match coin with value. ₹5 → five rupees, ₹10 → ten rupees. Session 2: Public Place Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTIONS: {
  coin: string;
  correctLabel: string;
  options: string[];
  voice: string;
}[] = [
  { coin: '₹5', correctLabel: 'five rupees', options: ['five rupees', 'ten rupees', 'fifteen rupees'], voice: 'What is 5 rupees? Tap five rupees.' },
  { coin: '₹10', correctLabel: 'ten rupees', options: ['five rupees', 'ten rupees', 'fifteen rupees'], voice: 'What is 10 rupees? Tap ten rupees.' },
];

export function CoinValueMatch({ onComplete }: { onComplete: () => void }) {
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
    (label: string) => {
      if (label !== q.correctLabel) {
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
    [q.correctLabel, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You know the values!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Match coin with value"
      instruction="Tap the words that match the coin."
      icon="🪙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.coinDisplay}>
          <Text style={styles.coinValue}>{q.coin}</Text>
        </View>
        <Text style={styles.prompt}>How much is it?</Text>
        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === q.correctLabel ? 0 : shakeX }] }}>
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
  coinDisplay: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    padding: 24,
    borderWidth: 4,
    borderColor: '#F59E0B',
    marginBottom: 20,
  },
  coinValue: { fontSize: 36, fontWeight: '800', color: '#1f2937' },
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
