/**
 * Game 2 — Match traffic sign with meaning. NO ENTRY→cannot go, STOP→stop moving, PARKING→place to park. Session 5: Traffic Signs.
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
  { sign: 'NO ENTRY', correctMeaning: 'cannot go', options: ['cannot go', 'stop moving', 'place to park a vehicle'], voice: 'What does NO ENTRY mean? Tap cannot go.' },
  { sign: 'STOP', correctMeaning: 'stop moving', options: ['cannot go', 'stop moving', 'place to park a vehicle'], voice: 'What does STOP mean? Tap stop moving.' },
  { sign: 'PARKING', correctMeaning: 'place to park a vehicle', options: ['cannot go', 'stop moving', 'place to park a vehicle'], voice: 'What does PARKING mean? Tap place to park a vehicle.' },
];

export function TrafficSignMeaningMatch({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You know the traffic signs!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Match the traffic sign"
      instruction="What does this sign mean?"
      icon="🛑"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.signDisplay}>
          <Text style={[styles.signText, { color: '#991B1B' }]}>{q.sign}</Text>
        </View>
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
  signDisplay: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#991B1B',
    marginBottom: 16,
  },
  signText: { fontSize: 22, fontWeight: '800' },
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
  optionText: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  progressText: { fontSize: 14, color: '#6B7280', marginTop: 20 },
});
