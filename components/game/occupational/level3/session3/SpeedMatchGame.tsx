import GameInfoScreen from '@/components/game/GameInfoScreen';
import ResultCard from '@/components/game/ResultCard';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const TOTAL_ROUNDS = 12;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LANE_PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - LANE_PADDING * 2;
const MAX_DRAG_X = TRACK_WIDTH - 80;
const FINISH_DRAG_X = MAX_DRAG_X * 0.88;
const FAST_DURATION_MS = 650;
const SLOW_DURATION_MS = 1600;
const SPEED_TOLERANCE_MS = 450;

type SpeedType = 'FAST' | 'SLOW';

const SpeedMatchGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<SpeedType>('FAST');
  const [roundActive, setRoundActive] = useState(false);
  const [upperRunning, setUpperRunning] = useState(false);

  const upperTurtleX = useRef(new Animated.Value(0)).current;
  const lowerTurtleX = useRef(new Animated.Value(0)).current;
  const upperAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const dragStartOffset = useRef(0);
  const currentDragX = useRef(0);
  const panStartTime = useRef(0);
  const targetDurationRef = useRef(FAST_DURATION_MS);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const doneRef = useRef(false);
  const roundRef = useRef(1);
  const currentSpeedRef = useRef<SpeedType>('FAST');

  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);
  useEffect(() => {
    doneRef.current = done;
  }, [done]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  const endGame = useCallback(async () => {
    const total = TOTAL_ROUNDS;
    const xp = score * 12;
    const accuracy = (score / total) * 100;

    setFinalStats({ correct: score, total, xp });
    setDone(true);
    setRoundActive(false);
    roundActiveRef.current = false;
    doneRef.current = true;
    upperAnimRef.current?.stop();

    try {
      await logGameAndAward({
        type: 'speed-match',
        correct: score,
        total,
        accuracy,
        xpAwarded: xp,
        skillTags: ['listening', 'movement-sync'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  }, [score, router]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || !roundActiveRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    upperAnimRef.current?.stop();

    setScore((s) => s + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    setTimeout(() => {
      if (roundRef.current < TOTAL_ROUNDS) {
        setRound((r) => r + 1);
        setRoundActive(false);
        roundActiveRef.current = false;
        roundCompleteRef.current = false;
        setUpperRunning(false);
        upperTurtleX.setValue(0);
        lowerTurtleX.setValue(0);
        currentDragX.current = 0;
      } else {
        endGame();
      }
    }, 800);
  }, [endGame, upperTurtleX, lowerTurtleX]);

  const checkPlayerSpeedMatch = useCallback(
    (dragX: number) => {
      if (roundCompleteRef.current || !roundActiveRef.current) return;
      if (dragX < FINISH_DRAG_X) return;

      const playerMs = Date.now() - panStartTime.current;
      const diff = Math.abs(playerMs - targetDurationRef.current);
      if (diff <= SPEED_TOLERANCE_MS) {
        completeRound();
      }
    },
    [completeRound],
  );

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(12)
    .onStart(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      panStartTime.current = Date.now();
      dragStartOffset.current = currentDragX.current;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(MAX_DRAG_X, dragStartOffset.current + e.translationX));
      currentDragX.current = next;
      lowerTurtleX.setValue(next);
      checkPlayerSpeedMatch(next);
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(MAX_DRAG_X, dragStartOffset.current + e.translationX));
      if (next >= FINISH_DRAG_X && !roundCompleteRef.current) {
        const playerMs = Date.now() - panStartTime.current;
        const diff = Math.abs(playerMs - targetDurationRef.current);
        const speed = currentSpeedRef.current;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS(
          diff > SPEED_TOLERANCE_MS
            ? speed === 'FAST'
              ? 'Match the top turtle — drag faster!'
              : 'Match the top turtle — drag slower!'
            : 'Try again!',
          0.8,
        ).catch(() => {});
      }
      lowerTurtleX.setValue(0);
      currentDragX.current = 0;
      dragStartOffset.current = 0;
    });

  const runUpperTurtle = useCallback(
    (speed: SpeedType) => {
      const duration = speed === 'FAST' ? FAST_DURATION_MS : SLOW_DURATION_MS;
      targetDurationRef.current = duration;
      upperTurtleX.setValue(0);
      setUpperRunning(true);

      upperAnimRef.current?.stop();
      upperAnimRef.current = Animated.timing(upperTurtleX, {
        toValue: MAX_DRAG_X,
        duration,
        useNativeDriver: false,
      });
      upperAnimRef.current.start(({ finished }) => {
        if (finished) {
          setUpperRunning(false);
        }
      });
    },
    [upperTurtleX],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;

    const speed: SpeedType = Math.random() > 0.5 ? 'FAST' : 'SLOW';
    setCurrentSpeed(speed);
    currentSpeedRef.current = speed;
    roundCompleteRef.current = false;
    setRoundActive(true);
    roundActiveRef.current = true;
    lowerTurtleX.setValue(0);
    currentDragX.current = 0;

    runUpperTurtle(speed);

    const msg =
      speed === 'FAST'
        ? 'Watch the top turtle! Drag the bottom turtle fast to match!'
        : 'Watch the top turtle! Drag the bottom turtle slow to match!';
    if (Platform.OS === 'web') {
      setTimeout(() => speakTTS(msg, 0.8), 300);
    } else {
      speakTTS(msg, 0.8);
    }
  }, [runUpperTurtle, lowerTurtleX]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    setTimeout(() => startRoundPlay(), 500);
  }, [startRoundPlay]);

  useEffect(() => {
    if (!showInfo && !done && round <= TOTAL_ROUNDS) {
      startRound();
    }
  }, [showInfo, round, done, startRound]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        // ignore
      }
      cleanupSounds();
      upperAnimRef.current?.stop();
    };
  }, []);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Speed Match"
        emoji="🐢"
        description="Top turtle shows the speed. Drag the bottom turtle to match it!"
        skills={['Listening + movement sync']}
        suitableFor="Children who want to sync their movement with a model"
        onStart={() => setShowInfo(false)}
        onBack={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }

  if (done && finalStats) {
    return (
      <SafeAreaView style={styles.container}>
        <ResultCard
          correct={finalStats.correct}
          total={finalStats.total}
          xpAwarded={finalStats.xp}
          onHome={() => {
            stopAllSpeech();
            cleanupSounds();
            onBack?.();
          }}
          onPlayAgain={() => {
            setRound(1);
            roundRef.current = 1;
            setScore(0);
            setDone(false);
            doneRef.current = false;
            setFinalStats(null);
            setRoundActive(false);
            roundCompleteRef.current = false;
            upperTurtleX.setValue(0);
            lowerTurtleX.setValue(0);
          }}
        />
      </SafeAreaView>
    );
  }

  const speedLabel = currentSpeed === 'FAST' ? 'Fast' : 'Slow';
  const speedColor = currentSpeed === 'FAST' ? '#F59E0B' : '#3B82F6';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F0FDF4', '#DCFCE7', '#BBF7D0']} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity
        onPress={() => {
          try {
            stopTTS();
          } catch {
            // ignore
          }
          stopAllSpeech();
          cleanupSounds();
          upperAnimRef.current?.stop();
          onBack?.();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🐢 Speed Match</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Round: {round}/{TOTAL_ROUNDS}
          </Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        {roundActive && (
          <View style={[styles.speedBadge, { backgroundColor: speedColor }]}>
            <Text style={styles.speedBadgeText}>Top turtle: {speedLabel}</Text>
          </View>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.gameArea}>
          {!roundActive && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Get ready... 👀</Text>
            </View>
          )}

          {roundActive && (
            <>
              <Text style={styles.hintText}>Match the top turtle's speed with the bottom turtle</Text>

              {/* Upper lane — reference turtle (auto) */}
              <View style={styles.lane}>
                <Text style={styles.laneLabel}>Watch ↑</Text>
                <View style={styles.track}>
                  <View style={[styles.finishFlag, { right: 0 }]}>
                    <Text style={styles.finishEmoji}>🏁</Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.turtleWrap,
                      styles.upperTurtle,
                      { transform: [{ translateX: upperTurtleX }, { scaleY: -1 }] },
                    ]}
                  >
                    <Text style={styles.turtleEmoji}>🐢</Text>
                  </Animated.View>
                </View>
              </View>

              <View style={styles.laneDivider} />

              {/* Lower lane — player turtle (drag) */}
              <View style={styles.lane}>
                <Text style={styles.laneLabel}>You drag ↓</Text>
                <View style={styles.track}>
                  <View style={[styles.finishFlag, { right: 0 }]}>
                    <Text style={styles.finishEmoji}>🏁</Text>
                  </View>
                  <Animated.View
                    style={[styles.turtleWrap, styles.lowerTurtle, { transform: [{ translateX: lowerTurtleX }] }]}
                  >
                    <Text style={styles.turtleEmoji}>🐢</Text>
                  </Animated.View>
                </View>
                {upperRunning && (
                  <Text style={styles.dragHint}>Drag bottom turtle now — match the speed!</Text>
                )}
              </View>
            </>
          )}
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 8,
  },
  backText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  header: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 12, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#065F46', marginBottom: 12 },
  scoreContainer: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  scoreText: { fontSize: 18, fontWeight: '700', color: '#047857' },
  speedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  speedBadgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  gameArea: {
    flex: 1,
    paddingHorizontal: LANE_PADDING,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 16,
  },
  lane: { marginVertical: 8 },
  laneLabel: { fontSize: 14, fontWeight: '800', color: '#065F46', marginBottom: 8 },
  laneDivider: {
    height: 2,
    backgroundColor: '#86EFAC',
    marginVertical: 12,
    borderRadius: 1,
  },
  track: {
    height: 88,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6EE7B7',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  turtleWrap: {
    position: 'absolute',
    left: 8,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upperTurtle: { top: 8 },
  lowerTurtle: { top: 8 },
  turtleEmoji: { fontSize: 52 },
  finishFlag: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  finishEmoji: { fontSize: 28 },
  dragHint: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  waitingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  waitingText: { fontSize: 24, fontWeight: '700', color: '#047857' },
});

export default SpeedMatchGame;
