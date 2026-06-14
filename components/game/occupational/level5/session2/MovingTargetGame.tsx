import GameInfoScreen from '@/components/game/GameInfoScreen';
import ResultCard from '@/components/game/ResultCard';
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MOVE_TICK_MS = 16;

type RoundSettings = {
  dotSize: number;
  speed: number;
  tolerance: number;
};

const getRoundSettings = (roundNum: number): RoundSettings => {
  if (roundNum <= 2) {
    return { dotSize: 68, speed: 0.9, tolerance: Platform.OS === 'android' ? 74 : 64 };
  }
  if (roundNum <= 4) {
    return { dotSize: 60, speed: 1.4, tolerance: Platform.OS === 'android' ? 66 : 56 };
  }
  if (roundNum <= 7) {
    return { dotSize: 54, speed: 1.9, tolerance: Platform.OS === 'android' ? 60 : 52 };
  }
  return { dotSize: 48, speed: 2.4, tolerance: Platform.OS === 'android' ? 54 : 48 };
};

const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

const MovingTargetGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [dotVisible, setDotVisible] = useState(false);
  const [roundSettings, setRoundSettings] = useState<RoundSettings>(() => getRoundSettings(1));

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);
  const doneRef = useRef(false);
  const roundActiveRef = useRef(false);
  const hitLockedRef = useRef(false);
  const scoreRef = useRef(0);
  const dotPosRef = useRef({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.45 });
  const dirX = useRef(0.9);
  const dirY = useRef(0.9);
  const speedRef = useRef(0.9);
  const dotSizeRef = useRef(68);
  const toleranceRef = useRef(64);

  const dotX = useSharedValue(SCREEN_WIDTH * 0.5);
  const dotY = useSharedValue(SCREEN_HEIGHT * 0.45);
  const dotScale = useSharedValue(1);

  const displayRound = Math.min(score + 1, TOTAL_ROUNDS);

  const dotStyle = useAnimatedStyle(() => ({
    left: dotX.value - dotSizeRef.current / 2,
    top: dotY.value - dotSizeRef.current / 2,
    width: dotSizeRef.current,
    height: dotSizeRef.current,
    borderRadius: dotSizeRef.current / 2,
    transform: [{ scale: dotScale.value }],
  }));

  const clearMoveTimer = useCallback(() => {
    if (moveTimerRef.current) {
      clearInterval(moveTimerRef.current);
      moveTimerRef.current = null;
    }
    cancelAnimation(dotScale);
  }, [dotScale]);

  const clearRoundStartTimer = useCallback(() => {
    if (roundStartTimerRef.current) {
      clearTimeout(roundStartTimerRef.current);
      roundStartTimerRef.current = null;
    }
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearMoveTimer();
    clearRoundStartTimer();
    clearAdvanceTimer();
  }, [clearAdvanceTimer, clearMoveTimer, clearRoundStartTimer]);

  const syncDotPos = useCallback((x: number, y: number) => {
    dotPosRef.current = { x, y };
  }, []);

  const applyRoundSettings = useCallback((roundNum: number) => {
    const settings = getRoundSettings(roundNum);
    speedRef.current = settings.speed;
    dotSizeRef.current = settings.dotSize;
    toleranceRef.current = settings.tolerance;
    setRoundSettings(settings);
  }, []);

  const placeDot = useCallback(
    (roundNum: number) => {
      applyRoundSettings(roundNum);
      const w = screenWidth.current;
      const h = screenHeight.current;
      const pad = dotSizeRef.current / 2;
      const topPad = pad + 8;
      const bottomPad = h - pad - 8;
      const speed = speedRef.current;

      const x = randomInRange(pad, w - pad);
      const y = randomInRange(topPad, bottomPad);

      const angle = Math.random() * Math.PI * 2;
      dirX.current = Math.cos(angle) * speed;
      dirY.current = Math.sin(angle) * speed;

      dotX.value = x;
      dotY.value = y;
      dotScale.value = 1;
      syncDotPos(x, y);
      hitLockedRef.current = false;
      setDotVisible(true);
      roundActiveRef.current = true;
    },
    [applyRoundSettings, dotX, dotY, dotScale, syncDotPos],
  );

  const tickMove = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;

    const w = screenWidth.current;
    const h = screenHeight.current;
    const pad = dotSizeRef.current / 2;
    const topPad = pad + 8;
    const bottomPad = h - pad - 8;

    let nx = dotX.value + dirX.current;
    let ny = dotY.value + dirY.current;

    if (nx <= pad) {
      nx = pad + 1;
      dirX.current = Math.abs(dirX.current);
    } else if (nx >= w - pad) {
      nx = w - pad - 1;
      dirX.current = -Math.abs(dirX.current);
    }

    if (ny <= topPad) {
      ny = topPad + 1;
      dirY.current = Math.abs(dirY.current);
    } else if (ny >= bottomPad) {
      ny = bottomPad - 1;
      dirY.current = -Math.abs(dirY.current);
    }

    dotX.value = nx;
    dotY.value = ny;
    syncDotPos(nx, ny);
  }, [dotX, dotY, syncDotPos]);

  const startMovement = useCallback(() => {
    clearMoveTimer();
    moveTimerRef.current = setInterval(tickMove, MOVE_TICK_MS);
  }, [clearMoveTimer, tickMove]);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 15;
      const accuracy = (finalScore / total) * 100;

      doneRef.current = true;
      roundActiveRef.current = false;
      clearAllTimers();
      setDotVisible(false);

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await logGameAndAward({
          type: 'moving-target',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['timing-control', 'hand-eye-coordination', 'reaction-time'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearAllTimers, router],
  );

  const scheduleAfterHit = useCallback(
    (newScore: number) => {
      roundActiveRef.current = false;
      clearMoveTimer();
      setDotVisible(false);

      if (newScore >= TOTAL_ROUNDS) {
        advanceTimerRef.current = setTimeout(() => endGame(newScore), 700);
      }
    },
    [clearMoveTimer, endGame],
  );

  const handleDotHit = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current || hitLockedRef.current) return;

    hitLockedRef.current = true;

    dotScale.value = withSequence(
      withTiming(1.5, { duration: 120 }),
      withTiming(1, { duration: 120 }),
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Great timing!', 0.9, 'en-US');

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);
    scheduleAfterHit(newScore);
  }, [dotScale, scheduleAfterHit]);

  const handleGameTap = useCallback(
    (event: GestureResponderEvent) => {
      if (doneRef.current || !roundActiveRef.current || !dotVisible || hitLockedRef.current) return;
      const { x, y } = dotPosRef.current;
      if (isTapNearTarget(event, x, y, dotSizeRef.current, toleranceRef.current)) {
        handleDotHit();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [dotVisible, handleDotHit],
  );

  const startRound = useCallback(
    (roundNum: number) => {
      if (doneRef.current) return;
      stopTTS();
      placeDot(roundNum);
      startMovement();
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true;
        speakTTS('Tap the moving dot!', 0.8, 'en-US');
      } else if (roundNum <= 3) {
        speakTTS('Nice! Keep tapping the dot.', 0.78, 'en-US');
      }
    },
    [placeDot, startMovement],
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!showInfo && !done && !dotVisible) {
      const roundNum = score + 1;
      if (roundNum > TOTAL_ROUNDS) return;
      clearRoundStartTimer();
      const delay = score === 0 ? 450 : 700;
      roundStartTimerRef.current = setTimeout(() => startRound(roundNum), delay);
      return clearRoundStartTimer;
    }
  }, [showInfo, score, done, dotVisible, startRound, clearRoundStartTimer]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        // Ignore errors
      }
      cleanupSounds();
      clearAllTimers();
    };
  }, [clearAllTimers]);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Moving Target"
        emoji="⚫"
        description="Tap the moving dot! Build your timing control."
        skills={['Timing control']}
        suitableFor="Children learning timing and hand-eye coordination"
        onStart={() => {
          setShowInfo(false);
        }}
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
            doneRef.current = false;
            scoreRef.current = 0;
            hitLockedRef.current = false;
            setScore(0);
            setDone(false);
            setFinalStats(null);
            hasSpokenRef.current = false;
            setDotVisible(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearAllTimers();
          onBack?.();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Moving Target</Text>
        <Text style={styles.subtitle}>
          Round {displayRound}/{TOTAL_ROUNDS} • ⚫ Score: {score}
        </Text>
        <Text style={styles.instruction}>
          {displayRound <= 2 ? 'Tap the slow, big dot!' : 'Tap the moving dot!'}
        </Text>
        {displayRound <= 3 && (
          <Text style={styles.easyHint}>Warm-up round — take your time</Text>
        )}
      </View>

      <Pressable
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
        onPress={handleGameTap}
      >
        {dotVisible && (
          <Animated.View pointerEvents="none" style={[styles.dot, dotStyle]}>
            <Text style={[styles.dotEmoji, { fontSize: Math.round(roundSettings.dotSize * 0.55) }]}>
              ⚫
            </Text>
          </Animated.View>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Skills: Timing control</Text>
        <Text style={styles.footerSubtext}>
          {displayRound <= 4 ? 'Starts slow, then speeds up!' : 'Tap the moving dot!'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
  },
  easyHint: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 40,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  dotEmoji: {
    fontSize: 30,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default MovingTargetGame;
