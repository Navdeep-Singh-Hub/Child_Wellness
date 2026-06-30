/**
 * Builder Session 2 — Game 2: Picture Match
 * Show apple, banana, ball. Prompt: "Tap the APPLE".
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'apple', label: 'APPLE', emoji: '🍎' },
  { id: 'banana', label: 'BANANA', emoji: '🍌' },
  { id: 'ball', label: 'BALL', emoji: '⚽' },
];

const CORRECT_ID = 'apple';

export interface PictureMatchGameProps {
  onComplete: () => void;
}

export function PictureMatchGame({ onComplete }: PictureMatchGameProps) {
  const prompt = 'Tap the APPLE.';
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
    speak('Try again. Tap the apple!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! You found the apple!', 0.75);
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
        subtitle="You found the apple!"
        badgeEmoji="🍎"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Picture Match"
      instruction={prompt}
      icon="🍎"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the APPLE</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
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
    width: 110,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: { opacity: 0.9, backgroundColor: '#EDE9FE' },
  emoji: { fontSize: 52, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
});
