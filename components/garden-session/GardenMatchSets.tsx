/**
 * GardenMatchSets — Game 4: Match the Garden Numbers (5–8)
 * Match sets to numerals: 7 carrots, 8 flowers, 5 ladybugs, 6 bees. Flowers bloom on correct.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROUNDS = [
  { count: 5, emoji: '🐞', label: 'ladybugs' },
  { count: 6, emoji: '🐝', label: 'bees' },
  { count: 7, emoji: '🥕', label: 'carrots' },
  { count: 8, emoji: '🌸', label: 'flowers' },
];

export function GardenMatchSets({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bloomAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));
  const round = ROUNDS[roundIndex];

  useEffect(() => {
    speak(`How many ${round.label}? Count them.`, 0.75);
  }, [roundIndex]);

  const triggerBloom = useCallback(() => {
    bloomAnim.setValue(0);
    Animated.timing(bloomAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [bloomAnim]);

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
        triggerBloom();
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
    [round, roundIndex, onComplete, triggerBloom, triggerWrong]
  );

  if (showSuccess) return <SuccessCelebration variant="mint" title="Great Job!" subtitle="Numbers matched!" />;

  const scale = bloomAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Match the Garden Numbers"
      instruction="Tap the number that matches how many you see."
    >
      <View style={styles.content}>
        <Animated.View style={[styles.setWrap, { transform: [{ translateX: shakeX }] }]}>
          <View style={styles.setBox}>
            <Text style={styles.setEmojis}>{round.emoji.repeat(round.count)}</Text>
            <Text style={styles.setLabel}>{round.count} {round.label}</Text>
          </View>
        </Animated.View>
        <Text style={styles.prompt}>Tap the correct number:</Text>
        <View style={styles.numbersRow}>
          {[5, 6, 7, 8].map((n) => (
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
    backgroundColor: '#DCFCE7',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#22C55E',
    alignItems: 'center',
    minWidth: 220,
  },
  setEmojis: { fontSize: 36, marginBottom: 8 },
  setLabel: { fontSize: 18, fontWeight: '700', color: '#166534' },
  prompt: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  numbersRow: { flexDirection: 'row', gap: 14 },
  numBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F472B6',
    borderWidth: 3,
    borderColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
