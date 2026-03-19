/**
 * Level 7 Reader — Session 7, Game 1: Emotion Recognition
 * Select the surprised face. Options: happy, sad, angry, surprised.
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
  { id: 'surprised', label: 'Surprised', emoji: '😲' },
];
const CORRECT_ID = 'surprised';

export interface EmotionRecognitionSurprisedReaderSession7GameProps {
  onComplete: () => void;
}

export function EmotionRecognitionSurprisedReaderSession7Game({ onComplete }: EmotionRecognitionSurprisedReaderSession7GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap the SURPRISED face.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the surprised face.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the surprised face!', 0.75);
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
        subtitle="You found the surprised face!"
        badgeEmoji="😲"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Emotion Recognition"
      instruction="Tap the SURPRISED face."
      icon="😲"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the SURPRISED face</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  faceBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
    minWidth: 88,
  },
  emoji: { fontSize: 44, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
