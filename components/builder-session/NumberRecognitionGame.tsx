/**
 * Builder Session 7 — Game 2: Number Recognition
 * Tap number 5. Show numbers 3, 5, 8 (or similar); correct is 5.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const NUMBERS = [
  { id: '3', value: '3' },
  { id: '5', value: '5' },
  { id: '8', value: '8' },
];

const CORRECT_ID = '5';

export interface NumberRecognitionGameProps {
  onComplete: () => void;
}

export function NumberRecognitionGame({ onComplete }: NumberRecognitionGameProps) {
  const prompt = 'Tap number 5.';
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
    speak('Try again. Tap the number 5!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found 5!', 0.75);
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
        subtitle="You found the number 5!"
        badgeEmoji="5️⃣"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Number Recognition"
      instruction={prompt}
      icon="5️⃣"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap number 5</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {NUMBERS.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => handleTap(n.id)}
              style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${n.value}`}
            >
              <Text style={styles.numText}>{n.value}</Text>
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
  row: { flexDirection: 'row', gap: 24 },
  numBtn: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
  numText: { fontSize: 48, fontWeight: '800', color: '#5B21B6' },
});
