/**
 * Game 2 — Match sign to place. 🚍→bus stop, 🏥→hospital, 🚔→police. Session 9: Community Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTIONS: {
  icon: string;
  correctPlace: string;
  options: string[];
  voice: string;
}[] = [
  { icon: '🚍', correctPlace: 'bus stop', options: ['hospital', 'police', 'bus stop'], voice: 'What place is this? Tap bus stop.' },
  { icon: '🏥', correctPlace: 'hospital', options: ['hospital', 'police', 'bus stop'], voice: 'What place is this? Tap hospital.' },
  { icon: '🚔', correctPlace: 'police', options: ['hospital', 'police', 'bus stop'], voice: 'What place is this? Tap police.' },
];

export function CommunitySignMeaningMatch({ onComplete }: { onComplete: () => void }) {
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
    (place: string) => {
      if (place !== q.correctPlace) {
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
    [q.correctPlace, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You know the places!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Match the sign with the place"
      instruction="Which place does this sign show?"
      icon="🚍"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.iconDisplay}>
          <Text style={styles.iconEmoji}>{q.icon}</Text>
        </View>
        <Text style={styles.prompt}>Which place is it?</Text>
        <View style={styles.optionsColumn}>
          {q.options.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === q.correctPlace ? 0 : shakeX }] }}>
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
  iconDisplay: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 28,
    borderWidth: 3,
    borderColor: '#1E40AF',
    marginBottom: 16,
  },
  iconEmoji: { fontSize: 56 },
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
