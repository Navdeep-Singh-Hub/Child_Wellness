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
    withTiming,
} from 'react-native-reanimated';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const TOTAL_TARGETS = 12; // Total targets to tap
const INITIAL_SIZE = 140; // Starting size (medium)
const MIN_SIZE = 50; // Smallest size
const MAX_SIZE = 180; // Largest size (if struggling)
const SIZE_DECREASE = 12; // How much to decrease each time
const SIZE_INCREASE = 15; // How much to increase if struggling
const MISS_THRESHOLD = 2; // Number of misses before increasing size

const usePopSound = () => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri: POP_SOUND },
        { volume: 0.6, shouldPlay: false },
      );
      soundRef.current = sound;
    } catch {
      console.warn('Failed to load pop sound');
    }
  }, []);

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

const ShrinkingTargetGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playPop = usePopSound();

  const [score, setScore] = useState(0);
  const [currentSize, setCurrentSize] = useState(INITIAL_SIZE);
  const [missCount, setMissCount] = useState(0); // Track consecutive misses
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 }); // percentage

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#F472B6', '#06B6D4', '#EC4899'];

  // Generate random position for target
  const generateRandomPosition = useCallback(() => {
    const margin = 15; // percentage margin from edges
    const x = margin + Math.random() * (100 - margin * 2);
    const y = margin + Math.random() * (100 - margin * 2);
    return { x, y };
  }, []);

  // Spawn new target
  const spawnTarget = useCallback(() => {
    const newPosition = generateRandomPosition();
    setTargetPosition(newPosition);
    scale.value = 0;
    opacity.value = 0;

    // Animate in
    scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 300 });
  }, [generateRandomPosition, scale, opacity]);

  // Handle target tap
  const handleTap = useCallback(async () => {
    if (done) return;

    // Record tap position for sparkle
    sparkleX.value = targetPosition.x;
    sparkleY.value = targetPosition.y;

    // Pop animation
    scale.value = withSequence(
      withTiming(1.3, { duration: 120, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }, () => {
        runOnJS(setScore)((s) => s + 1);
        runOnJS(setMissCount)(0); // Reset miss count on success

        if (score + 1 >= TOTAL_TARGETS) {
          runOnJS(endGame)(score + 1);
        } else {
          // Decrease size for next target (progressive difficulty)
          runOnJS(setCurrentSize)((s) => Math.max(MIN_SIZE, s - SIZE_DECREASE));
          runOnJS(spawnTarget)();
        }
      }),
    );

    opacity.value = withTiming(0, { duration: 200 });

    try {
      await playPop();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    // Show sparkle burst
    setTimeout(() => {
      scale.value = 1;
      opacity.value = 1;
    }, 400);
  }, [done, score, targetPosition, scale, opacity, sparkleX, sparkleY, playPop, spawnTarget]);

  // Handle miss (tap outside target)
  const handleMiss = useCallback(() => {
    if (done) return;

    setMissCount((m) => {
      const newMissCount = m + 1;

      // If struggling (multiple misses), increase target size
      if (newMissCount >= MISS_THRESHOLD) {
        setCurrentSize((s) => Math.min(MAX_SIZE, s + SIZE_INCREASE));
        setMissCount(0); // Reset after adapting
        Speech.speak('Target is bigger now!', { rate: 0.78 });
      }

      return newMissCount;
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }, [done]);

  // End game
  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_TARGETS;
      const xp = finalScore * 12; // 12 XP per target
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'shrinkingTarget',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['graded-motor-control', 'progressive-precision', 'adaptability'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log shrinking target game:', e);
      }

      Speech.speak('Excellent precision!', { rate: 0.78 });
    },
    [router],
  );

  // Initialize first target
  useEffect(() => {
    spawnTarget();
  }, []);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // Animated styles
  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    left: `${sparkleX.value}%`,
    top: `${sparkleY.value}%`,
  }));

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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎯</Text>
            <Text style={styles.resultTitle}>Amazing precision!</Text>
            <Text style={styles.resultSubtitle}>
              You tapped {finalStats.correct} out of {finalStats.total} targets.
            </Text>
            <Text style={styles.resultSubtitle}>
              Final size: {currentSize.toFixed(0)}px
            </Text>
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onPlayAgain={() => {
                setScore(0);
                setCurrentSize(INITIAL_SIZE);
                setMissCount(0);
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
                spawnTarget();
              }}
            />
            <Text style={styles.savedText}>Saved! XP updated ✅</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentColor = COLORS[score % COLORS.length];
  const sizePercentage = ((currentSize / INITIAL_SIZE) * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backChip}>
        <Text style={styles.backChipText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.title}>Shrinking Target</Text>
        <Text style={styles.subtitle}>
          Target {score + 1}/{TOTAL_TARGETS} • Size: {sizePercentage}%
        </Text>
        <Text style={styles.helper}>
          Tap the target! It gets smaller each time. If you struggle, it grows bigger to help you.
        </Text>
      </View>

      <Pressable style={styles.playArea} onPress={handleMiss}>
        <Animated.View
          style={[
            styles.targetContainer,
            {
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              transform: [{ translateX: -currentSize / 2 }, { translateY: -currentSize / 2 }],
            },
            targetStyle,
          ]}
        >
          <Pressable
            onPress={handleTap}
            style={[
              styles.target,
              {
                width: currentSize,
                height: currentSize,
                borderRadius: currentSize / 2,
                backgroundColor: currentColor,
              },
            ]}
          >
            <View style={styles.targetInner} />
          </Pressable>
        </Animated.View>

        {/* Sparkle burst on tap */}
        {score > 0 && (
          <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
            <SparkleBurst />
          </Animated.View>
        )}
      </Pressable>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: graded motor control • progressive finger precision • adaptability
        </Text>
        <Text style={styles.footerSub}>
          The target shrinks as you succeed, building precision. If you miss, it grows to help you!
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
    position: 'relative',
    marginBottom: 16,
  },
  targetContainer: {
    position: 'absolute',
  },
  target: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  targetInner: {
    width: '40%',
    height: '40%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  sparkleContainer: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }],
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
    marginBottom: 8,
    textAlign: 'center',
  },
  savedText: {
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ShrinkingTargetGame;

