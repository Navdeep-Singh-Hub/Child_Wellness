/**
 * SuperheroMatchSets — Game 4: Matching Sets to Numerals (up to 10)
 * Groups of hero symbols (e.g. 7 stars, 8 shields, 9 logos, 10 capes) matched to numbers.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [
  { count: 7, emoji: '⭐', label: 'stars' },
  { count: 8, emoji: '🛡️', label: 'shields' },
  { count: 9, emoji: '🦸', label: 'hero logos' },
  { count: 10, emoji: '⭐', label: 'stars' },
];

export function SuperheroMatchSets({ onComplete }: { onComplete: () => void }) {
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
    Animated.timing(sparkleAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Numbers matched!" />;

  const scale = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Matching Sets to Numerals"
      instruction="Tap the number that matches how many you see."
    >
      <View style={styles.content}>
        <Animated.View style={[styles.setWrap, { transform: [{ translateX: shakeX }] }]}>
          <View style={styles.setBox}>
            <Text style={styles.setEmojis} numberOfLines={1}>{round.emoji.repeat(Math.min(round.count, 10))}</Text>
          </View>
        </Animated.View>
        <Text style={styles.prompt}>Tap the correct number:</Text>
        <View style={styles.numbersRow}>
          {[6, 7, 8, 9, 10].map((n) => (
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
  setWrap: { marginBottom: 24 },
  setBox: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#EF4444',
    alignItems: 'center',
    minWidth: 260,
  },
  setEmojis: { fontSize: 28, marginBottom: 8, letterSpacing: 2 },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  numbersRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#B91C1C' },
});
