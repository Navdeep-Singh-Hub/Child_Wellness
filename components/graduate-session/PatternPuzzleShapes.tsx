/**
 * Game 4 — Complete the pattern. 🔺 🔵 🔺 🔵 __. Options 🔺, 🔵, 🟩. Correct: 🔺. Session 2: Story Sentences.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['🔺', '🔵', '🔺', '🔵'];
const OPTIONS = ['🔺', '🔵', '🟩'];
const CORRECT = '🔺';
const VOICE = 'Choose the shape that continues the pattern.';

export function PatternPuzzleShapes({ onComplete }: { onComplete: () => void }) {
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
    (emoji: string) => {
      if (emoji !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! Triangle!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found the pattern!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Complete the pattern"
      instruction="Choose the shape that continues the pattern."
      icon="🔢"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.patternRow}>
          {PATTERN.map((emoji, i) => (
            <View key={i} style={styles.patternCell}>
              <Text style={styles.patternEmoji}>{emoji}</Text>
            </View>
          ))}
          <View style={[styles.patternCell, styles.blankCell]}>
            <Text style={styles.blankText}>?</Text>
          </View>
        </View>
        <Text style={styles.prompt}>What comes next?</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === CORRECT ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(opt)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={opt}
              >
                <Text style={styles.optionEmoji}>{opt}</Text>
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
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  patternCell: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  blankCell: { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' },
  patternEmoji: { fontSize: 40 },
  blankText: { fontSize: 32, fontWeight: '800', color: '#6B7280' },
  prompt: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 20 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionEmoji: { fontSize: 48 },
});
