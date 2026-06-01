import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import ResultCard from '@/components/game/ResultCard';
import { SparkleBurst } from '@/components/game/FX';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const CIRCLE_SIZE = 100;
const NUMBERS_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function formatSequenceSpeech(seq: number[]): string {
  if (seq.length === 0) return '';
  if (seq.length === 1) return String(seq[0]);
  return `${seq.slice(0, -1).join(', then ')}, then ${seq[seq.length - 1]}`;
}

function generateNumberSequence(): { sequence: number[]; slots: number[] } {
  const pool = [...NUMBERS_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const sequence = pool.slice(0, 3);
  const slots = [...sequence].sort(() => Math.random() - 0.5);
  return { sequence, slots };
}

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri },
        { volume: 0.6, shouldPlay: false },
      );
      soundRef.current = sound;
    } catch {
      console.warn('Failed to load sound:', uri);
    }
  }, [uri]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const play = useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch {}
  }, [ensureSound]);

  return play;
};

const TapTheNumbersGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);
  const playError = useSoundEffect(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(true);
  const [sequence, setSequence] = useState<number[]>([1, 2, 3]);
  const [slotNumbers, setSlotNumbers] = useState<number[]>([1, 2, 3]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);

  // Animation values for each circle
  const circle1Scale = useSharedValue(1);
  const circle1X = useSharedValue(0);
  const circle2Scale = useSharedValue(1);
  const circle2X = useSharedValue(0);
  const circle3Scale = useSharedValue(1);
  const circle3X = useSharedValue(0);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  const circleScales = [circle1Scale, circle2Scale, circle3Scale];
  const circleShakes = [circle1X, circle2X, circle3X];

  // End game function (defined before use)
  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 18; // 18 XP per successful sequence
      const accuracy = (finalScore / total) * 100;

      // Set all states together FIRST (like CatchTheBouncingStar)
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setRoundActive(false);
      setShowCongratulations(true);

      speakTTS('Amazing work! You completed the game!', 0.78);

      // Log game in background (don't wait for it)
      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'tapTheNumbers',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['early-sequencing', 'number-order-foundation', 'working-memory'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log tap the numbers game:', e);
      }
    },
    [router],
  );

  const setupRound = useCallback(
    (speakHint: boolean) => {
      const { sequence: nextSequence, slots } = generateNumberSequence();
      setSequence(nextSequence);
      setSlotNumbers(slots);
      setCurrentSequenceIndex(0);
      setRoundActive(true);
      if (speakHint) {
        try {
          speakTTS(`Tap the numbers in order: ${formatSequenceSpeech(nextSequence)}!`, 0.78);
        } catch {}
      }
    },
    [],
  );

  // Handle tap
  const handleTap = useCallback(
    async (number: number, slotIndex: number) => {
      if (!roundActive || done || isShaking) return;

      const expectedNumber = sequence[currentSequenceIndex];

      if (number === expectedNumber) {
        circleScales[slotIndex].value = withSequence(
          withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        );

        const newIndex = currentSequenceIndex + 1;

        if (newIndex >= sequence.length) {
          sparkleX.value = 50;
          sparkleY.value = 50;

          setScore((s) => {
            const newScore = s + 1;
            if (newScore >= TOTAL_ROUNDS) {
              setTimeout(() => {
                endGame(newScore);
              }, 1000);
            } else {
              setTimeout(() => {
                setRound((r) => r + 1);
              }, 800);
            }
            return newScore;
          });

          try {
            playSuccess();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            speakTTS('Perfect sequence!', 0.78);
          } catch {}
        } else {
          setCurrentSequenceIndex(newIndex);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
      } else {
        setIsShaking(true);
        circleShakes[slotIndex].value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );

        setCurrentSequenceIndex(0);

        try {
          playError();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          speakTTS(`Try again! Tap ${formatSequenceSpeech(sequence)}.`, 0.78);
        } catch {}

        setTimeout(() => {
          setIsShaking(false);
        }, 500);
      }
    },
    [roundActive, done, isShaking, currentSequenceIndex, sequence, playSuccess, playError, endGame, circleScales, circleShakes],
  );

  useEffect(() => {
    if (done) return;
    setupRound(true);
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [round, done, setupRound]);

  const handleBack = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [onBack]);

  // Animated styles
  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: circle1Scale.value },
      { translateX: circle1X.value },
    ],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: circle2Scale.value },
      { translateX: circle2X.value },
    ],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [
      { scale: circle3Scale.value },
      { translateX: circle3X.value },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    left: `${sparkleX.value}%`,
    top: `${sparkleY.value}%`,
  }));

  // Get expected number for highlighting
  const expectedNumber = sequence[currentSequenceIndex];
  const sequenceHint = formatSequenceSpeech(sequence);

  // Result screen
  if (done && finalStats) {
    const accuracyPct = Math.round((finalStats.correct / finalStats.total) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backChip}>
          <Text style={styles.backChipText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🔢</Text>
            <Text style={styles.resultTitle}>Number master!</Text>
            <Text style={styles.resultSubtitle}>
              You completed {finalStats.correct} sequences out of {finalStats.total}!
            </Text>
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onHome={() => {
                stopAllSpeech();
                cleanupSounds();
                onBack?.();
              }}
              onPlayAgain={() => {
                setScore(0);
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
                setShowCongratulations(false);
                setRound(1);
                circle1Scale.value = 1;
                circle2Scale.value = 1;
                circle3Scale.value = 1;
                circle1X.value = 0;
                circle2X.value = 0;
                circle3X.value = 0;
              }}
            />
            <Text style={styles.savedText}>Saved! XP updated ✅</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backChip}>
        <Text style={styles.backChipText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.title}>Tap The Numbers</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🔢 Score: {score}
        </Text>
        <Text style={styles.helper}>
          Tap in order: {sequenceHint}
        </Text>
      </View>

      <View style={styles.playArea}>
        <View style={styles.circlesContainer}>
          {slotNumbers.map((num, slotIndex) => {
            const circleStyle = slotIndex === 0 ? circle1Style : slotIndex === 1 ? circle2Style : circle3Style;
            const isNext = num === expectedNumber;
            return (
              <Animated.View key={`slot-${slotIndex}-${num}`} style={[styles.circleContainer, circleStyle]}>
                <Pressable
                  onPress={() => handleTap(num, slotIndex)}
                  style={[
                    styles.circle,
                    {
                      backgroundColor: isNext ? '#22C55E' : '#3B82F6',
                      borderColor: isNext ? '#16A34A' : '#2563EB',
                      borderWidth: isNext ? 4 : 2,
                    },
                  ]}
                  disabled={!roundActive || done || isShaking}
                >
                  <Text style={styles.circleNumber}>{num}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Tap {expectedNumber} next
          </Text>
          <View style={styles.progressDots}>
            {sequence.map((num, idx) => (
              <View
                key={`progress-${idx}-${num}`}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: idx < currentSequenceIndex ? '#22C55E' : idx === currentSequenceIndex ? '#3B82F6' : '#E2E8F0',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Sparkle burst on success */}
        {score > 0 && !isShaking && (
          <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
            <SparkleBurst />
          </Animated.View>
        )}
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: early sequencing • number-order foundation • working memory
        </Text>
        <Text style={styles.footerSub}>
          Each round uses a new number order. Tap the highlighted number first, then the rest in order.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  backChip: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerBlock: {
    marginTop: 72,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 6,
  },
  helper: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  playArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  circleContainer: {
    margin: 10,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  circleNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 12,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sparkleContainer: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 4,
  },
  footerBox: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  footerMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
    textAlign: 'center',
  },
  savedText: {
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default TapTheNumbersGame;

