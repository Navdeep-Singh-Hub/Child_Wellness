/**
 * Clap the Word — One syllable (cat, bat, hat). Game 3 for Grouper Session 1.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const WORDS = [{ word: 'cat' }, { word: 'bat' }, { word: 'hat' }];

export function ClapWord({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clapAnim] = useState(() => new Animated.Value(0));
  const [starScale] = useState(() => new Animated.Value(0));
  const current = WORDS[round];

  useEffect(() => {
    if (current) speak(current.word, 0.7);
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
    speak('Correct!');
    triggerStar();
    if (round + 1 >= WORDS.length) {
      speak('Great job!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 1800);
    } else {
      setRound((r) => r + 1);
    }
  }, [round, onComplete, triggerClap, triggerStar]);

  const playWord = useCallback(() => speak(current.word, 0.7), [current]);

  if (showSuccess) return <SuccessCelebration variant="indigo" />;

  const scale = clapAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Clap the syllables"
      instruction="Tap the clap button once for each word."
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
        <Text style={styles.hint}>Tap CLAP once:</Text>
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
  clapWrap: { marginBottom: 24 },
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
  starWrap: { marginTop: 16 },
  starEmoji: { fontSize: 44 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
