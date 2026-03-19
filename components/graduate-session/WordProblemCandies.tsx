/**
 * Game 3 — Word problem. 5 candies, eat 2. How many left? Options 2, 3, 4. Correct: 3. Session 3: Question & Answer.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = ['2', '3', '4'];
const CORRECT = '3';
const VOICE = 'Read the story and choose the correct number.';

export function WordProblemCandies({ onComplete }: { onComplete: () => void }) {
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
    (num: string) => {
      if (num !== CORRECT) {
        speak('Try again. Five minus two is three.');
        triggerShake();
        return;
      }
      speak('Correct! Three candies left!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You solved the problem!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Solve the story problem"
      instruction="Read the story and choose the correct number."
      icon="📖"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.storyBox}>
          <Text style={styles.storyLine}>
            You have <Text style={styles.bold}>5 candies</Text>.
          </Text>
          <Text style={styles.storyLine}>
            You eat <Text style={styles.bold}>2 candies</Text>.
          </Text>
          <Text style={styles.question}>How many candies are left?</Text>
        </View>
        <View style={styles.optionsRow}>
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
    padding: 24,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 24,
    minWidth: 260,
  },
  storyLine: { fontSize: 18, color: '#374151', marginBottom: 8 },
  bold: { fontWeight: '800', color: '#5B21B6' },
  question: { fontSize: 20, fontWeight: '800', color: '#374151', marginTop: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
});
