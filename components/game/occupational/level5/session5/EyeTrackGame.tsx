import { EyeTrackShell, useEyeTrackExit } from '@/components/game/occupational/level5/session5/EyeTrackShell';
import { GlowingTrackDot } from '@/components/game/occupational/level5/session5/EyeTrackVisuals';
import type { EyeTrackConfig } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { getEyeTrackTheme } from '@/components/game/occupational/level5/session5/eyeTrackThemes';
import { SESSION5_5_PACING as P } from '@/components/game/occupational/level5/session5/session5Pacing';
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const DOT_SIZE = 44;
const TRACK_DURATION = 4000;
const JUMP_INTERVAL = 1200;
const MULTI_HALF_DURATION = TRACK_DURATION / 2;

const JUMP_POSITIONS = [
  { x: 15, y: 25 },
  { x: 75, y: 20 },
  { x: 80, y: 70 },
  { x: 25, y: 75 },
  { x: 50, y: 15 },
  { x: 50, y: 80 },
  { x: 20, y: 50 },
  { x: 85, y: 50 },
];

function roundWatchMs(mode: EyeTrackConfig['mode']): number {
  if (mode === 'jump') return JUMP_POSITIONS.length * JUMP_INTERVAL;
  if (mode === 'multi') return TRACK_DURATION * 2;
  return TRACK_DURATION * 2;
}

interface EyeTrackGameProps {
  config: EyeTrackConfig;
  onBack?: () => void;
  onComplete?: () => void;
}

const EyeTrackGame: React.FC<EyeTrackGameProps> = ({ config, onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getEyeTrackTheme(config.logType);
  const handleExit = useEyeTrackExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'watching' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const dotX = useSharedValue(50);
  const dotY = useSharedValue(50);
  const dotBX = useSharedValue(50);
  const dotBY = useSharedValue(50);
  const progress = useSharedValue(0);

  const [jumpPos, setJumpPos] = useState(JUMP_POSITIONS[0]);
  const [activeDot, setActiveDot] = useState<0 | 1>(0);
  const jumpIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const beginRoundRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const stopAnimations = useCallback(() => {
    cancelAnimation(dotX);
    cancelAnimation(dotY);
    cancelAnimation(dotBX);
    cancelAnimation(dotBY);
    cancelAnimation(progress);
  }, [dotX, dotY, dotBX, dotBY, progress]);

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
    clearTimers();
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
  }, [clearTimers]);

  const startTracking = useCallback(() => {
    if (config.mode === 'jump') {
      startJumpTracking();
    } else {
      startSmoothTracking();
    }
    setPhase('watching');
    stopTTS();
    const speakTimer = setTimeout(() => {
      speakTTS(config.instruction, 0.8, 'en-US');
    }, 350);
    timersRef.current.push(speakTimer);
  }, [config.mode, config.instruction, startJumpTracking, startSmoothTracking]);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = P.rounds;
      const xp = finalScore * P.xpPerScore;
      const accuracy = (finalScore / total) * 100;

      stopAnimations();
      clearTimers();
      setPhase('idle');

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

      try {
        await logGameAndAward({
          type: config.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: config.skillTags,
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearTimers, config.logType, config.skillTags, router, stopAnimations],
  );

  const beginRound = useCallback(() => {
    clearTimers();
    startTracking();

    const advanceTimer = setTimeout(() => {
      stopAnimations();
      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= P.rounds) {
          endGame(newScore);
        } else {
          setRound((r) => r + 1);
          const nextTimer = setTimeout(() => beginRoundRef.current(), 400);
          timersRef.current.push(nextTimer);
        }
        return newScore;
      });
    }, roundWatchMs(config.mode));

    timersRef.current.push(advanceTimer);
  }, [clearTimers, config.mode, endGame, startTracking, stopAnimations]);

  beginRoundRef.current = beginRound;

  useEffect(() => {
    if (!showInfo && !done && phase === 'watching') {
      return () => clearTimers();
    }
  }, [showInfo, done, phase, clearTimers]);

  useEffect(() => {
    return () => {
      try { stopTTS(); } catch { /* ignore */ }
      cleanupSounds();
      stopAnimations();
      clearTimers();
    };
  }, [stopAnimations, clearTimers]);

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

  const hint = phase === 'countdown' ? 'Get ready…' : config.instruction;

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
      <View style={styles.gameArea}>
        {renderDots()}
        {phase === 'countdown' && (
          <RoundCountdownOverlay
            accent={theme.accent}
            onDone={() => beginRound()}
          />
        )}
      </View>
    </EyeTrackShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  dotWrap: { position: 'absolute', zIndex: 10 },
});

export default EyeTrackGame;
