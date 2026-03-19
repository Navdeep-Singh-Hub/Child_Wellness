/**
 * Level 5 Counter — Session 8, Game 1: Emotion Recognition
 * Tap the SAD face. Options: happy, sad, angry. Correct: sad.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const FACES = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
];
const CORRECT_ID = 'sad';

export interface EmotionRecognitionCounterGameProps {
  onComplete: () => void;
}

export function EmotionRecognitionCounterGame({ onComplete }: EmotionRecognitionCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the SAD face.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the sad face.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the sad face!', 0.75);
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
        variant="ocean"
        title="Great Job!"
        subtitle="You found the sad face!"
        badgeEmoji="😢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Emotion Recognition"
      instruction="Tap the SAD face."
      icon="😢"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the SAD face</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {FACES.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => handleTap(f.id)}
              style={({ pressed }) => [styles.faceBtn, pressed && styles.pressed]}
              accessibilityLabel={f.label}
            >
              <Text style={styles.emoji}>{f.emoji}</Text>
              <Text style={styles.label}>{f.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 20 },
  faceBtn: {
    minWidth: 90,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
