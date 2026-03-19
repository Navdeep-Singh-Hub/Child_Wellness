/**
 * Match rhyming words: cat→hat, pin→tin, sun→bun, top→hop, fan→man. Game 2 for Grouper Session 9.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS: { word: string; rhyme: string }[] = [
  { word: 'cat', rhyme: 'hat' },
  { word: 'pin', rhyme: 'tin' },
  { word: 'sun', rhyme: 'bun' },
  { word: 'top', rhyme: 'hop' },
  { word: 'fan', rhyme: 'man' },
];

function getWrongChoices(currentRhyme: string): string[] {
  const others = PAIRS.map((p) => p.rhyme).filter((r) => r !== currentRhyme);
  return others.sort(() => Math.random() - 0.5).slice(0, 2);
}

export function RhymeMatchPuzzleChallenge({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    PAIRS.reduce((acc, _, i) => ({ ...acc, [i]: new Animated.Value(0) }), {} as Record<number, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));

  const current = PAIRS[round];
  const choices = [current.rhyme, ...getWrongChoices(current.rhyme)].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (current) speak(`Find the word that rhymes with ${current.word}.`, 0.75);
  }, [round]);

  const triggerShake = useCallback((r: number) => {
    const a = shakeAnims[r];
    if (!a) return;
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [starScale]);

  const handleChoice = useCallback(
    (choice: string) => {
      if (choice === current.rhyme) {
        speak('Correct!');
        triggerStar();
        if (round + 1 >= PAIRS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 1800);
        } else {
          setRound((r) => r + 1);
        }
      } else {
        speak('Try again.');
        triggerShake(round);
      }
    },
    [round, current, onComplete, triggerShake, triggerStar]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All rhymes matched!" />;
  }

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });
  const shakeX = shakeAnims[round]?.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) ?? 0;

  return (
    <GameLayout
      title="Match the rhyming words"
      instruction={`Find the word that rhymes with ${current.word}.`}
    >
      <View style={styles.content}>
        <View style={styles.promptBox}>
          <Text style={styles.promptWord}>{current.word}</Text>
        </View>
        <Text style={styles.hint}>Tap the word that rhymes:</Text>
        <View style={styles.choicesRow}>
          {choices.map((c) => (
            <Animated.View key={c} style={{ transform: [{ translateX: shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(c)}
                style={({ pressed }) => [styles.choiceBtn, pressed && styles.pressed]}
                accessibilityLabel={c}
              >
                <Text style={styles.choiceLabel}>{c}</Text>
              </Pressable>
            </Animated.View>
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
  promptBox: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    marginBottom: 24,
  },
  promptWord: { fontSize: 32, fontWeight: '800', color: '#3730A3' },
  hint: { fontSize: 20, color: '#4b5563', marginBottom: 20 },
  choicesRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  choiceBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 80,
  },
  pressed: { opacity: 0.9 },
  choiceLabel: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  starWrap: { marginTop: 24 },
  starEmoji: { fontSize: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
