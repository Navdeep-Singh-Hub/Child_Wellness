import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { GlowingTarget } from '@/components/game/occupational/level5/session6/SpeedMatchVisuals';
import { SpeedMatchShell, useSpeedMatchExit } from '@/components/game/occupational/level5/session6/SpeedMatchShell';
import { getSpeedMatchTheme } from '@/components/game/occupational/level5/session6/speedMatchThemes';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 76;
const TOLERANCE = 50;
const BEAT_INTERVAL = 1000;
const LOG_TYPE = 'music-speed';

function BeatPulse({ accent }: { accent: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 0.4 + (scale.value - 1) * 2 }));
  return <Animated.View style={[styles.beatRing, { borderColor: accent }, style]} />;
}

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
  const [beatCount, setBeatCount] = useState(0);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatCountRef = useRef(0);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);

  const clearTimers = useCallback(() => {
    if (beatTimerRef.current) {
      clearInterval(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
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

  const showTarget = useCallback(() => {
    const x = Math.random() * (screenWidth.current - TARGET_SIZE) + TARGET_SIZE / 2;
    const y = Math.random() * (screenHeight.current - TARGET_SIZE - 40) + TARGET_SIZE / 2 + 20;
    setTargetPos({ x, y });
    setTargetVisible(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setTargetVisible(false), 800);
  }, []);

  const startBeat = useCallback(() => {
    clearTimers();
    beatCountRef.current = 0;
    setBeatCount(0);
    setTargetVisible(false);

    const playBeat = () => {
      void playSound('drum', 0.6, 1.0).catch(() => {});
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      beatCountRef.current += 1;
      setBeatCount(beatCountRef.current);
      if (beatCountRef.current % 3 === 0) {
        showTarget();
      }
    };

    playBeat();
    beatTimerRef.current = setInterval(playBeat, BEAT_INTERVAL);
  }, [clearTimers, showTarget]);

  const onHitSuccess = useCallback(() => {
    setTargetVisible(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setScore((s) => {
      const newScore = s + 1;
      if (newScore >= P.timedRounds) {
        clearTimers();
        setTimeout(() => endGameRef.current?.(newScore), 900);
      } else {
        setTimeout(() => setRound((r) => r + 1), 1200);
      }
      return newScore;
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('On beat!', 0.9, 'en-US');
  }, [clearTimers]);

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
      stopTTS();
      startBeat();
      const speakTimer = setTimeout(() => speakTTS('Tap on the beat!', 0.8, 'en-US'), 500);
      return () => clearTimeout(speakTimer);
    }
  }, [showInfo, round, done, startBeat]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearTimers();
  }, [clearTimers]);

  const hint = targetVisible ? '🎵 Tap the note on beat!' : `Beat ${((beatCount % 3) || 3)}/3…`;

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
        <View style={styles.beatCenter} pointerEvents="none">
          <BeatPulse accent={theme.accent} />
        </View>
        {targetVisible && (
          <View
            style={[styles.targetWrap, { left: targetPos.x - TARGET_SIZE / 2, top: targetPos.y - TARGET_SIZE / 2 }]}
            pointerEvents="none"
          >
            <GlowingTarget size={TARGET_SIZE} color={theme.accentDark} emoji="🎵" urgent />
          </View>
        )}
      </Pressable>
    </SpeedMatchShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  beatCenter: { position: 'absolute', alignSelf: 'center', top: '42%', zIndex: 2 },
  beatRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  targetWrap: { position: 'absolute', zIndex: 10 },
});

export default MusicSpeedGame;
