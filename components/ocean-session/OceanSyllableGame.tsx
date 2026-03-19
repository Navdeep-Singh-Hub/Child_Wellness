/**
 * OceanSyllableGame — Game 3: Clap It Out (Ocean)
 * octopus (3), shark (1), turtle (2), dolphin (2). Bouncing bubbles, star on correct.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const WORDS = [
  { word: 'Octopus', syllables: 3 },
  { word: 'Shark', syllables: 1 },
  { word: 'Turtle', syllables: 2 },
  { word: 'Dolphin', syllables: 2 },
];

export function OceanSyllableGame({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bubbleAnims] = useState(() =>
    [0, 1, 2].map((i) => new Animated.Value(0)).reduce((acc, a, i) => ({ ...acc, [i]: a }), {} as Record<number, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));
  const current = WORDS[round];

  useEffect(() => {
    if (current) speak(current.word, 0.7);
  }, [round]);

  const triggerBubbles = useCallback((n: number) => {
    for (let i = 0; i < 3; i++) {
      const a = bubbleAnims[i];
      if (!a) continue;
      a.setValue(0);
      if (i < n) {
        Animated.sequence([
          Animated.timing(a, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [bubbleAnims]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [starScale]);

  const handleClapChoice = useCallback(
    (num: number) => {
      if (current.syllables === num) {
        speak('Correct!');
        triggerBubbles(num);
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
    [current, round, onComplete, triggerBubbles, triggerStar]
  );

  const playWord = useCallback(() => speak(current.word, 0.7), [current]);

  if (showSuccess) {
    return <SuccessCelebration variant="ocean" title="Great Job!" subtitle="Syllables complete!" />;
  }

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Clap the Ocean Words"
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
        <View style={styles.bubblesRow}>
          {[0, 1, 2].map((i) => {
            const opacity = bubbleAnims[i]?.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
            return (
              <Animated.View
                key={i}
                style={[styles.bubble, opacity != null ? { opacity } : { opacity: 0.4 }]}
              />
            );
          })}
        </View>
        <Text style={styles.hint}>Tap the number of claps:</Text>
        <View style={styles.clapRow}>
          {[1, 2, 3].map((n) => (
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
    backgroundColor: '#E0F2FE',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    marginBottom: 20,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  speakerEmoji: { fontSize: 36 },
  wordText: { fontSize: 28, fontWeight: '800', color: '#0369A1' },
  bubblesRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  bubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
  },
  hint: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  clapRow: { flexDirection: 'row', gap: 20 },
  clapBtn: {
    backgroundColor: '#FFF1F2',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FB7185',
    minWidth: 90,
    alignItems: 'center',
  },
  clapEmoji: { fontSize: 28, marginBottom: 8 },
  clapNum: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  starWrap: { marginTop: 20 },
  starEmoji: { fontSize: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#0EA5E9' },
});
