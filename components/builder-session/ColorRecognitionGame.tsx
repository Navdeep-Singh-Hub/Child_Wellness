/**
 * Builder Session 4 — Game 1: Color Recognition
 * Tap the BLUE object. Show 3 colored objects (red, blue, yellow).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'red', label: 'RED', color: '#EF4444', emoji: '🔴' },
  { id: 'blue', label: 'BLUE', color: '#3B82F6', emoji: '🔵' },
  { id: 'yellow', label: 'YELLOW', color: '#FBBF24', emoji: '🟡' },
];

const CORRECT_ID = 'blue';

export interface ColorRecognitionGameProps {
  onComplete: () => void;
}

export function ColorRecognitionGame({ onComplete }: ColorRecognitionGameProps) {
  const prompt = 'Tap the BLUE object.';
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(prompt, 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the blue one!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the blue object!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You found the blue object!"
        badgeEmoji="🔵"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Color Recognition"
      instruction={prompt}
      icon="🔵"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the BLUE object</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: item.color },
                pressed && styles.cardPressed,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 28,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: 100,
    height: 110,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: { opacity: 0.9 },
  emoji: { fontSize: 44, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
});
