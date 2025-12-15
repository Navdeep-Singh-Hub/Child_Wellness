import { logGameAndAward, recordGame } from '@/utils/api';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
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
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const TARGET_SIZE = 120;
const MAX_TAP_DELAY = 200; // Maximum time between taps (ms)

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

const TwoFingerSimultaneousTapGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);
  const playError = useSoundEffect(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [lastResult, setLastResult] = useState<'hit' | 'miss' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [sparkleX, setSparkleX] = useState(0);
  const [sparkleY, setSparkleY] = useState(0);

  // Animation values
  const target1X = useSharedValue(30); // Left target (%)
  const target1Y = useSharedValue(50); // Center vertically (%)
  const target1Scale = useSharedValue(1);
  const target1Opacity = useSharedValue(1);
  const target2X = useSharedValue(70); // Right target (%)
  const target2Y = useSharedValue(50); // Center vertically (%)
  const target2Scale = useSharedValue(1);
  const target2Opacity = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);

  const roundActiveRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const firstTapTimeRef = useRef<number | null>(null);
  const firstTapTargetRef = useRef<'left' | 'right' | null>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    roundRef.current = round;
    scoreRef.current = score;
  }, [round, score]);

  // End game function
  const endGame = useCallback(async () => {
    if (done) return;
    setDone(true);
    setRoundActive(false);
    roundActiveRef.current = false;

    const finalScore = scoreRef.current;
    const totalRounds = TOTAL_ROUNDS;
    const xp = Math.floor((finalScore / totalRounds) * 50);

    try {
      const timestamp = await recordGame({
        type: 'twoFingerSimultaneousTap',
        score: finalScore,
        totalRounds,
        correct: finalScore,
        incorrect: totalRounds - finalScore,
      });

      await logGameAndAward({
        gameType: 'twoFingerSimultaneousTap',
        score: finalScore,
        totalRounds,
        correct: finalScore,
        incorrect: totalRounds - finalScore,
        xp,
      });

      setFinalStats({
        correct: finalScore,
        total: totalRounds,
        xp,
      });
      setLogTimestamp(timestamp);
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }, [done]);

  // Handle wrong timing (taps too far apart)
  const handleWrongTiming = useCallback(async () => {
    if (!roundActiveRef.current || done) return;

    setLastResult('miss');
    setShowFeedback(true);
    feedbackOpacity.value = withTiming(1, { duration: 200 });

    // Shake both targets
    target1Scale.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(1.1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 100, easing: Easing.in(Easing.ease) })
    );
    target2Scale.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(1.1, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 100, easing: Easing.in(Easing.ease) })
    );

    try {
      await playError();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Speech.speak('Try together!', { rate: 0.78 });
    } catch {}

    setTimeout(() => {
      setShowFeedback(false);
      feedbackOpacity.value = 0;
      // Reset tap tracking
      firstTapTimeRef.current = null;
      firstTapTargetRef.current = null;
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    }, 2000);
  }, [done, target1Scale, target2Scale, feedbackOpacity, playError]);

  // Handle successful simultaneous tap
  const handleSuccess = useCallback(async () => {
    if (!roundActiveRef.current || done) return;

    setLastResult('hit');
    setShowFeedback(true);
    setRoundActive(false);
    roundActiveRef.current = false;
    setScore((s) => s + 1);

    // Pop animation for both targets
    target1Scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 200 }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
    );
    target1Opacity.value = withTiming(0, { duration: 200 });
    target2Scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 200 }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
    );
    target2Opacity.value = withTiming(0, { duration: 200 });

    feedbackOpacity.value = withTiming(1, { duration: 200 });

    setSparkleX(50);
    setSparkleY(50);
    setSparkleKey((k) => k + 1);

    // Reset tap tracking
    firstTapTimeRef.current = null;
    firstTapTargetRef.current = null;
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    try {
      await playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak('Perfect!', { rate: 0.78 });
    } catch {}

    if (roundRef.current >= TOTAL_ROUNDS) {
      setTimeout(() => {
        endGame();
      }, 1500);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        feedbackOpacity.value = 0;
        setRound((r) => r + 1);
        setTimeout(() => {
          startRound();
        }, 500);
      }, 1500);
    }
  }, [done, target1Scale, target1Opacity, target2Scale, target2Opacity, feedbackOpacity, playSuccess, endGame]);

  // Handle tap on target
  const handleTargetTap = useCallback((target: 'left' | 'right') => {
    if (!roundActiveRef.current || done) return;

    const now = Date.now();

    if (firstTapTimeRef.current === null) {
      // First tap
      firstTapTimeRef.current = now;
      firstTapTargetRef.current = target;

      // Set timeout - if second tap doesn't come in time, it's wrong
      tapTimeoutRef.current = setTimeout(() => {
        runOnJS(handleWrongTiming)();
      }, MAX_TAP_DELAY);
    } else {
      // Second tap
      const timeDiff = now - firstTapTimeRef.current;

      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }

      // Check if taps are on different targets and within time limit
      if (
        firstTapTargetRef.current !== target &&
        timeDiff <= MAX_TAP_DELAY
      ) {
        // Success!
        runOnJS(handleSuccess)();
      } else {
        // Wrong timing or same target
        runOnJS(handleWrongTiming)();
      }
    }
  }, [done, handleSuccess, handleWrongTiming]);

  // Start a new round
  const startRound = useCallback(() => {
    if (done) return;

    setRoundActive(true);
    roundActiveRef.current = true;
    setLastResult(null);
    setShowFeedback(false);
    feedbackOpacity.value = 0;

    // Reset targets
    target1Scale.value = 1;
    target1Opacity.value = 1;
    target2Scale.value = 1;
    target2Opacity.value = 1;

    // Reset tap tracking
    firstTapTimeRef.current = null;
    firstTapTargetRef.current = null;
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  }, [done, target1Scale, target1Opacity, target2Scale, target2Opacity, feedbackOpacity]);

  // Start first round
  useEffect(() => {
    startRound();
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // Animated styles
  const target1AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: TARGET_SIZE,
      height: TARGET_SIZE,
      left: `${target1X.value}%`,
      top: `${target1Y.value}%`,
      transform: [
        { translateX: -TARGET_SIZE / 2 },
        { translateY: -TARGET_SIZE / 2 },
        { scale: target1Scale.value },
      ],
      opacity: target1Opacity.value,
    };
  });

  const target2AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: TARGET_SIZE,
      height: TARGET_SIZE,
      left: `${target2X.value}%`,
      top: `${target2Y.value}%`,
      transform: [
        { translateX: -TARGET_SIZE / 2 },
        { translateY: -TARGET_SIZE / 2 },
        { scale: target2Scale.value },
      ],
      opacity: target2Opacity.value,
    };
  });

  const feedbackStyle = useAnimatedStyle(() => {
    return {
      opacity: feedbackOpacity.value,
    };
  });

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  if (done && finalStats) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backChip}>
          <Text style={styles.backChipText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ResultCard
            correct={finalStats.correct}
            total={finalStats.total}
            xp={finalStats.xp}
            onPlayAgain={() => {
              setDone(false);
              setRound(1);
              setScore(0);
              setFinalStats(null);
              setLogTimestamp(null);
              startRound();
            }}
            onBack={handleBack}
            timestamp={logTimestamp || undefined}
          />
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
        <Text style={styles.title}>Two-Finger Simultaneous Tap</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • Score: {score}
        </Text>
        <Text style={styles.helper}>
          Tap both targets at the same time!
        </Text>
      </View>

      {/* Play area */}
      <View style={styles.playArea}>
        {/* Left target */}
        <Pressable
          onPress={() => handleTargetTap('left')}
          disabled={!roundActive || done}
          style={styles.targetPressable}
        >
          <Animated.View style={[styles.target, target1AnimatedStyle]}>
            <Text style={styles.targetEmoji}>⭐</Text>
          </Animated.View>
        </Pressable>

        {/* Right target */}
        <Pressable
          onPress={() => handleTargetTap('right')}
          disabled={!roundActive || done}
          style={styles.targetPressable}
        >
          <Animated.View style={[styles.target, target2AnimatedStyle]}>
            <Text style={styles.targetEmoji}>⭐</Text>
          </Animated.View>
        </Pressable>

        {/* Feedback */}
        {showFeedback && lastResult && (
          <Animated.View style={[styles.feedbackContainer, feedbackStyle]}>
            <Text style={[
              styles.feedbackText,
              lastResult === 'hit' ? styles.feedbackSuccess : styles.feedbackError,
            ]}>
              {lastResult === 'hit' ? 'Perfect!' : 'Try together!'}
            </Text>
          </Animated.View>
        )}

        {/* Sparkle effect */}
        {sparkleKey > 0 && (
          <SparkleBurst
            key={sparkleKey}
            x={sparkleX}
            y={sparkleY}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  backChip: {
    alignSelf: 'flex-start',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerBlock: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  playArea: {
    flex: 1,
    position: 'relative',
    margin: 20,
  },
  targetPressable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  target: {
    position: 'absolute',
    backgroundColor: '#FCD34D',
    borderRadius: 1000,
    borderWidth: 4,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  targetEmoji: {
    fontSize: 50,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 20,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackSuccess: {
    color: '#22C55E',
  },
  feedbackError: {
    color: '#EF4444',
  },
  scrollContent: {
    padding: 20,
  },
});

export default TwoFingerSimultaneousTapGame;

