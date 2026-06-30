/**
 * Game 2: Signal Tower — identify letters in 8 rounds.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated, Easing, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { LetterGameShell } from '@/components/level1-straight-letters-session/letters-shared/LetterGameShell';
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';
import { letterColor } from './slant-shared/letterColors';
import { LETTER_NAMES } from './letterData';

const ROUNDS = 8;
const OPT_COUNT = 4;

const SHELL = {
  bg: '#1C1917',
  labelColor: '#FDBA74',
  titleColor: '#FFF7ED',
  textOnDark: '#FFF7ED',
  backBg: 'rgba(255,255,255,0.08)',
  backBorder: 'rgba(251,146,60,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#FB923C',
  dotDone: '#22D3EE',
};

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
            speak('The signal is clear! You found every letter!', 0.72);
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
        speak('Try again!', 0.72);
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (_) {}
        setTimeout(() => setFeedback(null), 600);
      }
    },
    [feedback, data.target, round, scaleAnims, onComplete, reduceMotion],
  );

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(251,146,60,0.1)' }]} />
      </View>
      <LetterGameShell
        theme={SHELL}
        gameLabel="SIGNAL TOWER"
        gameTitle="Find the Letter"
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      >
        <LetterMascot
          emoji="🗼"
          name="Beacon"
          hint={`Spot letter ${data.target} in the tower lights!`}
          accent="#FB923C"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(251,146,60,0.35)"
          nameColor="#FB923C"
          hintColor="#FFF7ED"
        />
        <View style={styles.outer}>
          <Text style={styles.prompt}>Signal: <Text style={styles.target}>{data.target}</Text></Text>
          <Text style={styles.roundInfo}>Round {round + 1} / {ROUNDS}</Text>
          {feedback === 'correct' && <Text style={styles.correct}>Correct! ✓</Text>}
          {feedback === 'wrong' && <Text style={styles.wrong}>Try again!</Text>}
          <View style={styles.grid}>
            {data.options.map((l) => {
              const col = letterColor(LETTER_NAMES.indexOf(l));
              return (
                <RNAnimated.View key={`${round}-${l}`} style={{ transform: [{ scale: scaleAnims[l] }] }}>
                  <Pressable
                    onPress={() => handleTap(l)}
                    style={({ pressed }) => [styles.btn, { borderColor: col, backgroundColor: pressed ? col + '25' : 'rgba(255,255,255,0.95)' }]}
                  >
                    <Text style={[styles.btnText, { color: col }]}>{l}</Text>
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
  prompt: { fontSize: 20, fontWeight: '700', color: '#FFF7ED', marginBottom: 8 },
  target: { fontSize: 40, fontWeight: '900', color: '#FB923C' },
  roundInfo: { fontSize: 14, color: '#FDBA74', marginBottom: 12 },
  correct: { fontSize: 20, fontWeight: '800', color: '#34D399', marginBottom: 8 },
  wrong: { fontSize: 20, fontWeight: '800', color: '#F87171', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 16 },
  btn: {
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
  btnText: { fontSize: 52, fontWeight: '900' },
});
