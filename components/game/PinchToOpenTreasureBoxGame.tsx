import { logGameAndAward, recordGame } from '@/utils/api';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
const LOCK_SIZE = 80;
const CHEST_SIZE = 200;
const PINCH_THRESHOLD = 0.3; // Scale threshold to trigger unlock (30% reduction)

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

const PinchToOpenTreasureBoxGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
  const [isLock1Unlocked, setIsLock1Unlocked] = useState(false);
  const [isLock2Unlocked, setIsLock2Unlocked] = useState(false);
  const [isChestOpen, setIsChestOpen] = useState(false);

  // Animation values
  const lock1X = useSharedValue(40); // Left lock (%)
  const lock1Y = useSharedValue(50); // Center vertically (%)
  const lock1Scale = useSharedValue(1);
  const lock1Opacity = useSharedValue(1);
  const lock2X = useSharedValue(60); // Right lock (%)
  const lock2Y = useSharedValue(50); // Center vertically (%)
  const lock2Scale = useSharedValue(1);
  const lock2Opacity = useSharedValue(1);
  const chestX = useSharedValue(50); // Center horizontally (%)
  const chestY = useSharedValue(50); // Center vertically (%)
  const chestScale = useSharedValue(1);
  const chestRotation = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0);

  const roundActiveRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const isLock1UnlockedRef = useRef(false);
  const isLock2UnlockedRef = useRef(false);
  const isChestOpenRef = useRef(false);
  const lock1PinchActiveRef = useRef(false);
  const lock2PinchActiveRef = useRef(false);

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
        type: 'pinchToOpenTreasureBox',
        score: finalScore,
        totalRounds,
        correct: finalScore,
        incorrect: totalRounds - finalScore,
      });

      await logGameAndAward({
        gameType: 'pinchToOpenTreasureBox',
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

  // Check if both locks are unlocked
  const checkIfBothUnlocked = useCallback(() => {
    if (isLock1UnlockedRef.current && isLock2UnlockedRef.current && !isChestOpenRef.current) {
      isChestOpenRef.current = true;
      runOnJS(handleSuccess)();
    }
  }, []);

  // Handle lock unlock
  const handleLockUnlock = useCallback((lockNumber: 1 | 2) => {
    if (!roundActiveRef.current || done || isChestOpenRef.current) return;

    if (lockNumber === 1 && !isLock1UnlockedRef.current) {
      isLock1UnlockedRef.current = true;
      setIsLock1Unlocked(true);
      lock1Scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
      );
      lock1Opacity.value = withTiming(0, { duration: 200 });
      checkIfBothUnlocked();
    } else if (lockNumber === 2 && !isLock2UnlockedRef.current) {
      isLock2UnlockedRef.current = true;
      setIsLock2Unlocked(true);
      lock2Scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
      );
      lock2Opacity.value = withTiming(0, { duration: 200 });
      checkIfBothUnlocked();
    }
  }, [done, lock1Scale, lock1Opacity, lock2Scale, lock2Opacity, checkIfBothUnlocked]);

  // Handle wrong gesture (single tap)
  const handleWrongGesture = useCallback(async () => {
    if (!roundActiveRef.current || done || isChestOpenRef.current) return;

    setLastResult('miss');
    setShowFeedback(true);
    feedbackOpacity.value = withTiming(1, { duration: 200 });

    // Shake chest
    chestRotation.value = withSequence(
      withTiming(-5, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(5, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(-5, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) })
    );

    try {
      await playError();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Speech.speak('Pinch both locks!', { rate: 0.78 });
    } catch {}

    setTimeout(() => {
      setShowFeedback(false);
      feedbackOpacity.value = 0;
    }, 2000);
  }, [done, chestRotation, feedbackOpacity, playError]);

  // Handle successful chest open
  const handleSuccess = useCallback(async () => {
    if (!roundActiveRef.current || done) return;

    setLastResult('hit');
    setShowFeedback(true);
    setRoundActive(false);
    roundActiveRef.current = false;
    setScore((s) => s + 1);

    // Open chest animation
    chestRotation.value = withSpring(-15, { damping: 10, stiffness: 200 });
    chestScale.value = withSpring(1.1, { damping: 10, stiffness: 200 });
    feedbackOpacity.value = withTiming(1, { duration: 200 });

    setSparkleX(chestX.value);
    setSparkleY(chestY.value);
    setSparkleKey((k) => k + 1);

    try {
      await playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak('Treasure!', { rate: 0.78 });
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
  }, [done, chestRotation, chestScale, chestX, chestY, feedbackOpacity, playSuccess, endGame]);

  // Start a new round
  const startRound = useCallback(() => {
    if (done) return;

    setRoundActive(true);
    roundActiveRef.current = true;
    setLastResult(null);
    setShowFeedback(false);
    setIsLock1Unlocked(false);
    setIsLock2Unlocked(false);
    setIsChestOpen(false);
    isLock1UnlockedRef.current = false;
    isLock2UnlockedRef.current = false;
    isChestOpenRef.current = false;
    lock1PinchActiveRef.current = false;
    lock2PinchActiveRef.current = false;
    feedbackOpacity.value = 0;

    // Reset locks
    lock1Scale.value = 1;
    lock1Opacity.value = 1;
    lock2Scale.value = 1;
    lock2Opacity.value = 1;

    // Reset chest
    chestScale.value = 1;
    chestRotation.value = 0;
  }, [done, lock1Scale, lock1Opacity, lock2Scale, lock2Opacity, chestScale, chestRotation, feedbackOpacity]);

  // Pinch gesture for lock 1
  const lock1PinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!roundActiveRef.current || done || isChestOpenRef.current) return;
      lock1PinchActiveRef.current = true;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || done || isChestOpenRef.current || isLock1UnlockedRef.current) return;
      
      // Scale down as user pinches
      const currentScale = 1 - (1 - e.scale) * 0.5;
      lock1Scale.value = Math.max(0.3, currentScale);

      // If pinched enough, unlock
      if (e.scale < (1 - PINCH_THRESHOLD)) {
        runOnJS(handleLockUnlock)(1);
      }
    })
    .onEnd(() => {
      lock1PinchActiveRef.current = false;
      if (!roundActiveRef.current || done || isChestOpenRef.current || isLock1UnlockedRef.current) return;
      // Spring back if not unlocked
      if (!isLock1UnlockedRef.current) {
        lock1Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }
    });

  // Pinch gesture for lock 2
  const lock2PinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!roundActiveRef.current || done || isChestOpenRef.current) return;
      lock2PinchActiveRef.current = true;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || done || isChestOpenRef.current || isLock2UnlockedRef.current) return;
      
      // Scale down as user pinches
      const currentScale = 1 - (1 - e.scale) * 0.5;
      lock2Scale.value = Math.max(0.3, currentScale);

      // If pinched enough, unlock
      if (e.scale < (1 - PINCH_THRESHOLD)) {
        runOnJS(handleLockUnlock)(2);
      }
    })
    .onEnd(() => {
      lock2PinchActiveRef.current = false;
      if (!roundActiveRef.current || done || isChestOpenRef.current || isLock2UnlockedRef.current) return;
      // Spring back if not unlocked
      if (!isLock2UnlockedRef.current) {
        lock2Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }
    });

  // Single tap gesture (for wrong gesture detection)
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (!roundActiveRef.current || done || isChestOpenRef.current) return;
      runOnJS(handleWrongGesture)();
    });

  // Combine gestures
  const combinedGesture = Gesture.Simultaneous(
    Gesture.Race(lock1PinchGesture, tapGesture),
    lock2PinchGesture
  );

  // Start first round
  useEffect(() => {
    startRound();
  }, []);

  // Animated styles
  const lock1AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: LOCK_SIZE,
      height: LOCK_SIZE,
      left: `${lock1X.value}%`,
      top: `${lock1Y.value}%`,
      transform: [
        { translateX: -LOCK_SIZE / 2 },
        { translateY: -LOCK_SIZE / 2 },
        { scale: lock1Scale.value },
      ],
      opacity: lock1Opacity.value,
    };
  });

  const lock2AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: LOCK_SIZE,
      height: LOCK_SIZE,
      left: `${lock2X.value}%`,
      top: `${lock2Y.value}%`,
      transform: [
        { translateX: -LOCK_SIZE / 2 },
        { translateY: -LOCK_SIZE / 2 },
        { scale: lock2Scale.value },
      ],
      opacity: lock2Opacity.value,
    };
  });

  const chestAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: CHEST_SIZE,
      height: CHEST_SIZE,
      left: `${chestX.value}%`,
      top: `${chestY.value}%`,
      transform: [
        { translateX: -CHEST_SIZE / 2 },
        { translateY: -CHEST_SIZE / 2 },
        { scale: chestScale.value },
        { rotate: `${chestRotation.value}deg` },
      ],
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
        <Text style={styles.title}>Pinch to Open Treasure Box</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • Score: {score}
        </Text>
        <Text style={styles.helper}>
          Pinch both locks at the same time!
        </Text>
      </View>

      {/* Play area */}
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.playArea}>
          {/* Chest */}
          <Animated.View style={[styles.chest, chestAnimatedStyle]}>
            <Text style={styles.chestEmoji}>📦</Text>
          </Animated.View>

          {/* Lock 1 */}
          <Animated.View style={[styles.lock, lock1AnimatedStyle]}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </Animated.View>

          {/* Lock 2 */}
          <Animated.View style={[styles.lock, lock2AnimatedStyle]}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </Animated.View>

          {/* Feedback */}
          {showFeedback && lastResult && (
            <Animated.View style={[styles.feedbackContainer, feedbackStyle]}>
              <Text style={[
                styles.feedbackText,
                lastResult === 'hit' ? styles.feedbackSuccess : styles.feedbackError,
              ]}>
                {lastResult === 'hit' ? 'Treasure!' : 'Pinch both locks!'}
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
      </GestureDetector>
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
  chest: {
    position: 'absolute',
    backgroundColor: '#92400E',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#78350F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
  },
  chestEmoji: {
    fontSize: 100,
  },
  lock: {
    position: 'absolute',
    backgroundColor: '#6B7280',
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  lockEmoji: {
    fontSize: 40,
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

export default PinchToOpenTreasureBoxGame;

