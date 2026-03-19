/**
 * Builder Session 6 — Game 2: Direction Game
 * Move object LEFT or RIGHT. Prompt e.g. "Move LEFT" — user taps the correct direction.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [
  { direction: 'left' as const, prompt: 'Move LEFT.', label: 'Left' },
  { direction: 'right' as const, prompt: 'Move RIGHT.', label: 'Right' },
  { direction: 'left' as const, prompt: 'Move LEFT.', label: 'Left' },
];

export interface DirectionGameProps {
  onComplete: () => void;
}

export function DirectionGame({ onComplete }: DirectionGameProps) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  const current = ROUNDS[round];

  useEffect(() => {
    speak(current.prompt, 0.75);
  }, [round]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak(`Try again. Tap ${current.label}.`, 0.7);
  }, [wrongShake, current.label]);

  const handleTap = useCallback(
    (direction: 'left' | 'right') => {
      if (direction !== current.direction) {
        triggerWrong();
        return;
      }
      speak(`Correct! ${current.label}!`, 0.75);
      if (round + 1 >= ROUNDS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setRound((r) => r + 1);
      }
    },
    [round, current, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You followed the directions!"
        badgeEmoji="👆"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Direction Game"
      instruction={current.prompt}
      icon="👆"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>{current.prompt}</Text>
        <View style={styles.iconWrap}>
          <Text style={styles.emoji}>🚗</Text>
        </View>
        <Animated.View style={[styles.buttonsRow, { transform: [{ translateX: shakeX }] }]}>
          <Pressable
            onPress={() => handleTap('left')}
            style={({ pressed }) => [styles.dirBtn, styles.leftBtn, pressed && styles.pressed]}
            accessibilityLabel="Move left"
          >
            <Ionicons name="arrow-back" size={44} color="#FFF" />
            <Text style={styles.dirLabel}>LEFT</Text>
          </Pressable>
          <Pressable
            onPress={() => handleTap('right')}
            style={({ pressed }) => [styles.dirBtn, styles.rightBtn, pressed && styles.pressed]}
            accessibilityLabel="Move right"
          >
            <Ionicons name="arrow-forward" size={44} color="#FFF" />
            <Text style={styles.dirLabel}>RIGHT</Text>
          </Pressable>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 20, textAlign: 'center' },
  iconWrap: { marginBottom: 28 },
  emoji: { fontSize: 56 },
  buttonsRow: { flexDirection: 'row', gap: 24 },
  dirBtn: {
    width: 100,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftBtn: { backgroundColor: '#3B82F6' },
  rightBtn: { backgroundColor: '#10B981' },
  dirLabel: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 8 },
  pressed: { opacity: 0.9 },
});
