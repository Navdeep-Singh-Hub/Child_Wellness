/**
 * Game 2 — Conversation completion. Friend: Can I borrow a pencil? You: ______. Options: Yes, Run, Sleep. Correct: Yes. Session 7: Real Life Problems.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const DIALOGUE = 'Can I borrow a pencil?';
const OPTIONS = ['Yes', 'Run', 'Sleep'];
const CORRECT = 'Yes';
const VOICE = 'Choose the best reply.';

export function ConversationCompleteBorrowPencil({ onComplete }: { onComplete: () => void }) {
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
    (reply: string) => {
      if (reply !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! Yes!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You finished the conversation!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Finish the conversation"
      instruction="Choose the best reply."
      icon="💬"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.dialogueBox}>
          <Text style={styles.speaker}>Friend: {DIALOGUE}</Text>
          <Text style={styles.speaker}>You: ______</Text>
        </View>
        <Text style={styles.prompt}>What should you say?</Text>
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
});
