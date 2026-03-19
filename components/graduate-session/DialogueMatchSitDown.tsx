/**
 * Game 2 — Match teacher with response. Teacher → Sit down. Student → ______. Options: Okay, Banana, Run. Correct: Okay. Session 6: Story Understanding.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TEACHER_SAYS = 'Sit down';
const OPTIONS = ['Okay', 'Banana', 'Run'];
const CORRECT = 'Okay';
const VOICE = 'Choose the correct student response.';

export function DialogueMatchSitDown({ onComplete }: { onComplete: () => void }) {
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
      speak('Correct! Okay!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You matched the response!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Match teacher with response"
      instruction="Choose the correct student response."
      icon="💬"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.dialogueBox}>
          <Text style={styles.speaker}>Teacher → {TEACHER_SAYS}</Text>
          <Text style={styles.speaker}>Student → ______</Text>
        </View>
        <Text style={styles.prompt}>What should the student say?</Text>
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
    minWidth: 240,
  },
  speaker: { fontSize: 20, fontWeight: '700', color: '#374151', marginBottom: 8 },
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
