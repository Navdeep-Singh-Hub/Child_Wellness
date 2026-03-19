/**
 * Game 3 — Complete the pattern: 🔴 🔵 🔴 🔵 __ → choose 🔴
 * Pattern recognition. AAC-friendly.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'red', 'blue'] as const;
type Color = 'red' | 'blue' | 'green';
const CORRECT: Color = 'red';
const CHOICES: { id: Color; emoji: string; label: string }[] = [
  { id: 'red', emoji: '🔴', label: 'Red' },
  { id: 'green', emoji: '🟢', label: 'Green' },
  { id: 'blue', emoji: '🔵', label: 'Blue' },
];
const VOICE = 'Tap the shape that completes the pattern.';

export function PatternBuilder({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [glowAnim] = useState(() => new Animated.Value(0));

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
  const triggerGlow = useCallback(() => {
    glowAnim.setValue(0);
    Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [glowAnim]);

  const handleChoice = useCallback(
    (color: Color) => {
      if (color === CORRECT) {
        speak('Correct!');
        triggerGlow();
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak('Try again.');
        triggerShake();
      }
    },
    [onComplete, triggerGlow, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Pattern complete!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Complete the pattern"
      instruction="Tap the shape that completes the pattern."
      icon="🔷"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.patternRow}>
          {PATTERN.map((c, i) => (
            <Text key={i} style={styles.patternDot}>
              {c === 'red' ? '🔴' : '🔵'}
            </Text>
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
