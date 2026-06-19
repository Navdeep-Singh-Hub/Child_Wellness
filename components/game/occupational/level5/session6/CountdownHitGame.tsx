import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { BigCountdown, GlowingTarget } from '@/components/game/occupational/level5/session6/SpeedMatchVisuals';
import { SpeedMatchShell, useSpeedMatchExit } from '@/components/game/occupational/level5/session6/SpeedMatchShell';
import { getSpeedMatchTheme } from '@/components/game/occupational/level5/session6/speedMatchThemes';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 72;
const TOLERANCE = 50;
const LOG_TYPE = 'countdown-hit';

const CountdownHitGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getSpeedMatchTheme(LOG_TYPE);
  const handleExit = useSpeedMatchExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 });

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);

  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearTimers();
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
          skillTags: ['anticipation', 'timing', 'countdown-response'],
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

  const revealTarget = useCallback(() => {
    const x = Math.random() * (screenWidth.current - TARGET_SIZE) + TARGET_SIZE / 2;
    const y = Math.random() * (screenHeight.current - TARGET_SIZE - 40) + TARGET_SIZE / 2 + 20;
    setTargetPos({ x, y });
    setTargetVisible(true);
    speakTTS('Tap now!', 0.9, 'en-US');
  }, []);

  const startRound = useCallback(() => {
    clearTimers();
    stopTTS();
    setCountdown(3);
    setTargetVisible(false);

    let currentCount = 3;
    speakTTS('3', 0.9, 'en-US');

    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);

      if (currentCount > 0) {
        speakTTS(currentCount.toString(), 0.9, 'en-US');
        return;
      }

      clearTimers();
      setCountdown(0);
      revealTarget();
    }, 1000);
  }, [clearTimers, revealTarget]);

  const onHitSuccess = useCallback(() => {
    setTargetVisible(false);

    setScore((s) => {
      const newScore = s + 1;
      if (newScore >= P.timedRounds) {
        setTimeout(() => endGameRef.current?.(newScore), 900);
      } else {
        setTimeout(() => setRound((r) => r + 1), 1200);
      }
      return newScore;
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Perfect timing!', 0.9, 'en-US');
  }, []);

  const handleTap = useCallback(
    (event: GestureResponderEvent) => {
      if (done || !targetVisible) return;
      if (isTapNearTarget(event, targetPos.x, targetPos.y, TARGET_SIZE, TOLERANCE)) {
        onHitSuccess();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [done, onHitSuccess, targetPos.x, targetPos.y, targetVisible],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      startRound();
    }
  }, [showInfo, round, done, startRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearTimers();
  }, [clearTimers]);

  const hint = targetVisible ? '🎯 TAP NOW!' : countdown > 0 ? `Wait… ${countdown}` : 'Get ready…';

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
        {!targetVisible && countdown > 0 && (
          <View style={styles.cdCenter} pointerEvents="none">
            <BigCountdown value={countdown} accent={theme.accent} />
          </View>
        )}
        {targetVisible && (
          <View
            style={[styles.targetWrap, { left: targetPos.x - TARGET_SIZE / 2, top: targetPos.y - TARGET_SIZE / 2 }]}
            pointerEvents="none"
          >
            <GlowingTarget size={TARGET_SIZE} color={theme.accent} emoji="🎯" urgent />
          </View>
        )}
        {targetVisible && (
          <View style={styles.strikeBanner} pointerEvents="none">
            <Text style={[styles.strikeText, { color: theme.cue }]}>STRIKE!</Text>
          </View>
        )}
      </Pressable>
    </SpeedMatchShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  cdCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  targetWrap: { position: 'absolute', zIndex: 10 },
  strikeBanner: { position: 'absolute', top: 16, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' },
  strikeText: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
});

export default CountdownHitGame;
