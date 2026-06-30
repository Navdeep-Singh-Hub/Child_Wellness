/**
 * Game 2: Letter Lookout — tap the correct letter in 6 rounds.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Easing, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from './letters-shared/LetterGameShell';
import { LetterMascot } from './letters-shared/LetterMascot';
import { letterColor } from './letters-shared/letterColors';
import { LOOKOUT, SHELL_LOOKOUT } from './letter-lookout/theme';
import { LETTER_NAMES } from './letterData';

const ROUNDS = 6;
const OPTIONS_COUNT = 4;

function shuffled<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function buildRound(round: number): { target: string; options: string[] } {
  const target = LETTER_NAMES[round % LETTER_NAMES.length];
  const others = LETTER_NAMES.filter((l) => l !== target);
  const picks = shuffled(others).slice(0, OPTIONS_COUNT - 1);
  return { target, options: shuffled([target, ...picks]) };
}

export function LetterRecognitionGame({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const data = useMemo(() => buildRound(round), [round]);

  const scaleAnims = useRef(
    Object.fromEntries(LETTER_NAMES.map((l) => [l, new RNAnimated.Value(1)])) as Record<string, RNAnimated.Value>,
  ).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    speak(`Tap the letter ${data.target}`, 0.72);
  }, [round, data.target]);

  const handleTap = useCallback(
    (letter: string) => {
      if (feedback) return;

      const anim = scaleAnims[letter];
      if (!reduceMotion) {
        RNAnimated.sequence([
          RNAnimated.timing(anim, { toValue: 1.2, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
          RNAnimated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
      }

      if (letter === data.target) {
        setFeedback('correct');
        speak('Correct!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        setTimeout(() => {
          setFeedback(null);
          if (round >= ROUNDS - 1) {
            setShowConfetti(true);
            speak('Sharp eyes! You found every letter!', 0.72);
            setTimeout(() => {
              setShowConfetti(false);
              onComplete();
            }, reduceMotion ? 500 : 1500);
          } else {
            setRound((r) => r + 1);
          }
        }, reduceMotion ? 400 : 900);
      } else {
        setFeedback('wrong');
        speak('Not quite. Try again!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (_) {}
        setTimeout(() => setFeedback(null), 600);
      }
    },
    [feedback, data.target, round, scaleAnims, onComplete, reduceMotion],
  );

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: LOOKOUT.stage }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: LOOKOUT.spotlight }]} />
      </View>

      <LetterGameShell
        theme={SHELL_LOOKOUT}
        gameLabel="LETTER LOOKOUT"
        gameTitle="Find the Letter"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🔦"
          name="Scout"
          hint={`Tap the letter ${data.target}!`}
          accent={LOOKOUT.accent}
          bubbleBg={LOOKOUT.panel}
          bubbleBorder={LOOKOUT.panelBorder}
          nameColor={LOOKOUT.accent}
          hintColor={LOOKOUT.textLight}
        />

        <View style={styles.outer}>
          <Text style={styles.prompt}>
            Find: <Text style={styles.targetLetter}>{data.target}</Text>
          </Text>
          <Text style={styles.roundInfo}>Round {round + 1} / {ROUNDS}</Text>
          {feedback === 'correct' && <Text style={styles.correctText}>Correct! ✓</Text>}
          {feedback === 'wrong' && <Text style={styles.wrongText}>Try again!</Text>}
          <View style={styles.optionsGrid}>
            {data.options.map((letter) => {
              const idx = LETTER_NAMES.indexOf(letter);
              const col = letterColor(idx);
              return (
                <RNAnimated.View key={`${round}-${letter}`} style={{ transform: [{ scale: scaleAnims[letter] }] }}>
                  <Pressable
                    onPress={() => handleTap(letter)}
                    style={({ pressed }) => [
                      styles.letterBtn,
                      { borderColor: col, backgroundColor: pressed ? col + '25' : 'rgba(255,255,255,0.95)' },
                    ]}
                  >
                    <Text style={[styles.letterText, { color: col }]}>{letter}</Text>
                  </Pressable>
                </RNAnimated.View>
              );
            })}
          </View>
        </View>
      </LetterGameShell>
      {showConfetti && <ConfettiEffect />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  outer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  prompt: { fontSize: 20, fontWeight: '700', color: LOOKOUT.textLight, marginBottom: 8, textAlign: 'center' },
  targetLetter: { fontSize: 40, fontWeight: '900', color: LOOKOUT.accent },
  roundInfo: { fontSize: 14, color: LOOKOUT.textMuted, marginBottom: 12 },
  correctText: { fontSize: 20, fontWeight: '800', color: LOOKOUT.correct, marginBottom: 8 },
  wrongText: { fontSize: 20, fontWeight: '800', color: LOOKOUT.wrong, marginBottom: 8 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 16 },
  letterBtn: {
    width: 100,
    height: 110,
    borderRadius: 20,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  letterText: { fontSize: 52, fontWeight: '900' },
});
