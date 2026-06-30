<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
/**
 * Shared eye-tracking round logic — OT Level 5 Session 5
 */
=======
import { distPx } from '@/components/game/occupational/level5/session1/followUtils';
import { EyeTrackShell, useEyeTrackExit } from '@/components/game/occupational/level5/session5/EyeTrackShell';
import { GlowingTrackDot } from '@/components/game/occupational/level5/session5/EyeTrackVisuals';
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
import type { EyeTrackConfig } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { SESSION5_5_PACING as P } from '@/components/game/occupational/level5/session5/session5Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
=======
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const DOT_SIZE = 44;
export const TRACK_DURATION = 4000;
export const JUMP_INTERVAL = 1200;
const MULTI_HALF_DURATION = TRACK_DURATION / 2;
const FINGER_SIZE = P.fingerRadius * 2;

export const JUMP_POSITIONS = [
  { x: 15, y: 25 },
  { x: 75, y: 20 },
  { x: 80, y: 70 },
  { x: 25, y: 75 },
  { x: 50, y: 15 },
  { x: 50, y: 80 },
  { x: 20, y: 50 },
  { x: 85, y: 50 },
];

<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
function roundWatchMs(mode: EyeTrackConfig['mode']): number {
  if (mode === 'jump') return JUMP_POSITIONS.length * JUMP_INTERVAL;
  if (mode === 'multi') return TRACK_DURATION * 2;
  return TRACK_DURATION * 2;
}

export type EyeTrackPhase = 'countdown' | 'watching' | 'idle';

type Options = {
=======
interface EyeTrackGameProps {
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
  config: EyeTrackConfig;
  ttsCue?: string;
  ttsComplete?: string;
  onBack?: () => void;
};

export function useEyeTrackGame({ config, ttsCue, ttsComplete, onBack }: Options) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
  const [phase, setPhase] = useState<EyeTrackPhase>('idle');
=======
  const [phase, setPhase] = useState<'countdown' | 'following' | 'idle'>('idle');
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [followProgress, setFollowProgress] = useState(0);
  const [roundActive, setRoundActive] = useState(false);

  const dotX = useSharedValue(50);
  const dotY = useSharedValue(50);
  const dotBX = useSharedValue(50);
  const dotBY = useSharedValue(50);
  const progress = useSharedValue(0);
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);

  const [jumpPos, setJumpPos] = useState(JUMP_POSITIONS[0]!);
  const [activeDot, setActiveDot] = useState<0 | 1>(0);
  const jumpIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beginRoundRef = useRef<() => void>(() => {});
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const scoreRef = useRef(0);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const followingRef = useRef(false);
  const followStartRef = useRef<number | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current);
      checkTimerRef.current = null;
    }
  }, []);

  const stopAnimations = useCallback(() => {
    cancelAnimation(dotX);
    cancelAnimation(dotY);
    cancelAnimation(dotBX);
    cancelAnimation(dotBY);
    cancelAnimation(progress);
  }, [dotX, dotY, dotBX, dotBY, progress]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const getDotPositionPx = useCallback((): { x: number; y: number } => {
    const w = playW.current;
    const h = playH.current;

    if (config.mode === 'jump') {
      return { x: (jumpPos.x / 100) * w, y: (jumpPos.y / 100) * h };
    }

    if (config.mode === 'circular') {
      const angle = progress.value * 2 * Math.PI;
      const radius = 35;
      return {
        x: ((50 + radius * Math.cos(angle)) / 100) * w,
        y: ((50 + radius * Math.sin(angle)) / 100) * h,
      };
    }

    if (config.mode === 'multi') {
      if (activeDot === 0) {
        return { x: (dotX.value / 100) * w, y: (dotY.value / 100) * h };
      }
      return { x: (dotBX.value / 100) * w, y: (dotBY.value / 100) * h };
    }

    if (config.mode === 'horizontal') {
      return { x: (dotX.value / 100) * w, y: (dotY.value / 100) * h };
    }

    return { x: (dotX.value / 100) * w, y: (dotY.value / 100) * h };
  }, [activeDot, config.mode, dotBX, dotBY, dotX, dotY, jumpPos, progress]);

  const startSmoothTracking = useCallback(() => {
    stopAnimations();
    progress.value = 0;

    if (config.mode === 'horizontal') {
      dotY.value = 50;
      dotX.value = 10;
      dotX.value = withRepeat(withTiming(90, { duration: TRACK_DURATION / 2 }), -1, true);
      return;
    }

    if (config.mode === 'vertical') {
      dotX.value = 50;
      dotY.value = 15;
      dotY.value = withRepeat(withTiming(85, { duration: TRACK_DURATION / 2 }), -1, true);
      return;
    }

    if (config.mode === 'circular') {
      dotX.value = 85;
      dotY.value = 50;
      progress.value = withRepeat(withTiming(1, { duration: TRACK_DURATION }), -1, false);
      return;
    }

    if (config.mode === 'multi') {
      setActiveDot(0);
      dotY.value = 50;
      dotBY.value = 50;
      dotX.value = 10;
      dotBX.value = 50;
      dotX.value = withRepeat(withTiming(90, { duration: MULTI_HALF_DURATION }), -1, true);
      dotBY.value = 15;
      const switchTimer = setTimeout(() => {
        cancelAnimation(dotX);
        setActiveDot(1);
        dotBY.value = withRepeat(withTiming(85, { duration: MULTI_HALF_DURATION }), -1, true);
      }, MULTI_HALF_DURATION);
      timersRef.current.push(switchTimer);
    }
  }, [config.mode, dotX, dotY, dotBX, dotBY, progress, stopAnimations]);

  const startJumpTracking = useCallback(() => {
    jumpIndexRef.current = 0;
    setJumpPos(JUMP_POSITIONS[0]!);

    const scheduleJump = () => {
      const timer = setTimeout(() => {
        jumpIndexRef.current = (jumpIndexRef.current + 1) % JUMP_POSITIONS.length;
        setJumpPos(JUMP_POSITIONS[jumpIndexRef.current]!);
        scheduleJump();
      }, JUMP_INTERVAL);
      timersRef.current.push(timer);
    };
    scheduleJump();
  }, []);

  const startTracking = useCallback(() => {
    if (config.mode === 'jump') {
      startJumpTracking();
    } else {
      startSmoothTracking();
    }
<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
    setPhase('watching');
    stopTTS();
    const speakTimer = setTimeout(() => {
      speakTTS(config.instruction, 0.8).catch(() => {});
    }, 350);
    timersRef.current.push(speakTimer);
  }, [config.mode, config.instruction, startJumpTracking, startSmoothTracking]);
=======
  }, [config.mode, startJumpTracking, startSmoothTracking]);
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = P.rounds;
      const xp = finalScore * P.xpPerScore;

      stopAnimations();
      clearTimers();
      setPhase('idle');
      setRoundActive(false);
      roundActiveRef.current = false;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

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
    [clearTimers, config.logType, config.skillTags, router, stopAnimations, ttsComplete],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || done) return;
    roundCompleteRef.current = true;
    clearTimers();
    stopAnimations();
    setRoundActive(false);
    roundActiveRef.current = false;

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Great following!', 0.85, 'en-US');

    if (newScore >= P.rounds) {
      const finishTimer = setTimeout(() => endGameRef.current?.(newScore), 700);
      timersRef.current.push(finishTimer);
    } else {
      const nextTimer = setTimeout(() => {
        setRound((r) => r + 1);
        beginRoundRef.current();
      }, P.nextRoundDelayMs);
      timersRef.current.push(nextTimer);
    }
  }, [clearTimers, done, stopAnimations]);

  const checkFollow = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || done) return;

    const target = getDotPositionPx();
    const distance = distPx(fingerX.value, fingerY.value, target.x, target.y);

    if (distance <= P.followDistancePx) {
      if (!followingRef.current) {
        followingRef.current = true;
        followStartRef.current = Date.now();
      } else {
        const elapsed = Date.now() - (followStartRef.current ?? Date.now());
        setFollowProgress(Math.min(100, Math.round((elapsed / P.followHoldMs) * 100)));
        if (elapsed >= P.followHoldMs) {
          completeRound();
        }
      }
    } else {
      followingRef.current = false;
      followStartRef.current = null;
      setFollowProgress(0);
    }
  }, [completeRound, done, fingerX, fingerY, getDotPositionPx]);

  const beginRound = useCallback(() => {
    clearTimers();
    stopAnimations();
    roundCompleteRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setRoundActive(true);
    roundActiveRef.current = true;
    setPhase('following');

    const w = playW.current;
    const h = playH.current;
    fingerX.value = w * 0.5;
    fingerY.value = h * 0.72;

    startTracking();
    stopTTS();
    const speakTimer = setTimeout(() => speakTTS(config.instruction, 0.8, 'en-US'), 350);
    timersRef.current.push(speakTimer);

    checkTimerRef.current = setInterval(checkFollow, P.followCheckMs);
  }, [checkFollow, clearTimers, config.instruction, fingerX, fingerY, startTracking, stopAnimations]);

  beginRoundRef.current = beginRound;

<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
  const handleStart = useCallback(() => {
    setShowInfo(false);
    setPhase('countdown');
    if (ttsCue) {
      setTimeout(() => speakTTS(ttsCue, 0.8).catch(() => {}), 500);
    }
  }, [ttsCue]);

  const handleExit = useCallback(() => {
    stopTTS();
    cleanupSounds();
    clearTimers();
    stopAnimations();
    onBack?.();
  }, [clearTimers, onBack, stopAnimations]);

=======
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        /* ignore */
      }
      cleanupSounds();
      stopAnimations();
      clearTimers();
    };
  }, [stopAnimations, clearTimers]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || done) return;
      fingerX.value = Math.max(P.fingerRadius, Math.min(playW.current - P.fingerRadius, e.x));
      fingerY.value = Math.max(P.fingerRadius, Math.min(playH.current - P.fingerRadius, e.y));
    });

  const smoothDotStyle = useAnimatedStyle(() => {
    if (config.mode === 'circular') {
      const angle = progress.value * 2 * Math.PI;
      const radius = 35;
      return {
        left: `${50 + radius * Math.cos(angle)}%`,
        top: `${50 + radius * Math.sin(angle)}%`,
        transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }],
      };
    }

    return {
      left: `${dotX.value}%`,
      top: `${dotY.value}%`,
      transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }],
    };
  });

  const multiDotAStyle = useAnimatedStyle(() => ({
    left: `${dotX.value}%`,
    top: `${dotY.value}%`,
    transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }],
  }));

  const multiDotBStyle = useAnimatedStyle(() => ({
    left: `${dotBX.value}%`,
    top: `${dotBY.value}%`,
    transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }],
  }));

<<<<<<< HEAD:components/game/occupational/level5/session5/shared/useEyeTrackGame.ts
  const hint = phase === 'countdown' ? 'Get ready…' : config.instruction;

  return {
    showInfo,
    showCongrats,
    done,
    finalStats,
    phase,
    round,
    score,
    hint,
    jumpPos,
    activeDot,
    totalRounds: P.rounds,
    handleStart,
    handleExit,
    beginRound,
    smoothDotStyle,
    multiDotAStyle,
    multiDotBStyle,
  };
}
=======
  const fingerStyle = useAnimatedStyle(() => ({
    left: fingerX.value - P.fingerRadius,
    top: fingerY.value - P.fingerRadius,
  }));

  const renderDots = () => {
    if (config.mode === 'jump') {
      return (
        <View
          style={[
            styles.dotWrap,
            {
              left: `${jumpPos.x}%`,
              top: `${jumpPos.y}%`,
              transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }],
            },
          ]}
          pointerEvents="none"
        >
          <GlowingTrackDot size={DOT_SIZE} color={theme.accent} />
        </View>
      );
    }

    if (config.mode === 'multi') {
      return (
        <>
          <Animated.View style={[styles.dotWrap, multiDotAStyle, { opacity: activeDot === 0 ? 1 : 0.3 }]} pointerEvents="none">
            <GlowingTrackDot size={DOT_SIZE} color="#38BDF8" pulse={activeDot === 0} />
          </Animated.View>
          <Animated.View style={[styles.dotWrap, multiDotBStyle, { opacity: activeDot === 1 ? 1 : 0.3 }]} pointerEvents="none">
            <GlowingTrackDot size={DOT_SIZE} color="#F97316" secondary pulse={activeDot === 1} />
          </Animated.View>
        </>
      );
    }

    return (
      <Animated.View style={[styles.dotWrap, smoothDotStyle]} pointerEvents="none">
        <GlowingTrackDot size={DOT_SIZE} color={theme.accent} />
      </Animated.View>
    );
  };

  const handleStart = () => {
    setShowInfo(false);
    setPhase('countdown');
  };

  const hint =
    phase === 'countdown'
      ? 'Get ready…'
      : followProgress > 0
        ? `👆 Keep your finger on the dot… ${followProgress}%`
        : config.instruction;

  return (
    <EyeTrackShell
      theme={theme}
      copy={copy}
      mode={config.mode}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.rounds}
      score={score}
      hint={hint}
      showHint={!showInfo && !done}
      onStart={handleStart}
      onExit={() => {
        clearTimers();
        stopAnimations();
        handleExit();
      }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <GestureDetector gesture={panGesture}>
        <View
          style={styles.gameArea}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          {phase === 'following' && renderDots()}
          {phase === 'following' && (
            <Animated.View
              pointerEvents="none"
              style={[styles.fingerDot, { borderColor: theme.accent, backgroundColor: `${theme.accent}55` }, fingerStyle]}
            />
          )}
          {phase === 'following' && followProgress > 0 && (
            <View style={[styles.progressTrack, { borderColor: theme.hudBorder }]} pointerEvents="none">
              <View style={[styles.progressFill, { width: `${followProgress}%`, backgroundColor: theme.accent }]} />
            </View>
          )}
          {phase === 'countdown' && (
            <RoundCountdownOverlay accent={theme.accent} onDone={() => beginRound()} />
          )}
        </View>
      </GestureDetector>
    </EyeTrackShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  dotWrap: { position: 'absolute', zIndex: 10 },
  fingerDot: {
    position: 'absolute',
    width: FINGER_SIZE,
    height: FINGER_SIZE,
    borderRadius: P.fingerRadius,
    borderWidth: 3,
    zIndex: 20,
  },
  progressTrack: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 15,
  },
  progressFill: { height: '100%', borderRadius: 5 },
});

export default EyeTrackGame;
>>>>>>> parent of d0342ff (Revert "fgh"):components/game/occupational/level5/session5/EyeTrackGame.tsx
