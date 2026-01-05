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
const RESET_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const DOT_SIZE = 60;
const LINE_WIDTH = 8;
const TOLERANCE = 40;

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

const StartStopLineGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);
  const playReset = useSoundEffect(RESET_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [progress, setProgress] = useState(0);

  const dotX = useSharedValue(15);
  const dotY = useSharedValue(50);
  const dotScale = useSharedValue(1);
  const sparkleX = useSharedValue(0);
  const sparkleY = useSharedValue(0);
  const startX = useSharedValue(15);
  const startY = useSharedValue(50);
  const endX = useSharedValue(85);
  const endY = useSharedValue(50);

  const screenWidth = useRef(400);
  const screenHeight = useRef(600);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 18;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setRoundActive(false);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'startStopLine',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['directionality', 'start-end-awareness', 'hand-stability', 'straight-line-tracing'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log start stop line game:', e);
      }

      Speech.speak('Line master!', { rate: 0.78 });
    },
    [router],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!roundActive || done) return;
      setIsDragging(true);
      dotScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
    })
    .onUpdate((e) => {
      if (!roundActive || done) return;
      const newX = (e.x / screenWidth.current) * 100;
      const newY = (e.y / screenHeight.current) * 100;
      
      if (isHorizontal) {
        dotX.value = Math.max(5, Math.min(95, newX));
        dotY.value = startY.value;
        const dist = Math.abs(newX - startX.value);
        const totalDist = Math.abs(endX.value - startX.value);
        setProgress(Math.min(100, (dist / totalDist) * 100));
      } else {
        dotX.value = startX.value;
        dotY.value = Math.max(10, Math.min(90, newY));
        const dist = Math.abs(newY - startY.value);
        const totalDist = Math.abs(endY.value - startY.value);
        setProgress(Math.min(100, (dist / totalDist) * 100));
      }
    })
    .onEnd(() => {
      if (!roundActive || done) return;
      setIsDragging(false);
      dotScale.value = withSpring(1, { damping: 10, stiffness: 200 });

      const distance = Math.sqrt(
        Math.pow(dotX.value - endX.value, 2) + Math.pow(dotY.value - endY.value, 2)
      );

      if (distance <= TOLERANCE && progress > 80) {
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
              setProgress(0);
              dotX.value = startX.value;
              dotY.value = startY.value;
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
        setProgress(0);
        dotX.value = startX.value;
        dotY.value = startY.value;

        try {
          playReset();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Speech.speak('Drag from green to red!', { rate: 0.78 });
        } catch {}
      }
    });

  useEffect(() => {
    const horizontal = Math.random() > 0.5;
    setIsHorizontal(horizontal);
    
    if (horizontal) {
      const startXPos = 10 + Math.random() * 10;
      const yPos = 40 + Math.random() * 20;
      startX.value = startXPos;
      startY.value = yPos;
      dotX.value = startXPos;
      dotY.value = yPos;
      endX.value = 80 + Math.random() * 15;
      endY.value = yPos;
    } else {
      const xPos = 40 + Math.random() * 20;
      const startYPos = 10 + Math.random() * 10;
      startX.value = xPos;
      startY.value = startYPos;
      dotX.value = xPos;
      dotY.value = startYPos;
      endX.value = xPos;
      endY.value = 75 + Math.random() * 15;
    }

    setProgress(0);

    try {
      Speech.speak('Drag from the green dot to the red dot!', { rate: 0.78 });
    } catch {}
  }, [round]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const dotStyle = useAnimatedStyle(() => ({
    left: `${dotX.value}%`,
    top: `${dotY.value}%`,
    transform: [
      { translateX: -DOT_SIZE / 2 },
      { translateY: -DOT_SIZE / 2 },
      { scale: dotScale.value },
    ],
  }));

  const lineStyle = useAnimatedStyle(() => {
    if (isHorizontal) {
      return {
        position: 'absolute',
        left: `${Math.min(startX.value, endX.value)}%`,
        top: `${startY.value}%`,
        width: `${Math.abs(endX.value - startX.value)}%`,
        height: LINE_WIDTH,
        transform: [{ translateY: -LINE_WIDTH / 2 }],
        backgroundColor: '#94A3B8',
      };
    } else {
      return {
        position: 'absolute',
        left: `${startX.value}%`,
        top: `${Math.min(startY.value, endY.value)}%`,
        width: LINE_WIDTH,
        height: `${Math.abs(endY.value - startY.value)}%`,
        transform: [{ translateX: -LINE_WIDTH / 2 }],
        backgroundColor: '#94A3B8',
      };
    }
  });

  const startDotStyle = useAnimatedStyle(() => ({
    left: `${startX.value}%`,
    top: `${startY.value}%`,
    transform: [
      { translateX: -DOT_SIZE / 2 },
      { translateY: -DOT_SIZE / 2 },
    ],
  }));

  const endDotStyle = useAnimatedStyle(() => ({
    left: `${endX.value}%`,
    top: `${endY.value}%`,
    transform: [
      { translateX: -DOT_SIZE / 2 },
      { translateY: -DOT_SIZE / 2 },
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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🟢</Text>
            <Text style={styles.resultTitle}>Line master!</Text>
            <Text style={styles.resultSubtitle}>
              You completed {finalStats.correct} lines out of {finalStats.total}!
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
                setRoundActive(true);
                setProgress(0);
                dotX.value = startX.value;
                dotY.value = startY.value;
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
        <Text style={styles.title}>Start–Stop Line</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🟢 Score: {score}
        </Text>
        <Text style={styles.helper}>
          Drag from the green dot to the red dot!
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
            <Animated.View style={[styles.line, lineStyle]} />
            
            <Animated.View style={[styles.startDotContainer, startDotStyle]}>
              <View style={styles.startDot}>
                <Text style={styles.startDotEmoji}>🟢</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.endDotContainer, endDotStyle]}>
              <View style={styles.endDot}>
                <Text style={styles.endDotEmoji}>🔴</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.dotContainer, dotStyle]}>
              <View style={styles.dot}>
                <Text style={styles.dotEmoji}>⚪</Text>
              </View>
            </Animated.View>

            {score > 0 && !isDragging && (
              <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
                <SparkleBurst />
              </Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: directionality • start-end awareness • hand stability
        </Text>
        <Text style={styles.footerSub}>
          Drag from the green dot to the red dot along the line!
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
  gestureArea: {
    flex: 1,
    position: 'relative',
  },
  line: {
    borderRadius: 4,
    zIndex: 1,
  },
  startDotContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  startDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#16A34A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  startDotEmoji: {
    fontSize: 40,
  },
  endDotContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  endDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  endDotEmoji: {
    fontSize: 40,
  },
  dotContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#94A3B8',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  dotEmoji: {
    fontSize: 40,
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

export default StartStopLineGame;


