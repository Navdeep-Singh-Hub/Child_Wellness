/**
 * Builder Session 3 — Game 2: Big vs Small
 * Tap the bigger object. Two objects shown, one clearly bigger.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { big: { emoji: '🔴', label: 'Big circle' }, small: { emoji: '🔵', label: 'Small circle' } },
  { big: { emoji: '🐘', label: 'Big elephant' }, small: { emoji: '🐜', label: 'Small ant' } },
  { big: { emoji: '🏠', label: 'Big house' }, small: { emoji: '🐦', label: 'Small bird' } },
];

export interface BigVsSmallGameProps {
  onComplete: () => void;
}

export function BigVsSmallGame({ onComplete }: BigVsSmallGameProps) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  const pair = PAIRS[round];
  const swap = round % 2 === 1;
  const left = swap ? pair.small : pair.big;
  const right = swap ? pair.big : pair.small;

  useEffect(() => {
    speak('Tap the bigger one.', 0.75);
  }, [round]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the bigger object!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (isRight: boolean) => {
      const tappedBig = isRight ? right === pair.big : left === pair.big;
      if (tappedBig) {
        speak('Correct! That one is bigger!', 0.75);
        if (round + 1 >= PAIRS.length) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setRound((r) => r + 1);
        }
      } else {
        triggerWrong();
      }
    },
    [round, left, right, pair, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You found the bigger one each time!"
        badgeEmoji="👍"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Big vs Small"
      instruction="Tap the bigger object."
      icon="📏"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap the BIGGER one</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          <Pressable
            onPress={() => handleTap(false)}
            style={({ pressed }) => [styles.card, styles.smallCard, pressed && styles.pressed]}
            accessibilityLabel={left.label}
          >
            <Text style={styles.emojiSmall}>{left.emoji}</Text>
          </Pressable>
          <Pressable
            onPress={() => handleTap(true)}
            style={({ pressed }) => [styles.card, styles.bigCard, pressed && styles.pressed]}
            accessibilityLabel={right.label}
          >
            <Text style={styles.emojiBig}>{right.emoji}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginBottom: 28, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 24, alignItems: 'flex-end' },
  card: {
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCard: { width: 90, height: 90 },
  bigCard: { width: 130, height: 130 },
  emojiSmall: { fontSize: 44 },
  emojiBig: { fontSize: 64 },
  pressed: { opacity: 0.9 },
});
