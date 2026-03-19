/**
 * GardenSyllableGame — Game 3: Clap Garden Words
 * ladybird (3), caterpillar (4), butterfly (3), garden (2). Bouncing flowers, star on correct.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const WORDS = [
  { word: 'Ladybird', syllables: 3 },
  { word: 'Caterpillar', syllables: 4 },
  { word: 'Butterfly', syllables: 3 },
  { word: 'Garden', syllables: 2 },
];

export function GardenSyllableGame({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [flowerAnims] = useState(() =>
    [0, 1, 2, 3].map((i) => new Animated.Value(0)).reduce((acc, a, i) => ({ ...acc, [i]: a }), {} as Record<number, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));
  const current = WORDS[round];

  useEffect(() => {
    if (current) speak(current.word, 0.7);
  }, [round]);

  const triggerFlowers = useCallback((n: number) => {
    for (let i = 0; i < 4; i++) {
      const a = flowerAnims[i];
      if (!a) continue;
      a.setValue(0);
      if (i < n) {
        Animated.sequence([
          Animated.timing(a, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [flowerAnims]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [starScale]);

  const handleClapChoice = useCallback(
    (num: number) => {
      if (current.syllables === num) {
        speak('Correct!');
        triggerFlowers(num);
        triggerStar();
        if (round + 1 >= WORDS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 1800);
        } else {
          setRound((r) => r + 1);
        }
      } else {
        speak('Try again. Clap the syllables.');
      }
    },
    [current, round, onComplete, triggerFlowers, triggerStar]
  );

  const playWord = useCallback(() => speak(current.word, 0.7), [current]);

  if (showSuccess) return <SuccessCelebration variant="mint" title="Great Job!" subtitle="Syllables complete!" />;

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Clap Garden Words"
      instruction="Listen to the word, then tap how many syllables."
    >
      <View style={styles.content}>
        <Pressable
          onPress={playWord}
          style={({ pressed }) => [styles.speakerBtn, pressed && styles.pressed]}
          accessibilityLabel={`Play word ${current.word}`}
        >
          <Text style={styles.speakerEmoji}>🔊</Text>
          <Text style={styles.wordText}>{current.word}</Text>
        </Pressable>
        <View style={styles.flowersRow}>
          {[0, 1, 2, 3].map((i) => {
            const opacity = flowerAnims[i]?.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
            return (
              <Animated.View key={i} style={[styles.flower, opacity != null ? { opacity } : { opacity: 0.4 }]}>
                <Text style={styles.flowerEmoji}>🌸</Text>
              </Animated.View>
            );
          })}
        </View>
        <Text style={styles.hint}>Tap the number of claps:</Text>
        <View style={styles.clapRow}>
          {[1, 2, 3, 4].map((n) => (
            <Pressable
              key={n}
              onPress={() => handleClapChoice(n)}
              style={({ pressed }) => [styles.clapBtn, pressed && styles.pressed]}
              accessibilityLabel={`${n} claps`}
            >
              <Text style={styles.clapEmoji}>{Array(n).fill('👏').join(' ')}</Text>
              <Text style={styles.clapNum}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: starScaleVal }] }]}>
          <Text style={styles.starEmoji}>⭐</Text>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 24 },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#22C55E',
    marginBottom: 20,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  speakerEmoji: { fontSize: 36 },
  wordText: { fontSize: 28, fontWeight: '800', color: '#166534' },
  flowersRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  flower: { alignItems: 'center', justifyContent: 'center' },
  flowerEmoji: { fontSize: 28 },
  hint: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  clapRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  clapBtn: {
    backgroundColor: '#FEF9C3',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FACC15',
    minWidth: 80,
    alignItems: 'center',
  },
  clapEmoji: { fontSize: 24, marginBottom: 6 },
  clapNum: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  starWrap: { marginTop: 20 },
  starEmoji: { fontSize: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
