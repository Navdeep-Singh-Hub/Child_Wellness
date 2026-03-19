/**
 * Level 9 (Clockwise) — Session 7, Game 1: Emotion Recognition
 * Tap the confused face. Options: happy, sad, angry, confused.
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
  { id: 'confused', label: 'Confused', emoji: '😕' },
];
const CORRECT_ID = 'confused';

export interface EmotionRecognitionConfusedLevel9Session7GameProps {
  onComplete: () => void;
}

export function EmotionRecognitionConfusedLevel9Session7Game({ onComplete }: EmotionRecognitionConfusedLevel9Session7GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the CONFUSED face.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the confused face.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the confused face!', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You found the confused face!"
        badgeEmoji="😕"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Emotion Recognition"
      instruction="Tap the CONFUSED face."
      icon="😕"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the CONFUSED face</Text>
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
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  faceBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 88,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  emoji: { fontSize: 40, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
