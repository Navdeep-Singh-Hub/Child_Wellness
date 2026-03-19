/**
 * OceanMatchSets — Game 4: Matching Sets to Numerals
 * Show groups of sea objects (1–5); child taps the correct numeral. Sparkle on correct.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [
  { count: 1, emoji: '🐋', label: 'whale' },
  { count: 2, emoji: '🦀', label: 'crabs' },
  { count: 3, emoji: '🐟', label: 'fish' },
  { count: 4, emoji: '🐚', label: 'shells' },
  { count: 5, emoji: '⭐', label: 'starfish' },
];

export function OceanMatchSets({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sparkleAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));
  const round = ROUNDS[roundIndex];

  useEffect(() => {
    speak(`How many ${round.label}? Count them.`, 0.75);
  }, [roundIndex]);

  const triggerSparkle = useCallback(() => {
    sparkleAnim.setValue(0);
    Animated.timing(sparkleAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [sparkleAnim]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [wrongShake]);

  const handleNumberTap = useCallback(
    (n: number) => {
      if (n === round.count) {
        speak('Correct!');
        triggerSparkle();
        if (roundIndex + 1 >= ROUNDS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setRoundIndex((r) => r + 1);
        }
      } else {
        speak('Try again');
        triggerWrong();
      }
    },
    [round, roundIndex, onComplete, triggerSparkle, triggerWrong]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="ocean" title="Great Job!" subtitle="Numbers matched!" />;
  }

  const scale = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Count the Sea Creatures"
      instruction="Tap the number that matches how many you see."
    >
      <View style={styles.content}>
        <View style={styles.setWrap}>
          <Animated.View style={[styles.setBox, { transform: [{ translateX: shakeX }] }]}>
            <Text style={styles.setEmojis}>{round.emoji.repeat(round.count)}</Text>
            <Text style={styles.setLabel}>{round.count} {round.label}</Text>
          </Animated.View>
        </View>
        <Text style={styles.prompt}>Tap the correct number:</Text>
        <View style={styles.numbersRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Animated.View key={n} style={n === round.count ? { transform: [{ scale }] } : undefined}>
              <Pressable
                onPress={() => handleNumberTap(n)}
                style={({ pressed }) => [styles.numBtn, pressed && styles.pressed]}
                accessibilityLabel={`Number ${n}`}
              >
                <Text style={styles.numText}>{n}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 24 },
  setWrap: { marginBottom: 28 },
  setBox: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    minWidth: 200,
  },
  setEmojis: { fontSize: 44, marginBottom: 8 },
  setLabel: { fontSize: 18, fontWeight: '700', color: '#0369A1' },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  numbersRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FB7185',
    borderWidth: 3,
    borderColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#0EA5E9' },
});
