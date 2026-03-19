/**
 * Clap the syllables — rabbit (2), tiger (2), monkey (2). Game 3 for Grouper Session 4.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const WORDS = [
  { word: 'rabbit', syllables: 2 },
  { word: 'tiger', syllables: 2 },
  { word: 'monkey', syllables: 2 },
];

export function SyllableClapMixed({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [claps, setClaps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clapAnim] = useState(() => new Animated.Value(0));
  const [starScale] = useState(() => new Animated.Value(0));

  const current = WORDS[round];
  const targetClaps = current.syllables;

  useEffect(() => {
    if (current) speak(current.word, 0.7);
    setClaps(0);
  }, [round]);

  const triggerClap = useCallback(() => {
    clapAnim.setValue(0);
    Animated.sequence([
      Animated.timing(clapAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(clapAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [clapAnim]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [starScale]);

  const handleClap = useCallback(() => {
    triggerClap();
    const next = claps + 1;
    setClaps(next);
    if (next === targetClaps) {
      speak('Correct!');
      triggerStar();
      if (round + 1 >= WORDS.length) {
        speak('Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 1800);
      } else {
        setRound((r) => r + 1);
      }
    }
  }, [claps, targetClaps, round, onComplete, triggerClap, triggerStar]);

  const playWord = useCallback(() => speak(current.word, 0.7), [current]);

  if (showSuccess) return <SuccessCelebration variant="indigo" />;

  const scale = clapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Clap the syllables"
      instruction="Tap the clap button for each syllable."
    >
      <View style={styles.content}>
        <Pressable
          onPress={playWord}
          style={({ pressed }) => [styles.wordBtn, pressed && styles.pressed]}
          accessibilityLabel={`Play word ${current.word}`}
        >
          <Text style={styles.speaker}>🔊</Text>
          <Text style={styles.wordText}>{current.word}</Text>
        </Pressable>
        <Text style={styles.hint}>Tap CLAP {targetClaps} times:</Text>
        <Animated.View style={[styles.clapWrap, { transform: [{ scale }] }]}>
          <Pressable
            onPress={handleClap}
            style={({ pressed }) => [styles.clapBtn, pressed && styles.pressed]}
            accessibilityLabel="Clap"
          >
            <Text style={styles.clapEmoji}>👏</Text>
            <Text style={styles.clapLabel}>CLAP</Text>
          </Pressable>
        </Animated.View>
        <Text style={styles.clapCount}>{claps} / {targetClaps}</Text>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: starScaleVal }] }]}>
          <Text style={styles.starEmoji}>⭐</Text>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 24 },
  wordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#4F46E5',
    marginBottom: 28,
    gap: 16,
  },
  pressed: { opacity: 0.9 },
  speaker: { fontSize: 40 },
  wordText: { fontSize: 36, fontWeight: '800', color: '#3730A3' },
  hint: { fontSize: 20, color: '#4b5563', marginBottom: 24 },
  clapWrap: { marginBottom: 12 },
  clapBtn: {
    backgroundColor: '#FEF9C3',
    paddingVertical: 28,
    paddingHorizontal: 48,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FACC15',
    alignItems: 'center',
  },
  clapEmoji: { fontSize: 48, marginBottom: 8 },
  clapLabel: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  clapCount: { fontSize: 18, color: '#6b7280', marginBottom: 16 },
  starWrap: { marginTop: 8 },
  starEmoji: { fontSize: 44 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
