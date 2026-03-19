/**
 * Rhyming Quiz — cat→hat, pin→tin, sun→bun. Game 2 for Grouper Session 10.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTIONS: { word: string; correct: string; wrong: [string, string] }[] = [
  { word: 'cat', correct: 'hat', wrong: ['sun', 'dog'] },
  { word: 'pin', correct: 'tin', wrong: ['cup', 'ball'] },
  { word: 'sun', correct: 'bun', wrong: ['hat', 'cup'] },
];

function getChoices(q: (typeof QUESTIONS)[0]): string[] {
  return [q.correct, q.wrong[0], q.wrong[1]].sort(() => Math.random() - 0.5);
}

export function RhymeQuizMaster({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    QUESTIONS.reduce((acc, _, i) => ({ ...acc, [i]: new Animated.Value(0) }), {} as Record<number, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));

  const current = QUESTIONS[round];
  const choices = getChoices(current);

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
      if (choice === current.correct) {
        speak('Correct!');
        triggerStar();
        if (round + 1 >= QUESTIONS.length) {
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
    return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Rhyming quiz complete!" />;
  }

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });
  const shakeX = shakeAnims[round]?.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) ?? 0;

  return (
    <GameLayout
      title="Rhyming challenge"
      instruction={`Find the rhyme for ${current.word}.`}
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
