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
    withSpring
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARNING_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 6;
const OBJECT_SIZE = 45;
const LINE_TOLERANCE = 35;
const SLOW_PACE = true; // Slow-paced as specified

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

const distanceToLineSegment = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const distanceToZigZag = (px: number, py: number, points: Array<{ x: number; y: number }>) => {
  let minDist = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const dist = distanceToLineSegment(px, py, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
};

const ZigZagRaceGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const progress = useSharedValue(0);
  const [racePathStr, setRacePathStr] = useState('');
  const [progressPathStr, setProgressPathStr] = useState('');

  const pathPoints = useRef<Array<{ x: number; y: number }>>([]);
  const startTime = useRef<number | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const objectX = useSharedValue(15);
  const objectY = useSharedValue(50);
  const objectScale = useSharedValue(1);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  const screenWidth = useRef(400);
  const screenHeight = useRef(600);
  const lastWarningTime = useRef(0);

  const updatePaths = useCallback(() => {
    if (pathPoints.current.length === 0) return;

    let path = `M ${pathPoints.current[0].x} ${pathPoints.current[0].y}`;
    for (let i = 1; i < pathPoints.current.length; i++) {
      path += ` L ${pathPoints.current[i].x} ${pathPoints.current[i].y}`;
    }
    setRacePathStr(path);

    if (progress.value > 0) {
      const totalSegments = pathPoints.current.length - 1;
      const progressSegment = Math.floor(progress.value * totalSegments);
      const segmentProgress = (progress.value * totalSegments) - progressSegment;
      const clampedSegment = Math.min(progressSegment, totalSegments - 1);

      let progressPath = `M ${pathPoints.current[0].x} ${pathPoints.current[0].y}`;
      for (let i = 1; i <= clampedSegment; i++) {
        progressPath += ` L ${pathPoints.current[i].x} ${pathPoints.current[i].y}`;
      }

      if (segmentProgress > 0 && clampedSegment < totalSegments) {
        const startPt = pathPoints.current[clampedSegment];
        const endPt = pathPoints.current[clampedSegment + 1];
        const x = startPt.x + (endPt.x - startPt.x) * segmentProgress;
        const y = startPt.y + (endPt.y - startPt.y) * segmentProgress;
        progressPath += ` L ${x} ${y}`;
      }
      setProgressPathStr(progressPath);
    } else {
      setProgressPathStr('');
    }
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 20;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setRoundActive(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'zigZagRace',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['direction-change', 'motor-planning', 'timed-zig-zag'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log zig-zag race game:', e);
      }

      Speech.speak('Race complete! Great job!', { rate: 0.78 });
    },
    [router],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!roundActive || done) return;
      setIsDragging(true);
      objectScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
      if (!startTime.current) {
        startTime.current = Date.now();
        timerInterval.current = setInterval(() => {
          if (startTime.current) {
            setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000));
          }
        }, 100);
      }
    })
    .onUpdate((e) => {
      if (!roundActive || done) return;
      const newX = (e.x / screenWidth.current) * 100;
      const newY = (e.y / screenHeight.current) * 100;

      objectX.value = Math.max(5, Math.min(95, newX));
      objectY.value = Math.max(10, Math.min(90, newY));

      const dist = distanceToZigZag(objectX.value, objectY.value, pathPoints.current);

      if (dist > LINE_TOLERANCE) {
        if (!isOffTrack) {
          setIsOffTrack(true);
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
        setIsOffTrack(false);
        // Calculate progress along path - find closest segment
        let totalDist = 0;
        const segmentDists: number[] = [];
        for (let i = 0; i < pathPoints.current.length - 1; i++) {
          const segDist = Math.sqrt(
            Math.pow(pathPoints.current[i + 1].x - pathPoints.current[i].x, 2) +
            Math.pow(pathPoints.current[i + 1].y - pathPoints.current[i].y, 2),
          );
          segmentDists.push(segDist);
          totalDist += segDist;
        }

        // Find the closest point on any segment
        let minDist = Infinity;
        let bestSegment = 0;
        let bestParam = 0;

        for (let i = 0; i < pathPoints.current.length - 1; i++) {
          const p1 = pathPoints.current[i];
          const p2 = pathPoints.current[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const lenSq = dx * dx + dy * dy;
          
          if (lenSq === 0) continue;
          
          const t = Math.max(0, Math.min(1, 
            ((objectX.value - p1.x) * dx + (objectY.value - p1.y) * dy) / lenSq
          ));
          
          const closestX = p1.x + t * dx;
          const closestY = p1.y + t * dy;
          const dist = Math.sqrt(
            Math.pow(objectX.value - closestX, 2) +
            Math.pow(objectY.value - closestY, 2)
          );
          
          if (dist < minDist) {
            minDist = dist;
            bestSegment = i;
            bestParam = t;
          }
        }

        // Calculate progress based on closest segment
        const segStartDist = segmentDists.slice(0, bestSegment).reduce((a, b) => a + b, 0);
        const distAlongSeg = segmentDists[bestSegment] * bestParam;
        const currentDist = segStartDist + distAlongSeg;
        const newProgress = totalDist > 0 ? Math.min(1, Math.max(progress.value, currentDist / totalDist)) : 0;
        
        if (newProgress > progress.value) {
          progress.value = newProgress;
          updatePaths();
        }
      }
    })
    .onEnd(() => {
      if (!roundActive || done) return;
      setIsDragging(false);
      objectScale.value = withSpring(1, { damping: 10, stiffness: 200 });

      const lastPoint = pathPoints.current[pathPoints.current.length - 1];
      const distToEnd = Math.sqrt(
        Math.pow(objectX.value - lastPoint.x, 2) + Math.pow(objectY.value - lastPoint.y, 2),
      );

      if (distToEnd <= LINE_TOLERANCE && progress.value >= 0.75) {
        sparkleX.value = lastPoint.x;
        sparkleY.value = lastPoint.y;

        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }

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
              setElapsedTime(0);
              startTime.current = null;
              const firstPoint = pathPoints.current[0];
              objectX.value = withSpring(firstPoint.x, { damping: 10, stiffness: 100 });
              objectY.value = withSpring(firstPoint.y, { damping: 10, stiffness: 100 });
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
        const firstPoint = pathPoints.current[0];
        objectX.value = withSpring(firstPoint.x, { damping: 10, stiffness: 100 });
        objectY.value = withSpring(firstPoint.y, { damping: 10, stiffness: 100 });
        progress.value = 0;
        updatePaths();
        setIsOffTrack(false);

        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Speech.speak('Follow the zig-zag race path!', { rate: 0.78 });
        } catch {}
      }
    });

  useEffect(() => {
    try {
      Speech.speak('Race along the zig-zag path! Take your time and follow carefully.', { rate: 0.78 });
    } catch {}
    // Generate zig-zag race path
    const points: Array<{ x: number; y: number }> = [];
    const numSegments = 8 + Math.floor(Math.random() * 4);
    const startX = 15;
    const startY = 50;
    const endX = 85;
    const endY = 50;

    points.push({ x: startX, y: startY });

    for (let i = 1; i < numSegments; i++) {
      const t = i / numSegments;
      const baseX = startX + (endX - startX) * t;
      const amplitude = 22 + Math.random() * 18;
      const offset = (i % 2 === 0 ? 1 : -1) * amplitude;
      points.push({
        x: baseX,
        y: startY + offset,
      });
    }
    points.push({ x: endX, y: endY });

    pathPoints.current = points;
    
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
    objectX.value = startX;
    objectY.value = startY;
    progress.value = 0;
    setElapsedTime(0);
    startTime.current = null;
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    updatePaths();
  }, [round, updatePaths]);

  useEffect(() => {
    const interval = setInterval(updatePaths, 100);
    return () => {
      clearInterval(interval);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [updatePaths]);

  const handleBack = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
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
      { scale: objectScale.value },
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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🏁</Text>
            <Text style={styles.resultTitle}>Race Complete!</Text>
            <Text style={styles.resultSubtitle}>
              You finished {finalStats.correct} races out of {finalStats.total}!
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
                setElapsedTime(0);
                startTime.current = null;
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
        <Text style={styles.title}>Zig-Zag Race</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🏁 Score: {score}
        </Text>
        {elapsedTime > 0 && (
          <Text style={styles.timer}>Time: {elapsedTime}s</Text>
        )}
        <Text style={styles.helper}>
          Race along the zig-zag path! Take your time and follow carefully.
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
                d={racePathStr}
                stroke="rgba(148, 163, 184, 0.5)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {progressPathStr ? (
                <Path
                  d={progressPathStr}
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>

            <Animated.View style={[styles.objectContainer, objectStyle]}>
              <View
                style={[
                  styles.object,
                  {
                    backgroundColor: isOffTrack ? '#EF4444' : '#EF4444',
                  },
                ]}
              >
                <Text style={styles.objectEmoji}>🏁</Text>
              </View>
            </Animated.View>

            {score > 0 && !isDragging && (
              <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
                <SparkleBurst />
              </Animated.View>
            )}

            {isOffTrack && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>Stay on track! ⚠️</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: direction change • motor planning • timed zig-zag
        </Text>
        <Text style={styles.footerSub}>
          Race along the zig-zag path at your own pace!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEE2E2',
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
    marginBottom: 4,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
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
    fontSize: 28,
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

export default ZigZagRaceGame;

