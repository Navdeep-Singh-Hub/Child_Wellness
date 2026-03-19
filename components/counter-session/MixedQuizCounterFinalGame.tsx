/**
 * Level 5 Counter — Session 10, Game 1: Mixed Quiz
 * Identify shapes and colors: pick the correct item for each prompt (2 rounds).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Option = { id: string; label: string; emoji: string };
type Round = { prompt: string; correctId: string; options: Option[]; badgeEmoji: string };

export interface MixedQuizCounterFinalGameProps {
  onComplete: () => void;
}

export function MixedQuizCounterFinalGame({ onComplete }: MixedQuizCounterFinalGameProps) {
  const rounds: Round[] = useMemo(
    () => [
      {
        prompt: 'Tap the BLUE circle.',
        correctId: 'blue-circle',
        badgeEmoji: '🔵',
        options: [
          { id: 'blue-circle', label: 'Blue Circle', emoji: '🔵' },
          { id: 'red-square', label: 'Red Square', emoji: '🟥' },
          { id: 'green-triangle', label: 'Green Triangle', emoji: '🔺' },
        ],
      },
      {
        prompt: 'Tap the RED square.',
        correctId: 'red-square',
        badgeEmoji: '🟥',
        options: [
          { id: 'green-circle', label: 'Green Circle', emoji: '🟢' },
          { id: 'red-square', label: 'Red Square', emoji: '🟥' },
          { id: 'blue-triangle', label: 'Blue Triangle', emoji: '🔷' },
        ],
      },
    ],
    []
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  const current = rounds[roundIndex];

  useEffect(() => {
    speak(current.prompt, 0.75);
  }, [current.prompt]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === current.correctId) {
        speak('Correct!', 0.7);
        const next = roundIndex + 1;
        if (next >= rounds.length) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          setRoundIndex(next);
        }
      } else {
        triggerWrong();
      }
    },
    [current.correctId, onComplete, roundIndex, rounds.length, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You identified shapes and colors!"
        badgeEmoji="🎯"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Mixed Quiz"
      instruction={current.prompt}
      icon="❓"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>{current.prompt}</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {current.options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={styles.label}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.progress}>Question {roundIndex + 1} / {rounds.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#0369A1', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optionBtn: {
    minWidth: 110,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
  progress: { marginTop: 18, fontSize: 14, fontWeight: '700', color: '#64748B' },
});

