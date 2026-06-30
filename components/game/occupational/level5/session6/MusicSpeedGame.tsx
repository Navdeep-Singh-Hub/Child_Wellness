<<<<<<< HEAD
/** OT Level 5 · Session 6 · Game 5 — Beat Blitz */
export { default } from '@/components/game/occupational/level5/session6/beatBlitz/BeatBlitzGame';
=======
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { BigCountdown, GlowingTarget } from '@/components/game/occupational/level5/session6/SpeedMatchVisuals';
import { SpeedMatchShell, useSpeedMatchExit } from '@/components/game/occupational/level5/session6/SpeedMatchShell';
import { getSpeedMatchTheme } from '@/components/game/occupational/level5/session6/speedMatchThemes';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 76;
const TOLERANCE = 50;
const RESPONSE_SECONDS = 3;
const LOG_TYPE = 'music-speed';

const MusicSpeedGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getSpeedMatchTheme(LOG_TYPE);
  const handleExit = useSpeedMatchExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 });
  const [timeLeft, setTimeLeft] = useState(RESPONSE_SECONDS);
  const [awaitingTap, setAwaitingTap] = useState(false);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const responseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const scoreRef = useRef(0);
  const roundActiveRef = useRef(false);
  const startRoundRef = useRef<(() => void) | null>(null);

  const clearTimers = useCallback(() => {
    if (responseTimerRef.current) {
      clearInterval(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearTimers();
      roundActiveRef.current = false;
      setAwaitingTap(false);
      setTargetVisible(false);
      const total = P.timedRounds;
      const xp = finalScore * P.timedXp;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

      try {
        await logGameAndAward({
          type: LOG_TYPE,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: ['auditory-visual-sync', 'rhythm', 'timing'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearTimers, router],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const handleRoundMiss = useCallback(() => {
    if (!roundActiveRef.current || done) return;

    clearTimers();
    roundActiveRef.current = false;
    setAwaitingTap(false);
    setTargetVisible(false);
    setTimeLeft(0);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS('Too slow! Try again!', 0.85, 'en-US');

    retryTimerRef.current = setTimeout(() => {
      startRoundRef.current?.();
    }, 1100);
  }, [clearTimers, done]);

  const startRound = useCallback(() => {
    if (done) return;

    clearTimers();
    stopTTS();
    roundActiveRef.current = true;
    setAwaitingTap(true);
    setTimeLeft(RESPONSE_SECONDS);

    const x = Math.random() * (screenWidth.current - TARGET_SIZE) + TARGET_SIZE / 2;
    const y = Math.random() * (screenHeight.current - TARGET_SIZE - 40) + TARGET_SIZE / 2 + 20;
    setTargetPos({ x, y });
    setTargetVisible(true);

    void playSound('drum', 0.65, 1.0).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    let remaining = RESPONSE_SECONDS;
    responseTimerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleRoundMiss();
      }
    }, 1000);
  }, [clearTimers, done, handleRoundMiss]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  const onHitSuccess = useCallback(() => {
    if (!roundActiveRef.current || done) return;

    clearTimers();
    roundActiveRef.current = false;
    setAwaitingTap(false);
    setTargetVisible(false);

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('On beat!', 0.9, 'en-US');

    if (newScore >= P.timedRounds) {
      retryTimerRef.current = setTimeout(() => endGameRef.current?.(newScore), 900);
    } else {
      retryTimerRef.current = setTimeout(() => {
        setRound((r) => r + 1);
        startRoundRef.current?.();
      }, 900);
    }
  }, [clearTimers, done]);

  const handleTap = useCallback(
    (event: GestureResponderEvent) => {
      if (done || !awaitingTap || !targetVisible) return;
      if (isTapNearTarget(event, targetPos.x, targetPos.y, TARGET_SIZE, TOLERANCE)) {
        onHitSuccess();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [awaitingTap, done, onHitSuccess, targetPos.x, targetPos.y, targetVisible],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      setTimeout(() => speakTTS('Listen for the beat, then tap fast!', 0.8, 'en-US'), 400);
      startRoundRef.current?.();
    }
  }, [showInfo, done]);

  useEffect(
    () => () => {
      try {
        stopTTS();
      } catch {
        /* ignore */
      }
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const hint = awaitingTap
    ? timeLeft > 0
      ? `🎵 Tap the note within ${timeLeft}s!`
      : '🎵 Tap the note!'
    : 'Get ready for the beat…';

  return (
    <SpeedMatchShell
      theme={theme}
      copy={copy}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.timedRounds}
      score={score}
      hint={hint}
      showHint
      onStart={() => setShowInfo(false)}
      onExit={() => {
        clearTimers();
        handleExit();
      }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
        onPress={handleTap}
      >
        {awaitingTap && timeLeft > 0 && (
          <View style={styles.timerWrap} pointerEvents="none">
            <BigCountdown value={timeLeft} accent={theme.accent} />
          </View>
        )}
        {targetVisible && (
          <View
            style={[styles.targetWrap, { left: targetPos.x - TARGET_SIZE / 2, top: targetPos.y - TARGET_SIZE / 2 }]}
            pointerEvents="none"
          >
            <GlowingTarget size={TARGET_SIZE} color={theme.accentDark} emoji="🎵" urgent />
          </View>
        )}
        {awaitingTap && (
          <View style={styles.beatBanner} pointerEvents="none">
            <Text style={[styles.beatBannerText, { color: theme.cue }]}>BEAT!</Text>
          </View>
        )}
      </Pressable>
    </SpeedMatchShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  timerWrap: { position: 'absolute', top: 24, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 8 },
  targetWrap: { position: 'absolute', zIndex: 10 },
  beatBanner: { position: 'absolute', bottom: 28, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 },
  beatBannerText: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
});

export default MusicSpeedGame;
>>>>>>> parent of d0342ff (Revert "fgh")
