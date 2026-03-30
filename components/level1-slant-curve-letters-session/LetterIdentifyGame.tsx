/**
 * Game 2: Letter Identification — "Tap the letter O"
 * 4 options, 8 rounds, randomised from the 14-letter set.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LETTER_NAMES } from './letterData';

const ROUNDS = 8;
const OPT_COUNT = 4;
const COLORS = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#6366F1', '#10B981', '#E11D48', '#0EA5E9',
  '#A855F7', '#D946EF',
];

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function buildRound(round: number) {
  const target = LETTER_NAMES[round % LETTER_NAMES.length];
  const others = shuffle(LETTER_NAMES.filter((l) => l !== target)).slice(0, OPT_COUNT - 1);
  return { target, options: shuffle([target, ...others]) };
}

export function LetterIdentifyGame({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const data = useMemo(() => buildRound(round), [round]);

  const scaleAnims = useRef(
    Object.fromEntries(LETTER_NAMES.map((l) => [l, new RNAnimated.Value(1)])) as Record<string, RNAnimated.Value>
  ).current;

  useEffect(() => {
    try { Speech.stop(); Speech.speak(`Tap the letter ${data.target}`, { rate: 0.85, pitch: 1.1 }); } catch (_) {}
  }, [round, data.target]);

  const handleTap = useCallback((letter: string) => {
    if (feedback) return;
    const anim = scaleAnims[letter];
    RNAnimated.sequence([
      RNAnimated.timing(anim, { toValue: 1.2, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
      RNAnimated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    if (letter === data.target) {
      setFeedback('correct');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
      try { Speech.stop(); Speech.speak('Correct!', { rate: 0.9 }); } catch (_) {}
      setTimeout(() => {
        setFeedback(null);
        if (round >= ROUNDS - 1) {
          setShowConfetti(true);
          setTimeout(() => { setShowConfetti(false); onComplete(); }, 1500);
        } else {
          setRound((r) => r + 1);
        }
      }, 900);
    } else {
      setFeedback('wrong');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (_) {}
      setTimeout(() => setFeedback(null), 600);
    }
  }, [feedback, data.target, round, scaleAnims, onComplete]);

  return (
    <GameContainerGrip
      title="Find the Letter"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="🔍"
      mascotHint={`Tap the letter ${data.target}!`}
      onBack={onBack}
    >
      <View style={styles.outer}>
        <Text style={styles.prompt}>Tap: <Text style={styles.target}>{data.target}</Text></Text>
        <Text style={styles.roundInfo}>Round {round + 1} / {ROUNDS}</Text>
        {feedback === 'correct' && <Text style={styles.correct}>Correct! ✓</Text>}
        {feedback === 'wrong' && <Text style={styles.wrong}>Try again!</Text>}
        <View style={styles.grid}>
          {data.options.map((l) => {
            const col = COLORS[LETTER_NAMES.indexOf(l) % COLORS.length];
            return (
              <RNAnimated.View key={l} style={{ transform: [{ scale: scaleAnims[l] }] }}>
                <Pressable onPress={() => handleTap(l)}
                  style={({ pressed }) => [styles.btn, { borderColor: col, backgroundColor: pressed ? col + '20' : '#FFF' }]}>
                  <Text style={[styles.btnText, { color: col }]}>{l}</Text>
                </Pressable>
              </RNAnimated.View>
            );
          })}
        </View>
      </View>
      {showConfetti && <ConfettiEffect />}
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  prompt: { fontSize: 22, fontWeight: '700', color: '#5B21B6', marginBottom: 8 },
  target: { fontSize: 36, fontWeight: '900', color: '#7C3AED' },
  roundInfo: { fontSize: 14, color: '#6D28D9', marginBottom: 12 },
  correct: { fontSize: 20, fontWeight: '800', color: '#059669', marginBottom: 8 },
  wrong: { fontSize: 20, fontWeight: '800', color: '#DC2626', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 16 },
  btn: { width: 100, height: 110, borderRadius: 20, borderWidth: 4, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  btnText: { fontSize: 52, fontWeight: '900' },
});
