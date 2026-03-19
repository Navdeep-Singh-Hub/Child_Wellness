/**
 * Level 5 Counter — Session 4, Game 2: Object Function
 * Match object with its use: spoon → eating. "What do we use for eating?" Options: Spoon, Book, Ball. Correct: Spoon.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const USE_QUESTION = { use: 'eating', correctId: 'spoon', prompt: 'What do we use for eating?' };
const OBJECTS = [
  { id: 'book', label: 'Book', emoji: '📚' },
  { id: 'spoon', label: 'Spoon', emoji: '🥄' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
];

export interface ObjectFunctionCounterGameProps {
  onComplete: () => void;
}

export function ObjectFunctionCounterGame({ onComplete }: ObjectFunctionCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What do we use for eating? Tap the object we use to eat.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which one do we use for eating?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === USE_QUESTION.correctId) {
        speak('Correct! We use a spoon for eating!', 0.75);
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
        subtitle="You matched the object to its use!"
        badgeEmoji="🥄"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Object Function"
      instruction="Match the object to its use. What do we use for eating?"
      icon="🥄"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>What do we use for eating?</Text>
        <View style={styles.useBox}>
          <Text style={styles.useEmoji}>🍽️</Text>
          <Text style={styles.useText}>Eating</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the object</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OBJECTS.map((obj) => (
            <Pressable
              key={obj.id}
              onPress={() => handleTap(obj.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={obj.label}
            >
              <Text style={styles.objEmoji}>{obj.emoji}</Text>
              <Text style={styles.objLabel}>{obj.label}</Text>
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
  useBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#E0F2FE',
    borderRadius: 18,
    marginBottom: 28,
    borderWidth: 4,
    borderColor: '#38BDF8',
  },
  useEmoji: { fontSize: 32 },
  useText: { fontSize: 22, fontWeight: '800', color: '#0C4A6E' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  objEmoji: { fontSize: 48, marginBottom: 8 },
  objLabel: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
