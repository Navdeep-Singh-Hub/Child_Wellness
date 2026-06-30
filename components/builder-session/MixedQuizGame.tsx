/**
 * Builder Session 10 — Game 1: Mixed Quiz
 * Choose the correct object. "Which one is a ball?" Options: ball, book, cup. Correct: ball.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = [
  { id: 'book', label: 'Book', emoji: '📚' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'cup', label: 'Cup', emoji: '🥤' },
];

const CORRECT_ID = 'ball';

export interface MixedQuizGameProps {
  onComplete: () => void;
}

export function MixedQuizGame({ onComplete }: MixedQuizGameProps) {
  const prompt = 'Which one is a ball?';
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
    speak('Try again. Find the ball!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! The ball!', 0.75);
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
        subtitle="You chose the correct object!"
        badgeEmoji="⚽"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Mixed Quiz"
      instruction={prompt}
      icon="❓"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which one is a ball?</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={styles.label}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 28, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  optionBtn: {
    width: 100,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
});
