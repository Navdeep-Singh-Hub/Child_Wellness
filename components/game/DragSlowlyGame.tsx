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
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARNING_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const BAR_SIZE = 80;
const PATH_LENGTH = 60; // % of screen
const MAX_SPEED = 2; // % per frame (too fast threshold)
const SLOW_TARGET = 0.5; // % per frame (target speed)

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

const DragSlowlyGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);
  const playWarning = useSoundEffect(WARNING_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isTooFast, setIsTooFast] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animation values
  const barX = useSharedValue(20);
  const barY = useSharedValue(50);
  const barScale = useSharedValue(1);
  const pathStartX = useSharedValue(20);
  const pathEndX = useSharedValue(80);
  const pathY = useSharedValue(50);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);
  const startX = useSharedValue(20);

  const screenWidth = useRef(400);
  const screenHeight = useRef(600);
  const lastPosition = useRef({ x: 20, time: Date.now() });
  const lastWarningTime = useRef(0);

  // End game function (defined before use)
  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 18; // 18 XP per successful slow drag
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setRoundActive(false);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'dragSlowly',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['controlled-movement', 'proprioception', 'pacing', 'sustained-finger-contact'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log drag slowly game:', e);
      }

      Speech.speak('Great slow dragging!', { rate: 0.78 });
    },
    [router],
  );

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!roundActive || done) return;
      setIsDragging(true);
      barScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
      lastPosition.current = { x: barX.value, time: Date.now() };
    })
    .onUpdate((e) => {
      if (!roundActive || done) return;
      const newX = (e.x / screenWidth.current) * 100;
      const newY = (e.y / screenHeight.current) * 100;
      
      // Only allow horizontal movement along path
      const clampedX = Math.max(pathStartX.value, Math.min(pathEndX.value, newX));
      barX.value = clampedX;
      barY.value = pathY.value;

      // Calculate speed
      const now = Date.now();
      const timeDelta = now - lastPosition.current.time;
      if (timeDelta > 0) {
        const distanceDelta = Math.abs(barX.value - lastPosition.current.x);
        const speedValue = (distanceDelta / timeDelta) * 1000; // % per second
        setSpeed(speedValue);

        if (speedValue > MAX_SPEED) {
          // Too fast!
          if (!isTooFast) {
            setIsTooFast(true);
            const now = Date.now();
            if (now - lastWarningTime.current > 1000) {
              lastWarningTime.current = now;
              try {
                playWarning();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Speech.speak('Too fast!', { rate: 0.78 });
              } catch {}
            }
          }
        } else {
          setIsTooFast(false);
        }
      }

      lastPosition.current = { x: barX.value, time: now };

      // Calculate progress
      const pathLength = pathEndX.value - pathStartX.value;
      const currentProgress = (barX.value - pathStartX.value) / pathLength;
      setProgress(Math.min(1, Math.max(0, currentProgress)));
    })
    .onEnd(() => {
      if (!roundActive || done) return;
      setIsDragging(false);
      barScale.value = withSpring(1, { damping: 10, stiffness: 200 });

      // Check if reached end
      if (progress >= 0.95 && !isTooFast) {
        // Success!
        sparkleX.value = pathEndX.value;
        sparkleY.value = pathY.value;

        setScore((s) => {
          const newScore = s + 1;
          if (newScore >= TOTAL_ROUNDS) {
            setTimeout(() => {
              endGame(newScore);
            }, 1000);
          } else {
            setTimeout(() => {
              setRound((r) => r + 1);
              setProgress(0);
              setSpeed(0);
              setIsTooFast(false);
              barX.value = withSpring(startX.value, { damping: 10, stiffness: 100 });
              setRoundActive(true);
            }, 1500);
          }
          return newScore;
        });

        try {
          playSuccess();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      } else {
        // Reset to start
        barX.value = withSpring(startX.value, { damping: 10, stiffness: 100 });
        setProgress(0);
        setSpeed(0);
        setIsTooFast(false);

        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Speech.speak('Drag slowly to the end!', { rate: 0.78 });
        } catch {}
      }
    });

  // Initialize path
  useEffect(() => {
    try {
      Speech.speak('Drag the bar slowly along the path. Watch the speed meter!', { rate: 0.78 });
    } catch {}
    // Horizontal path
    pathStartX.value = 15;
    pathEndX.value = 85;
    pathY.value = 40 + Math.random() * 20; // 40-60%
    startX.value = pathStartX.value;
    barX.value = pathStartX.value;
    barY.value = pathY.value;
    setProgress(0);
    setSpeed(0);
    setIsTooFast(false);
  }, [round]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // Animated styles
  const barStyle = useAnimatedStyle(() => ({
    left: `${barX.value}%`,
    top: `${barY.value}%`,
    transform: [
      { translateX: -BAR_SIZE / 2 },
      { translateY: -BAR_SIZE / 2 },
      { scale: barScale.value },
    ],
  }));

  const pathStyle = useAnimatedStyle(() => ({
    left: `${pathStartX.value}%`,
    top: `${pathY.value}%`,
    width: `${pathEndX.value - pathStartX.value}%`,
    transform: [{ translateY: -10 }],
  }));

  const progressPathStyle = useAnimatedStyle(() => {
    const pathLength = pathEndX.value - pathStartX.value;
    const progressWidth = pathLength * progress;
    return {
      left: `${pathStartX.value}%`,
      top: `${pathY.value}%`,
      width: `${progressWidth}%`,
      transform: [{ translateY: -10 }],
    };
  });

  const sparkleStyle = useAnimatedStyle(() => ({
    left: `${sparkleX.value}%`,
    top: `${sparkleY.value}%`,
  }));

  // Speed meter color
  const speedMeterColor = isTooFast ? '#EF4444' : speed > SLOW_TARGET ? '#F59E0B' : '#22C55E';

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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🐌</Text>
            <Text style={styles.resultTitle}>Slow drag master!</Text>
            <Text style={styles.resultSubtitle}>
              You completed {finalStats.correct} slow drags out of {finalStats.total}!
            </Text>
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onPlayAgain={() => {
                setRound(1);
                setScore(0);
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
                setProgress(0);
                setSpeed(0);
                setRoundActive(true);
                barX.value = startX.value;
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
        <Text style={styles.title}>Drag Slowly</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🐌 Score: {score}
        </Text>
        <Text style={styles.helper}>
          Drag the bar slowly along the path. Watch the speed meter!
        </Text>
      </View>

      {/* Speed meter */}
      <View style={styles.speedMeterContainer}>
        <Text style={styles.speedMeterLabel}>Speed:</Text>
        <View style={styles.speedMeterBar}>
          <View
            style={[
              styles.speedMeterFill,
              {
                width: `${Math.min(100, (speed / MAX_SPEED) * 100)}%`,
                backgroundColor: speedMeterColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.speedMeterText, { color: speedMeterColor }]}>
          {isTooFast ? 'TOO FAST!' : speed > SLOW_TARGET ? 'FAST' : 'GOOD'}
        </Text>
      </View>

      <View
        style={styles.playArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            {/* Path */}
            <Animated.View style={[styles.pathBackground, pathStyle]} />
            <Animated.View style={[styles.pathProgress, progressPathStyle]} />

            {/* Start marker */}
            <View
              style={[
                styles.marker,
                {
                  left: `${pathStartX.value}%`,
                  top: `${pathY.value}%`,
                  transform: [{ translateX: -15 }, { translateY: -15 }],
                },
              ]}
            >
              <Text style={styles.markerText}>START</Text>
            </View>

            {/* End marker */}
            <View
              style={[
                styles.marker,
                {
                  left: `${pathEndX.value}%`,
                  top: `${pathY.value}%`,
                  transform: [{ translateX: -15 }, { translateY: -15 }],
                  backgroundColor: '#22C55E',
                },
              ]}
            >
              <Text style={styles.markerText}>END</Text>
            </View>

            {/* Draggable bar */}
            <Animated.View style={[styles.barContainer, barStyle]}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: isTooFast ? '#EF4444' : '#3B82F6',
                  },
                ]}
              >
                <Text style={styles.barEmoji}>📊</Text>
              </View>
            </Animated.View>

            {/* Sparkle burst on success */}
            {score > 0 && !isDragging && (
              <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
                <SparkleBurst />
              </Animated.View>
            )}

            {/* Warning */}
            {isTooFast && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>Too fast! Slow down! ⚠️</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: controlled movement • proprioception • pacing • sustained finger contact
        </Text>
        <Text style={styles.footerSub}>
          Drag slowly and carefully! This builds fine motor control and proprioception.
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
  speedMeterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  speedMeterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 12,
  },
  speedMeterBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  speedMeterFill: {
    height: '100%',
    borderRadius: 10,
  },
  speedMeterText: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 70,
    textAlign: 'right',
  },
  playArea: {
    flex: 1,
    position: 'relative',
    marginBottom: 16,
  },
  gestureArea: {
    flex: 1,
    position: 'relative',
  },
  pathBackground: {
    position: 'absolute',
    height: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 10,
  },
  pathProgress: {
    position: 'absolute',
    height: 20,
    backgroundColor: '#22C55E',
    borderRadius: 10,
  },
  marker: {
    position: 'absolute',
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  barContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  bar: {
    width: BAR_SIZE,
    height: BAR_SIZE,
    borderRadius: BAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  barEmoji: {
    fontSize: 40,
  },
  sparkleContainer: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 4,
  },
  warningBox: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: [{ translateX: -80 }],
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  warningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
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

export default DragSlowlyGame;

