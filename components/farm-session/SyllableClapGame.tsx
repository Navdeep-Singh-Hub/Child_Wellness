/**
 * SyllableClapGame.tsx — Game 3: Clap It Out (Syllables)
 * Farm words: donkey (2), chicken (2), tractor (2), apple (2). Tap claps to match syllables.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from './GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const WORDS = [
  { word: 'Donkey', syllables: 2 },
  { word: 'Chicken', syllables: 2 },
  { word: 'Tractor', syllables: 2 },
  { word: 'Apple', syllables: 2 },
];

export function SyllableClapGame({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dotAnims] = useState(() =>
    WORDS.map((_, i) => new Animated.Value(0)).reduce((acc, a, i) => ({ ...acc, [i]: a }), {} as Record<number, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));
  const current = WORDS[round];

  useEffect(() => {
    if (current) speak(current.word, 0.7);
  }, [round]);

  const triggerDots = useCallback((n: number) => {
    const anims = [0, 1].map((i) => dotAnims[i]);
    anims.forEach((a, i) => {
      if (!a) return;
      a.setValue(0);
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    });
  }, [dotAnims]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, [starScale]);

  const handleClapChoice = useCallback(
    (num: number) => {
      if (current.syllables === num) {
        speak('Correct!');
        triggerDots(num);
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
    [current, round, onComplete, triggerDots, triggerStar]
  );

  const playWord = useCallback(() => {
    speak(current.word, 0.7);
  }, [current]);

  if (showSuccess) {
    return <SuccessCelebration variant="mint" title="Great Job!" subtitle="Syllables complete!" />;
  }

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Clap It Out"
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
        <View style={styles.dotsRow}>
          {[1, 2].map((i) => (
            <Animated.View key={i} style={[styles.bouncingDot, { opacity: dotAnims[i - 1]?.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) ?? 0.4 }]} />
          ))}
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
    backgroundColor: '#E3F2FD',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#60A5FA',
    marginBottom: 20,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  speakerEmoji: { fontSize: 36 },
  wordText: { fontSize: 28, fontWeight: '800', color: '#1e40af' },
  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  bouncingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FACC15',
  },
  hint: { fontSize: 18, color: '#4b5563', marginBottom: 20 },
  clapRow: { flexDirection: 'row', gap: 20 },
  clapBtn: {
    backgroundColor: '#FFFDE7',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FACC15',
    minWidth: 90,
    alignItems: 'center',
  },
  clapEmoji: { fontSize: 28, marginBottom: 8 },
  clapNum: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  starWrap: { marginTop: 20 },
  starEmoji: { fontSize: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#4CAF50' },
});
