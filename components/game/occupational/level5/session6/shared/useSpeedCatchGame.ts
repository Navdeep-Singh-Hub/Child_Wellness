/**
 * Shared speed-catch logic — OT Level 5 Session 6 (fast / slow / switch)
 */
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import type { SpeedCatchConfig } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const BALL_SIZE = 64;
const TOLERANCE = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

<<<<<<< HEAD:components/game/occupational/level5/session6/shared/useSpeedCatchGame.ts
export type CatchPhase = 'countdown' | 'playing' | 'idle';

type Options = {
  config: SpeedCatchConfig;
  ttsComplete?: string;
  onBack?: () => void;
};

export function useSpeedCatchGame({ config, ttsComplete, onBack }: Options) {
=======
/** Round 1 = catch during slow; rounds 2+ = catch during fast. */
function roundWantsFast(roundNum: number): boolean {
  return roundNum > 1;
}

const SpeedCatchGame: React.FC<{ config: SpeedCatchConfig; onBack?: () => void; onComplete?: () => void }> = ({
  config,
  onBack,
  onComplete,
}) => {
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session6/SpeedCatchGame.tsx
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<CatchPhase>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [isFast, setIsFast] = useState(false);

  const ballX = useSharedValue(SCREEN_WIDTH * 0.5);
  const ballY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const ballScale = useSharedValue(1);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const scoreRef = useRef(0);
  const resetBallRef = useRef<(() => void) | null>(null);
  const isFastRef = useRef(false);
  const roundRef = useRef(1);
  const directionX = useRef(1);
  const directionY = useRef(1);
  const speedX = useRef(config.speedMin);
  const speedY = useRef(config.speedMin);

  const clearTimers = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
  }, []);

  const resetBall = useCallback(() => {
    ballX.value = withSpring(Math.random() * (screenWidth.current - BALL_SIZE) + BALL_SIZE / 2);
    ballY.value = withSpring(Math.random() * (screenHeight.current - BALL_SIZE - 40) + BALL_SIZE / 2 + 20);
    directionX.current = Math.random() > 0.5 ? 1 : -1;
    directionY.current = Math.random() > 0.5 ? 1 : -1;
    speedX.current = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
    speedY.current = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
  }, [ballX, ballY, config.speedMin, config.speedMax]);

  useEffect(() => {
    resetBallRef.current = resetBall;
  }, [resetBall]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const applySwitchRoundSpeed = useCallback((roundNum: number) => {
    const fast = roundWantsFast(roundNum);
    isFastRef.current = fast;
    setIsFast(fast);
  }, []);

  const speakSwitchRoundCue = useCallback((roundNum: number) => {
    speakTTS(
      roundWantsFast(roundNum) ? 'Catch it on turbo speed!' : 'Catch it on slow speed!',
      0.8,
      'en-US',
    );
  }, []);

  const moveBall = useCallback(() => {
    clearTimers();
    animationRef.current = setInterval(() => {
      const speedMul = config.mode === 'switch' ? (isFastRef.current ? 1.5 : 0.6) : 1;
      const newX = ballX.value + speedX.current * directionX.current * speedMul;
      const newY = ballY.value + speedY.current * directionY.current * speedMul;

      if (newX <= BALL_SIZE / 2 || newX >= screenWidth.current - BALL_SIZE / 2) {
        directionX.current *= -1;
        ballX.value = Math.max(BALL_SIZE / 2, Math.min(screenWidth.current - BALL_SIZE / 2, newX));
      } else {
        ballX.value = newX;
      }

      if (newY <= BALL_SIZE / 2 + 20 || newY >= screenHeight.current - BALL_SIZE / 2 - 20) {
        directionY.current *= -1;
        ballY.value = Math.max(BALL_SIZE / 2 + 20, Math.min(screenHeight.current - BALL_SIZE / 2 - 20, newY));
      } else {
        ballY.value = newY;
      }
    }, 16);

    if (config.mode === 'switch') {
      const scheduleSwitch = () => {
        switchTimerRef.current = setTimeout(() => {
          isFastRef.current = !isFastRef.current;
          setIsFast(isFastRef.current);
          speakTTS(isFastRef.current ? 'Speed up!' : 'Slow down!', 0.8).catch(() => {});
          scheduleSwitch();
        }, 2000);
      };
      scheduleSwitch();
    }
  }, [ballX, ballY, clearTimers, config.mode]);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearTimers();
      const total = P.catchRounds;
      const xp = finalScore * P.catchXp;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      setPhase('idle');
      if (ttsComplete) speakTTS(ttsComplete, 0.78).catch(() => {});

      try {
        await logGameAndAward({
          type: config.logType,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: config.skillTags,
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearTimers, config.logType, config.skillTags, router, ttsComplete],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const onCatchSuccess = useCallback(() => {
    clearTimers();
    ballScale.value = withSpring(1.5, {}, () => {
      ballScale.value = withSpring(1);
    });

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    if (newScore >= P.catchRounds) {
      setTimeout(() => endGameRef.current?.(newScore), 900);
    } else {
      setTimeout(() => {
        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        setRound(nextRound);
        if (config.mode === 'switch') {
          applySwitchRoundSpeed(nextRound);
        }
        resetBallRef.current?.();
        moveBall();
        if (config.mode === 'switch') {
          setTimeout(() => speakSwitchRoundCue(nextRound), 350);
        }
      }, config.mode === 'slow' ? 1200 : 700);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
<<<<<<< HEAD:components/game/occupational/level5/session6/shared/useSpeedCatchGame.ts
    speakTTS(config.ttsSuccess, 0.9).catch(() => {});
  }, [ballScale, clearTimers, config.mode, config.ttsSuccess, moveBall]);
=======
    speakTTS(config.ttsSuccess, 0.9, 'en-US');
  }, [applySwitchRoundSpeed, ballScale, clearTimers, config.mode, config.ttsSuccess, moveBall, speakSwitchRoundCue]);
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session6/SpeedCatchGame.tsx

  const handleGameTap = useCallback(
    (event: GestureResponderEvent) => {
      if (done || phase !== 'playing') return;
      if (!isTapNearTarget(event, ballX.value, ballY.value, BALL_SIZE, TOLERANCE)) return;

      if (config.mode === 'switch') {
        const wantsFast = roundWantsFast(roundRef.current);
        if (isFastRef.current !== wantsFast) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(
            wantsFast ? 'Wait for turbo speed!' : 'Wait for slow speed!',
            0.8,
            'en-US',
          );
          return;
        }
      }

      onCatchSuccess();
    },
    [ballX, ballY, config.mode, done, onCatchSuccess, phase],
  );

  const startPlaying = useCallback(() => {
    setPhase('playing');
    stopTTS();
    if (config.mode === 'switch') {
      applySwitchRoundSpeed(1);
    }
    resetBallRef.current?.();
    moveBall();
<<<<<<< HEAD:components/game/occupational/level5/session6/shared/useSpeedCatchGame.ts
    setTimeout(() => speakTTS(config.ttsStart, 0.8).catch(() => {}), 350);
  }, [config.ttsStart, moveBall]);
=======
    setTimeout(
      () => (config.mode === 'switch' ? speakSwitchRoundCue(1) : speakTTS(config.ttsStart, 0.8, 'en-US')),
      350,
    );
  }, [applySwitchRoundSpeed, config.mode, config.ttsStart, moveBall, speakSwitchRoundCue]);
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session6/SpeedCatchGame.tsx

  const handleStart = useCallback(() => {
    setShowInfo(false);
    setPhase('countdown');
  }, []);

  const handleExit = useCallback(() => {
    stopTTS();
    cleanupSounds();
    clearTimers();
    onBack?.();
  }, [clearTimers, onBack]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        /* ignore */
      }
      cleanupSounds();
      clearTimers();
    };
  }, [clearTimers]);

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - BALL_SIZE / 2,
    top: ballY.value - BALL_SIZE / 2,
    transform: [{ scale: ballScale.value }],
  }));

  const hint =
    config.mode === 'switch'
      ? roundWantsFast(round)
        ? isFast
          ? '⚡ Turbo now — tap!'
          : '⚡ Wait for turbo speed…'
        : isFast
          ? '🐢 Wait for slow speed…'
          : '🐢 Slow now — tap!'
      : config.instruction;

  return {
    showInfo,
    showCongrats,
    done,
    finalStats,
    phase,
    round,
    score,
    hint,
    isFast,
    totalRounds: P.catchRounds,
    ballStyle,
    handleStart,
    handleExit,
    handleGameTap,
    startPlaying,
    onLayout: (w: number, h: number) => {
      screenWidth.current = w;
      screenHeight.current = h;
    },
  };
}
