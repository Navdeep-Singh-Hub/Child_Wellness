/**
 * Game 2 — Dialogue Quiz. Two rounds: (1) Friend: Hello! You: Hello/Banana/Sleep. (2) Teacher: Please sit down. Student: Okay/Jump/Run. Session 10: Graduate Master Challenge.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [
  { prompt: 'Friend: Hello!', youLabel: 'You: ______', options: ['Hello', 'Banana', 'Sleep'], correct: 'Hello' },
  { prompt: 'Teacher: Please sit down.', youLabel: 'Student: ______', options: ['Okay', 'Jump', 'Run'], correct: 'Okay' },
];
const VOICE = 'Answer the conversation question. Choose the best reply.';

export function DialogueQuizMaster({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const round = ROUNDS[roundIndex];

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
    (reply: string) => {
      if (reply !== round.correct) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak(`Correct! ${round.correct}!`);
      if (roundIndex >= ROUNDS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setRoundIndex((i) => i + 1);
      }
    },
    [round, roundIndex, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You answered both!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Answer the conversation question"
      instruction="Choose the best reply."
      icon="💬"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.dialogueBox}>
          <Text style={styles.speaker}>{round.prompt}</Text>
          <Text style={styles.speaker}>{round.youLabel}</Text>
        </View>
        <Text style={styles.prompt}>What should you say?</Text>
        <View style={styles.optionsColumn}>
          {round.options.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === round.correct ? 0 : shakeX }] }}>
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
        <Text style={styles.progress}>Question {roundIndex + 1} of {ROUNDS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  dialogueBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 20,
    minWidth: 260,
  },
  speaker: { fontSize: 19, fontWeight: '700', color: '#374151', marginBottom: 8 },
  prompt: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 20 },
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
  progress: { fontSize: 14, color: '#6B7280', marginTop: 16 },
});
