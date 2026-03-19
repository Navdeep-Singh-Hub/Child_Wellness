/**
 * Game 1 — Find the correct position. Cat under table; options: under, on, between. Session 9: Sequence Master.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SCENE = 'Cat under table';
const CORRECT = 'under';
const OPTIONS = ['under', 'on', 'between'];
const VOICE = 'Find the correct position. The cat is under the table. Tap UNDER.';

export function PrepositionChoiceSequenceMaster({ onComplete }: { onComplete: () => void }) {
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
    (word: string) => {
      if (word !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found the position!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Find the correct position"
      instruction="Which word describes where the cat is?"
      icon="🐱"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.sceneLabel}>{SCENE}</Text>
        <Text style={styles.prompt}>Which position word is correct?</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((word) => (
            <Animated.View key={word} style={{ transform: [{ translateX: word === CORRECT ? 0 : shakeX }] }}>
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
});
