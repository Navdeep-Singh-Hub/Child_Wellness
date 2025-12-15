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
const BALLOON_SIZE = 150;
const PINCH_THRESHOLD = 0.3; // Scale threshold to trigger pop (30% reduction)

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

const PinchToPopGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
  const balloonScale = useSharedValue(1);
  const balloonX = useSharedValue(50); // Center horizontally (%)
  const balloonY = useSharedValue(50); // Center vertically (%)
  const balloonOpacity = useSharedValue(1);
  const wiggleRotation = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0);

  const roundActiveRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const isPoppedRef = useRef(false);

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
        type: 'pinchToPop',
        score: finalScore,
        totalRounds,
        correct: finalScore,
        incorrect: totalRounds - finalScore,
      });

      await logGameAndAward({
        gameType: 'pinchToPop',
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

  // Handle single tap (wrong gesture)
  const handleSingleTap = useCallback(async () => {
    if (!roundActiveRef.current || done || isPoppedRef.current) return;

    // Wiggle animation
    wiggleRotation.value = withSequence(
      withTiming(-10, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(10, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(-10, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) })
    );

    setLastResult('miss');
    setShowFeedback(true);
    feedbackOpacity.value = withTiming(1, { duration: 200 });

    try {
      await playError();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Speech.speak('Try two fingers!', { rate: 0.78 });
    } catch {}

    setTimeout(() => {
      setShowFeedback(false);
      feedbackOpacity.value = 0;
    }, 2000);
  }, [done, wiggleRotation, feedbackOpacity, playError]);

  // Handle successful pinch (pop)
  const handlePop = useCallback(async () => {
    if (!roundActiveRef.current || done || isPoppedRef.current) return;

    isPoppedRef.current = true;
    setLastResult('hit');
    setShowFeedback(true);
    setRoundActive(false);
    roundActiveRef.current = false;
    setScore((s) => s + 1);

    // Pop animation
    balloonScale.value = withSequence(
      withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
    );
    balloonOpacity.value = withTiming(0, { duration: 200 });

    feedbackOpacity.value = withTiming(1, { duration: 200 });

    setSparkleX(balloonX.value);
    setSparkleY(balloonY.value);
    setSparkleKey((k) => k + 1);

    try {
      await playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak('Pop!', { rate: 0.78 });
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
  }, [done, balloonScale, balloonOpacity, balloonX, balloonY, feedbackOpacity, playSuccess, endGame]);

  // Start a new round
  const startRound = useCallback(() => {
    if (done) return;

    setRoundActive(true);
    roundActiveRef.current = true;
    setLastResult(null);
    setShowFeedback(false);
    isPoppedRef.current = false;
    feedbackOpacity.value = 0;

    // Random position
    const margin = 20;
    balloonX.value = margin + Math.random() * (100 - margin * 2);
    balloonY.value = margin + Math.random() * (100 - margin * 2);

    // Reset balloon
    balloonScale.value = 1;
    balloonOpacity.value = 1;
    wiggleRotation.value = 0;
  }, [done, balloonX, balloonY, balloonScale, balloonOpacity, wiggleRotation, feedbackOpacity]);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!roundActiveRef.current || done || isPoppedRef.current) return;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || done || isPoppedRef.current) return;
      
      // Scale down as user pinches (scale < 1 means pinching inward)
      const currentScale = 1 - (1 - e.scale) * 0.5; // Dampen the effect
      balloonScale.value = Math.max(0.3, currentScale);

      // If pinched enough, trigger pop
      if (e.scale < (1 - PINCH_THRESHOLD)) {
        runOnJS(handlePop)();
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || done || isPoppedRef.current) return;
      // Spring back if not popped
      if (!isPoppedRef.current) {
        balloonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }
    });

  // Single tap gesture (for wrong gesture detection)
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (!roundActiveRef.current || done || isPoppedRef.current) return;
      runOnJS(handleSingleTap)();
    });

  // Combine gestures (tap has lower priority)
  const combinedGesture = Gesture.Race(pinchGesture, tapGesture);

  // Set ref after startRound is defined
  useEffect(() => {
    // startRound will be set via ref if needed
  }, [startRound]);

  // Start first round
  useEffect(() => {
    startRound();
  }, []);

  // Animated styles
  const balloonAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: BALLOON_SIZE,
      height: BALLOON_SIZE,
      left: `${balloonX.value}%`,
      top: `${balloonY.value}%`,
      transform: [
        { translateX: -BALLOON_SIZE / 2 },
        { translateY: -BALLOON_SIZE / 2 },
        { scale: balloonScale.value },
        { rotate: `${wiggleRotation.value}deg` },
      ],
      opacity: balloonOpacity.value,
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
        <Text style={styles.title}>Pinch to Pop</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • Score: {score}
        </Text>
        <Text style={styles.helper}>
          Use two fingers to pinch the balloon!
        </Text>
      </View>

      {/* Play area */}
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.playArea}>
          <Animated.View
            style={[
              styles.balloon,
              balloonAnimatedStyle,
            ]}
          >
            <Text style={styles.balloonEmoji}>🎈</Text>
          </Animated.View>

          {/* Feedback */}
          {showFeedback && lastResult && (
            <Animated.View style={[styles.feedbackContainer, feedbackStyle]}>
              <Text style={[
                styles.feedbackText,
                lastResult === 'hit' ? styles.feedbackSuccess : styles.feedbackError,
              ]}>
                {lastResult === 'hit' ? 'Pop!' : 'Try two fingers!'}
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
  balloon: {
    position: 'absolute',
    backgroundColor: '#EF4444',
    borderRadius: 1000,
    borderWidth: 4,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balloonEmoji: {
    fontSize: 60,
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

export default PinchToPopGame;

