import { SparkleBurst } from '@/components/game/FX';
import ResultCard from '@/components/game/ResultCard';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
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
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARNING_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 6;
const OBJECT_SIZE = 50;
const LINE_TOLERANCE = 35;
const SLOW_SPEED = 0.3;
const NORMAL_SPEED = 1.0;

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

// Distance to bezier curve
const distanceToBezier = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
) => {
  let minDist = Infinity;
  for (let t = 0; t <= 1; t += 0.02) {
    const mt = 1 - t;
    const x = mt * mt * mt * x1 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x2;
    const y = mt * mt * mt * y1 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y2;
    const dist = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
    if (dist < minDist) minDist = dist;
  }
  return minDist;
};

const CurvyRoadDriveGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
  const [isOffTrack, setIsOffTrack] = useState(false);
  const progress = useSharedValue(0);
  const [roadPathStr, setRoadPathStr] = useState('');
  const [progressPathStr, setProgressPathStr] = useState('');

  const updatePaths = useCallback(() => {
    setRoadPathStr(`M ${startX.value} ${startY.value} C ${controlX1.value} ${controlY1.value}, ${controlX2.value} ${controlY2.value}, ${endX.value} ${endY.value}`);
    
    if (progress.value > 0) {
      const t = progress.value;
      const mt = 1 - t;
      const x = mt * mt * mt * startX.value + 3 * mt * mt * t * controlX1.value + 3 * mt * t * t * controlX2.value + t * t * t * endX.value;
      const y = mt * mt * mt * startY.value + 3 * mt * mt * t * controlY1.value + 3 * mt * t * t * controlY2.value + t * t * t * endY.value;
      setProgressPathStr(`M ${startX.value} ${startY.value} C ${controlX1.value} ${controlY1.value}, ${controlX2.value} ${controlY2.value}, ${x} ${y}`);
    } else {
      setProgressPathStr('');
    }
  }, []);

  // Curvy road parameters (bezier curve)
  const startX = useSharedValue(15);
  const startY = useSharedValue(50);
  const controlX1 = useSharedValue(35);
  const controlY1 = useSharedValue(35);
  const controlX2 = useSharedValue(65);
  const controlY2 = useSharedValue(65);
  const endX = useSharedValue(85);
  const endY = useSharedValue(50);

  const objectX = useSharedValue(15);
  const objectY = useSharedValue(50);
  const objectScale = useSharedValue(1);
  const carSpeed = useSharedValue(NORMAL_SPEED);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  const screenWidth = useRef(400);
  const screenHeight = useRef(600);
  const lastWarningTime = useRef(0);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 20;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setRoundActive(false);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'curvyRoadDrive',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['smooth-wrist-movement', 'curved-tracking', 'line-boundary-awareness'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log curvy road drive game:', e);
      }

      Speech.speak('Great driving on the curvy road!', { rate: 0.78 });
    },
    [router],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!roundActive || done) return;
      setIsDragging(true);
      objectScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
    })
    .onUpdate((e) => {
      if (!roundActive || done) return;
      const newX = (e.x / screenWidth.current) * 100;
      const newY = (e.y / screenHeight.current) * 100;

      objectX.value = Math.max(5, Math.min(95, newX));
      objectY.value = Math.max(10, Math.min(90, newY));

      const dist = distanceToBezier(
        objectX.value,
        objectY.value,
        startX.value,
        startY.value,
        controlX1.value,
        controlY1.value,
        controlX2.value,
        controlY2.value,
        endX.value,
        endY.value,
      );

      if (dist > LINE_TOLERANCE) {
        if (!isOffTrack) {
          setIsOffTrack(true);
          carSpeed.value = withTiming(SLOW_SPEED, { duration: 200 });
          const now = Date.now();
          if (now - lastWarningTime.current > 500) {
            lastWarningTime.current = now;
            try {
              playWarning();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
          }
        }
      } else {
        if (isOffTrack) {
          setIsOffTrack(false);
          carSpeed.value = withTiming(NORMAL_SPEED, { duration: 200 });
        }
        // Estimate progress
        const totalDist = Math.sqrt(Math.pow(endX.value - startX.value, 2) + Math.pow(endY.value - startY.value, 2));
        const currentDist = Math.sqrt(
          Math.pow(objectX.value - startX.value, 2) + Math.pow(objectY.value - startY.value, 2),
        );
        progress.value = Math.min(1, Math.max(0, currentDist / (totalDist * 1.5)));
        updatePaths();
      }
    })
    .onEnd(() => {
      if (!roundActive || done) return;
      setIsDragging(false);
      objectScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      carSpeed.value = withTiming(NORMAL_SPEED, { duration: 200 });

      const distToEnd = Math.sqrt(
        Math.pow(objectX.value - endX.value, 2) + Math.pow(objectY.value - endY.value, 2),
      );

      if (distToEnd <= LINE_TOLERANCE && progress.value >= 0.75) {
        sparkleX.value = endX.value;
        sparkleY.value = endY.value;

        setScore((s) => {
          const newScore = s + 1;
          if (newScore >= TOTAL_ROUNDS) {
            setTimeout(() => {
              endGame(newScore);
            }, 1000);
          } else {
            setTimeout(() => {
              setRound((r) => r + 1);
              progress.value = 0;
              updatePaths();
              setIsOffTrack(false);
              objectX.value = withSpring(startX.value, { damping: 10, stiffness: 100 });
              objectY.value = withSpring(startY.value, { damping: 10, stiffness: 100 });
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
        objectX.value = withSpring(startX.value, { damping: 10, stiffness: 100 });
        objectY.value = withSpring(startY.value, { damping: 10, stiffness: 100 });
        progress.value = 0;
        updatePaths();
        setIsOffTrack(false);

        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Speech.speak('Stay on the road!', { rate: 0.78 });
        } catch {}
      }
    });

  useEffect(() => {
    try {
      Speech.speak('Drive along the curvy road!', { rate: 0.78 });
    } catch {}
    startX.value = 15;
    startY.value = 50;
    controlX1.value = 30;
    controlY1.value = 30 + Math.random() * 20;
    controlX2.value = 70;
    controlY2.value = 70 - Math.random() * 20;
    endX.value = 85;
    endY.value = 50;

    objectX.value = startX.value;
    objectY.value = startY.value;
    carSpeed.value = NORMAL_SPEED;
    progress.value = 0;
    updatePaths();
    
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [round, updatePaths]);

  useEffect(() => {
    const interval = setInterval(updatePaths, 100);
    return () => clearInterval(interval);
  }, [updatePaths]);

  const handleBack = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [onBack]);

  const objectStyle = useAnimatedStyle(() => ({
    left: `${objectX.value}%`,
    top: `${objectY.value}%`,
    transform: [
      { translateX: -OBJECT_SIZE / 2 },
      { translateY: -OBJECT_SIZE / 2 },
      { scale: objectScale.value * carSpeed.value },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    left: `${sparkleX.value}%`,
    top: `${sparkleY.value}%`,
  }));


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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🚗</Text>
            <Text style={styles.resultTitle}>Road Trip Complete!</Text>
            <Text style={styles.resultSubtitle}>
              You drove {finalStats.correct} curvy roads out of {finalStats.total}!
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
                progress.value = 0;
                updatePaths();
                setRoundActive(true);
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
        <Text style={styles.title}>Curvy Road Drive</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🚗 Score: {score}
        </Text>
        <Text style={styles.helper}>
          Drive along the curvy road! The car slows down if you cross the line.
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
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              <Path
                d={roadPathStr}
                stroke="rgba(148, 163, 184, 0.5)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {progressPathStr ? (
                <Path
                  d={progressPathStr}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}
            </Svg>

            <Animated.View style={[styles.objectContainer, objectStyle]}>
              <View
                style={[
                  styles.object,
                  {
                    backgroundColor: isOffTrack ? '#EF4444' : '#3B82F6',
                  },
                ]}
              >
                <Text style={styles.objectEmoji}>🚗</Text>
              </View>
            </Animated.View>

            {score > 0 && !isDragging && (
              <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
                <SparkleBurst />
              </Animated.View>
            )}

            {isOffTrack && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>Slow down! Stay on the road! ⚠️</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: smooth wrist movement • curved tracking • line boundary awareness
        </Text>
        <Text style={styles.footerSub}>
          Keep the car on the road - it slows down if you cross the line!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
  gestureArea: {
    flex: 1,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  objectContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  object: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  objectEmoji: {
    fontSize: 32,
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
    transform: [{ translateX: -100 }],
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
    fontSize: 14,
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

export default CurvyRoadDriveGame;

