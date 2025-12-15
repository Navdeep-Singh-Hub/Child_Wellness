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
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const TOTAL_ROUNDS = 8;
const INITIAL_SIZE = 150;
const MIN_SIZE = 60;
const MAX_SIZE = 250;
const TARGET_SIZE = 120; // Target size to reach
const SIZE_TOLERANCE = 20; // Acceptable range around target

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

const PinchToResizeGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [lastResult, setLastResult] = useState<'hit' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [sparkleX, setSparkleX] = useState(0);
  const [sparkleY, setSparkleY] = useState(0);
  const [currentTargetSize, setCurrentTargetSize] = useState(TARGET_SIZE);

  // Animation values
  const objectSize = useSharedValue(INITIAL_SIZE);
  const objectX = useSharedValue(50); // Center horizontally (%)
  const objectY = useSharedValue(50); // Center vertically (%)
  const objectScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const baseScale = useSharedValue(1); // Base scale from pinch gesture

  const roundActiveRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const isTargetReachedRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    const finalScore = scoreRef.current;
    const totalRounds = TOTAL_ROUNDS;
    const xp = Math.floor((finalScore / totalRounds) * 50);

    try {
      const timestamp = await recordGame({
        type: 'pinchToResize',
        score: finalScore,
        totalRounds,
        correct: finalScore,
        incorrect: totalRounds - finalScore,
      });

      await logGameAndAward({
        gameType: 'pinchToResize',
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

  // Check if target size is reached
  const checkTargetSize = useCallback(() => {
    if (!roundActiveRef.current || done || isTargetReachedRef.current) return;

    const currentSize = objectSize.value;
    const targetSize = currentTargetSize;
    const diff = Math.abs(currentSize - targetSize);

    if (diff <= SIZE_TOLERANCE) {
      isTargetReachedRef.current = true;
      runOnJS(handleSuccess)();
    }
  }, [done, currentTargetSize, objectSize]);

  // Handle successful target size
  const handleSuccess = useCallback(async () => {
    if (!roundActiveRef.current || done) return;

    setLastResult('hit');
    setShowFeedback(true);
    setRoundActive(false);
    roundActiveRef.current = false;
    setScore((s) => s + 1);

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Success animation
    objectScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
    feedbackOpacity.value = withTiming(1, { duration: 200 });

    setSparkleX(objectX.value);
    setSparkleY(objectY.value);
    setSparkleKey((k) => k + 1);

    try {
      await playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak('Perfect size!', { rate: 0.78 });
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
  }, [done, objectScale, objectX, objectY, feedbackOpacity, playSuccess, endGame]);

  // Start a new round
  const startRound = useCallback(() => {
    if (done) return;

    setRoundActive(true);
    roundActiveRef.current = true;
    setLastResult(null);
    setShowFeedback(false);
    isTargetReachedRef.current = false;
    feedbackOpacity.value = 0;

    // Random target size (between min and max)
    const newTargetSize = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    setCurrentTargetSize(newTargetSize);

    // Reset object to random starting size
    const startSize = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    objectSize.value = startSize;
    objectScale.value = 1;
    baseScale.value = 1;

    // Start checking if target is reached
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    checkIntervalRef.current = setInterval(() => {
      checkTargetSize();
    }, 100); // Check every 100ms
  }, [done, objectSize, objectScale, baseScale, feedbackOpacity, checkTargetSize]);

  // Pinch gesture (for resizing)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (!roundActiveRef.current || done || isTargetReachedRef.current) return;
      
      // Update base scale
      baseScale.value = e.scale;

      // Calculate new size based on pinch scale
      // scale < 1 means pinching (shrinking), scale > 1 means spreading (growing)
      const newSize = INITIAL_SIZE * e.scale;
      const clampedSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newSize));
      
      objectSize.value = clampedSize;
    })
    .onEnd(() => {
      if (!roundActiveRef.current || done || isTargetReachedRef.current) return;
      // Check if target is reached when gesture ends
      checkTargetSize();
    });

  // Start first round
  useEffect(() => {
    startRound();
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Animated styles
  const objectAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: objectSize.value,
      height: objectSize.value,
      left: `${objectX.value}%`,
      top: `${objectY.value}%`,
      transform: [
        { translateX: -objectSize.value / 2 },
        { translateY: -objectSize.value / 2 },
        { scale: objectScale.value },
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
        <Text style={styles.title}>Pinch to Resize</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • Score: {score}
        </Text>
        <Text style={styles.helper}>
          Pinch to shrink, spread to grow! Target: {Math.round(currentTargetSize)}px
        </Text>
      </View>

      {/* Play area */}
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.playArea}>
          {/* Target size indicator */}
          <View style={[styles.targetIndicator, {
            width: currentTargetSize,
            height: currentTargetSize,
            left: '50%',
            top: '50%',
            marginLeft: -currentTargetSize / 2,
            marginTop: -currentTargetSize / 2,
          }]}>
            <Text style={styles.targetText}>Target</Text>
          </View>

          {/* Object */}
          <Animated.View
            style={[
              styles.object,
              objectAnimatedStyle,
            ]}
          >
            <Text style={styles.objectEmoji}>🎈</Text>
          </Animated.View>

          {/* Feedback */}
          {showFeedback && lastResult && (
            <Animated.View style={[styles.feedbackContainer, feedbackStyle]}>
              <Text style={styles.feedbackText}>
                Perfect size!
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
  targetIndicator: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    zIndex: 5,
  },
  targetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  object: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    borderRadius: 1000,
    borderWidth: 4,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  objectEmoji: {
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
    zIndex: 20,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#22C55E',
  },
  scrollContent: {
    padding: 20,
  },
});

export default PinchToResizeGame;

