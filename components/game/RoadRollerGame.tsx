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
    useSharedValue
} from 'react-native-reanimated';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const RESET_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const ROLLER_SIZE = 80;
const ROAD_WIDTH = 100;
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

const RoadRollerGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);
  const playReset = useSoundEffect(RESET_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [progress, setProgress] = useState(0);

  const rollerX = useSharedValue(15);
  const rollerY = useSharedValue(50);
  const rollerRotation = useSharedValue(0);
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
          type: 'roadRoller',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['directionality', 'start-end-awareness', 'hand-stability', 'straight-line-tracing'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log road roller game:', e);
      }

      Speech.speak('Road master!', { rate: 0.78 });
    },
    [router],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!roundActive || done) return;
      setIsRolling(true);
    })
    .onUpdate((e) => {
      if (!roundActive || done) return;
      const newX = (e.x / screenWidth.current) * 100;
      const newY = (e.y / screenHeight.current) * 100;
      
      if (isHorizontal) {
        rollerX.value = Math.max(5, Math.min(95, newX));
        rollerY.value = startY.value;
        const dist = Math.abs(newX - startX.value);
        const totalDist = Math.abs(endX.value - startX.value);
        rollerRotation.value = (dist / totalDist) * 360;
        setProgress(Math.min(100, (dist / totalDist) * 100));
      } else {
        rollerX.value = startX.value;
        rollerY.value = Math.max(10, Math.min(90, newY));
        const dist = Math.abs(newY - startY.value);
        const totalDist = Math.abs(endY.value - startY.value);
        rollerRotation.value = (dist / totalDist) * 360;
        setProgress(Math.min(100, (dist / totalDist) * 100));
      }
    })
    .onEnd(() => {
      if (!roundActive || done) return;
      setIsRolling(false);

      const distance = Math.sqrt(
        Math.pow(rollerX.value - endX.value, 2) + Math.pow(rollerY.value - endY.value, 2)
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
              rollerRotation.value = 0;
              rollerX.value = startX.value;
              rollerY.value = startY.value;
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
        rollerRotation.value = 0;
        setProgress(0);
        rollerX.value = startX.value;
        rollerY.value = startY.value;

        try {
          playReset();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Speech.speak('Roll along the road!', { rate: 0.78 });
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
      rollerX.value = startXPos;
      rollerY.value = yPos;
      endX.value = 80 + Math.random() * 15;
      endY.value = yPos;
    } else {
      const xPos = 40 + Math.random() * 20;
      const startYPos = 10 + Math.random() * 10;
      startX.value = xPos;
      startY.value = startYPos;
      rollerX.value = xPos;
      rollerY.value = startYPos;
      endX.value = xPos;
      endY.value = 75 + Math.random() * 15;
    }

    rollerRotation.value = 0;
    setProgress(0);

    try {
      Speech.speak('Roll the roller along the straight road!', { rate: 0.78 });
    } catch {}
  }, [round]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const rollerStyle = useAnimatedStyle(() => ({
    left: `${rollerX.value}%`,
    top: `${rollerY.value}%`,
    transform: [
      { translateX: -ROLLER_SIZE / 2 },
      { translateY: -ROLLER_SIZE / 2 },
      { rotate: `${rollerRotation.value}deg` },
    ],
  }));

  const roadStyle = useAnimatedStyle(() => {
    if (isHorizontal) {
      return {
        position: 'absolute',
        left: `${Math.min(startX.value, endX.value)}%`,
        top: `${startY.value}%`,
        width: `${Math.abs(endX.value - startX.value)}%`,
        height: ROAD_WIDTH,
        transform: [{ translateY: -ROAD_WIDTH / 2 }],
        backgroundColor: '#6B7280',
      };
    } else {
      return {
        position: 'absolute',
        left: `${startX.value}%`,
        top: `${Math.min(startY.value, endY.value)}%`,
        width: ROAD_WIDTH,
        height: `${Math.abs(endY.value - startY.value)}%`,
        transform: [{ translateX: -ROAD_WIDTH / 2 }],
        backgroundColor: '#6B7280',
      };
    }
  });

  const endMarkerStyle = useAnimatedStyle(() => ({
    left: `${endX.value}%`,
    top: `${endY.value}%`,
    transform: [
      { translateX: -15 },
      { translateY: -15 },
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
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🚧</Text>
            <Text style={styles.resultTitle}>Road master!</Text>
            <Text style={styles.resultSubtitle}>
              You rolled {finalStats.correct} roads out of {finalStats.total}!
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
                rollerRotation.value = 0;
                rollerX.value = startX.value;
                rollerY.value = startY.value;
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
        <Text style={styles.title}>Road Roller</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🚧 Score: {score}
        </Text>
        <Text style={styles.helper}>
          Roll the roller along the straight road!
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
            <Animated.View style={[styles.road, roadStyle]} />
            
            <Animated.View style={[styles.endMarker, endMarkerStyle]}>
              <View style={styles.marker}>
                <Text style={styles.markerEmoji}>🏁</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.rollerContainer, rollerStyle]}>
              <View style={styles.roller}>
                <Text style={styles.rollerEmoji}>🚧</Text>
              </View>
            </Animated.View>

            {score > 0 && !isRolling && (
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
          Roll the roller along the straight road to build directionality!
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
  road: {
    borderRadius: 4,
    zIndex: 1,
  },
  rollerContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  roller: {
    width: ROLLER_SIZE,
    height: ROLLER_SIZE,
    borderRadius: ROLLER_SIZE / 2,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  rollerEmoji: {
    fontSize: 50,
  },
  endMarker: {
    position: 'absolute',
    zIndex: 2,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#16A34A',
  },
  markerEmoji: {
    fontSize: 20,
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

export default RoadRollerGame;


