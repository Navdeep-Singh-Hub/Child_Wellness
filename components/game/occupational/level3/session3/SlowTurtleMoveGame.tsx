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

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TURTLE_BASE_LEFT = SCREEN_WIDTH * 0.1;
const TURTLE_TOP = SCREEN_HEIGHT * 0.5;
const MAX_DRAG_X = SCREEN_WIDTH * 0.72;
const FINISH_DRAG_X = SCREEN_WIDTH * 0.62;
/** Must drag for at least this long before finish counts (slow movement) */
const SLOW_MIN_DRAG_MS = 450;

const SlowTurtleMoveGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showTurtle, setShowTurtle] = useState(false);

  const turtleX = useRef(new Animated.Value(0)).current;
  const dragStartOffset = useRef(0);
  const currentDragX = useRef(0);
  const panStartTime = useRef(0);
  const showTurtleRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const doneRef = useRef(false);
  const roundRef = useRef(1);

  useEffect(() => {
    showTurtleRef.current = showTurtle;
  }, [showTurtle]);
  useEffect(() => {
    doneRef.current = done;
  }, [done]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const endGame = useCallback(async () => {
    const total = TOTAL_ROUNDS;
    const xp = score * 12;
    const accuracy = (score / total) * 100;

    setFinalStats({ correct: score, total, xp });
    setDone(true);
    setShowTurtle(false);
    doneRef.current = true;

    try {
      await logGameAndAward({
        type: 'slow-turtle-move',
        correct: score,
        total,
        accuracy,
        xpAwarded: xp,
        skillTags: ['patience', 'controlled-motion'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  }, [score, router]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || !showTurtleRef.current || doneRef.current) return;
    roundCompleteRef.current = true;

    setScore((s) => s + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.timing(turtleX, {
      toValue: MAX_DRAG_X,
      duration: 400,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      if (roundRef.current < TOTAL_ROUNDS) {
        setRound((r) => r + 1);
        setShowTurtle(false);
        showTurtleRef.current = false;
        roundCompleteRef.current = false;
        turtleX.setValue(0);
        currentDragX.current = 0;
      } else {
        endGame();
      }
    }, 900);
  }, [turtleX, endGame]);

  const tryFinishSlowDrag = useCallback(
    (dragX: number) => {
      if (roundCompleteRef.current || !showTurtleRef.current) return;
      if (dragX < FINISH_DRAG_X) return;

      const elapsed = Date.now() - panStartTime.current;
      if (elapsed >= SLOW_MIN_DRAG_MS) {
        completeRound();
      }
    },
    [completeRound],
  );

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(12)
    .onStart(() => {
      if (!showTurtleRef.current || roundCompleteRef.current || doneRef.current) return;
      panStartTime.current = Date.now();
      dragStartOffset.current = currentDragX.current;
    })
    .onUpdate((e) => {
      if (!showTurtleRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(MAX_DRAG_X, dragStartOffset.current + e.translationX));
      currentDragX.current = next;
      turtleX.setValue(next);
      tryFinishSlowDrag(next);
    })
    .onEnd((e) => {
      if (!showTurtleRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(MAX_DRAG_X, dragStartOffset.current + e.translationX));
      if (next >= FINISH_DRAG_X && Date.now() - panStartTime.current < SLOW_MIN_DRAG_MS) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Move the turtle more slowly!', 0.8).catch(() => {});
        turtleX.setValue(0);
        currentDragX.current = 0;
        dragStartOffset.current = 0;
      } else if (next < FINISH_DRAG_X) {
        turtleX.setValue(0);
        currentDragX.current = 0;
        dragStartOffset.current = 0;
      }
    });

  const showTurtleObject = useCallback(() => {
    setShowTurtle(true);
    showTurtleRef.current = true;
    roundCompleteRef.current = false;
    turtleX.setValue(0);
    currentDragX.current = 0;
    dragStartOffset.current = 0;

    if (Platform.OS === 'web') {
      setTimeout(() => {
        speakTTS('Drag the turtle slowly to the finish line!', 0.8);
      }, 300);
    } else {
      speakTTS('Drag the turtle slowly to the finish line!', 0.8);
    }
  }, [turtleX]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    setTimeout(() => {
      showTurtleObject();
    }, 500);
  }, [showTurtleObject]);

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
    };
  }, []);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Slow Turtle Move"
        emoji="🐢"
        description="Drag the turtle slowly to the finish line"
        skills={['Patience', 'Controlled motion']}
        suitableFor="Children who want to develop patience and controlled motion"
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
            setShowTurtle(false);
            showTurtleRef.current = false;
            roundCompleteRef.current = false;
            turtleX.setValue(0);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity
        onPress={() => {
          try {
            stopTTS();
          } catch {
            // ignore
          }
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🐢 Slow Turtle Move</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Round: {round}/{TOTAL_ROUNDS}
          </Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.gameArea}>
          {showTurtle && (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>⬅️ Drag slowly to the finish line!</Text>
            </View>
          )}

          {showTurtle && (
            <Animated.View
              style={[
                styles.turtle,
                {
                  left: TURTLE_BASE_LEFT,
                  top: TURTLE_TOP,
                  transform: [{ translateX: turtleX }],
                },
              ]}
            >
              <Text style={styles.turtleEmoji}>🐢</Text>
            </Animated.View>
          )}

          {!showTurtle && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Get ready... 👀</Text>
            </View>
          )}

          {showTurtle && (
            <View style={[styles.finishLine, { left: SCREEN_WIDTH * 0.85 }]}>
              <Text style={styles.finishText}>🏁</Text>
            </View>
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
  header: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#065F46', marginBottom: 16 },
  scoreContainer: { flexDirection: 'row', gap: 20 },
  scoreText: { fontSize: 18, fontWeight: '700', color: '#047857' },
  gameArea: { flex: 1, position: 'relative' },
  instructionContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  instructionText: { fontSize: 24, fontWeight: '800', color: '#065F46', textAlign: 'center' },
  turtle: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  turtleEmoji: { fontSize: 60 },
  waitingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  waitingText: { fontSize: 24, fontWeight: '700', color: '#047857' },
  finishLine: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    width: 4,
    height: 100,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: { fontSize: 30, marginTop: -40 },
});

export default SlowTurtleMoveGame;
