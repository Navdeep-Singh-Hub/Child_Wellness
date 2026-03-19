/**
 * Level 5 Counter — Session 3, Game 2: Sound Recognition
 * Match animal with correct sound. "Which animal says woof?" Options: Dog, Cat, Bird. Correct: Dog.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SOUND_QUESTION = { sound: 'woof', correctId: 'dog', prompt: 'Which animal says woof?' };
const ANIMALS = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'dog', label: 'Dog', emoji: '🐕' },
  { id: 'bird', label: 'Bird', emoji: '🐦' },
];

export interface SoundRecognitionCounterGameProps {
  onComplete: () => void;
}

export function SoundRecognitionCounterGame({ onComplete }: SoundRecognitionCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Which animal says woof? Tap the animal that makes that sound.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which animal says woof?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === SOUND_QUESTION.correctId) {
        speak('Correct! The dog says woof!', 0.75);
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
        subtitle="You matched the sound!"
        badgeEmoji="🐕"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Sound Recognition"
      instruction="Which animal says woof? Tap the correct animal."
      icon="🔊"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which animal says woof?</Text>
        <View style={styles.soundBox}>
          <Text style={styles.soundEmoji}>🔊</Text>
          <Text style={styles.soundText}>Woof!</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the animal</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {ANIMALS.map((animal) => (
            <Pressable
              key={animal.id}
              onPress={() => handleTap(animal.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={animal.label}
            >
              <Text style={styles.animalEmoji}>{animal.emoji}</Text>
              <Text style={styles.animalLabel}>{animal.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16, textAlign: 'center' },
  soundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 4,
    borderColor: '#38BDF8',
  },
  soundEmoji: { fontSize: 36 },
  soundText: { fontSize: 24, fontWeight: '800', color: '#0C4A6E' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  animalEmoji: { fontSize: 48, marginBottom: 8 },
  animalLabel: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
