/**
 * Game 3 — Complete the pattern: 🟡 🔵 🟡 🔵 __ → 🟡. Session 2: Preposition ON.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Color = 'yellow' | 'blue' | 'red';
const PATTERN = ['yellow', 'blue', 'yellow', 'blue'] as const;
const CORRECT: Color = 'yellow';
const CHOICES: { id: Color; emoji: string; label: string }[] = [
  { id: 'yellow', emoji: '🟡', label: 'Yellow' },
  { id: 'blue', emoji: '🔵', label: 'Blue' },
  { id: 'red', emoji: '🔴', label: 'Red' },
];
const VOICE = 'Choose the shape that completes the pattern.';

export function PatternRecognitionOn({ onComplete }: { onComplete: () => void }) {
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
    (color: Color) => {
      if (color === CORRECT) {
        speak('Correct!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak('Try again.');
        triggerShake();
      }
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Pattern complete!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Complete the pattern"
      instruction="Choose the shape that completes the pattern."
      icon="🔶"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.patternRow}>
          {PATTERN.map((c, i) => (
            <Text key={i} style={styles.patternDot}>{c === 'yellow' ? '🟡' : '🔵'}</Text>
          ))}
          <View style={styles.blank}>
            <Text style={styles.blankText}>?</Text>
          </View>
        </View>
        <Text style={styles.prompt}>What comes next?</Text>
        <View style={styles.choicesRow}>
          {CHOICES.map((c) => (
            <Animated.View key={c.id} style={{ transform: [{ translateX: c.id === CORRECT ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(c.id)}
                style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}
                accessibilityLabel={c.label}
              >
                <Text style={styles.choiceEmoji}>{c.emoji}</Text>
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
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  patternDot: { fontSize: 44 },
  blank: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankText: { fontSize: 24, fontWeight: '800', color: '#9CA3AF' },
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20 },
  choicesRow: { flexDirection: 'row', gap: 20 },
  choiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  choiceEmoji: { fontSize: 48 },
});
