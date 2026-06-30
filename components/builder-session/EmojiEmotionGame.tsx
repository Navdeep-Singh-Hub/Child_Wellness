/**
 * Builder Session 8 — Game 1: Emoji Emotion Recognition
 * Tap the HAPPY face. Show happy, sad, angry (or similar); correct is happy.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const FACES = [
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
];

const CORRECT_ID = 'happy';

export interface EmojiEmotionGameProps {
  onComplete: () => void;
}

export function EmojiEmotionGame({ onComplete }: EmojiEmotionGameProps) {
  const prompt = 'Tap the HAPPY face.';
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
    speak('Try again. Tap the happy face!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the happy face!', 0.75);
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
        subtitle="You found the happy face!"
        badgeEmoji="😊"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Emotion Recognition"
      instruction={prompt}
      icon="😊"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the HAPPY face</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {FACES.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => handleTap(f.id)}
              style={({ pressed }) => [styles.faceBtn, pressed && styles.pressed]}
              accessibilityLabel={`${f.label} face`}
            >
              <Text style={styles.emoji}>{f.emoji}</Text>
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
  faceBtn: {
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
  emoji: { fontSize: 48 },
});
