import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { FlashBurst } from '@/components/game/occupational/level5/session9/VisualReactionVisuals';
import { FLASH_TAP_COPY, FLASH_TAP_THEME } from '@/components/game/occupational/level5/session9/visualReactionThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const TOTAL_ROUNDS = SESSION5_9_PACING.standardRounds;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FLASH_SIZE = 150;
const TOLERANCE = 80;
const FLASH_DURATION = 500;

const FlashTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  const flashX = useSharedValue(SCREEN_WIDTH * 0.5);
  const flashY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(1);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const flashPosRef = useRef({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 });
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const resolvingRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const flashActiveRef = useRef(false);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const finishRoundRef = useRef<((success: boolean) => void) | null>(null);
  const showFlashRef = useRef<(() => void) | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { doneRef.current = done; }, [done]);
  useEffect(() => { flashActiveRef.current = flashActive; }, [flashActive]);

  const clearFlashTimer = useCallback(() => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearFlashTimer();
    setFlashActive(false);
    flashActiveRef.current = false;
    flashOpacity.value = withTiming(0, { duration: 150 });
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    try {
      await logGameAndAward({
        type: 'flash-tap',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['reflex', 'reaction-time', 'visual-response'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error(e);
    }
  }, [clearFlashTimer, flashOpacity, router]);

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const finishRound = useCallback((success: boolean) => {
    if (resolvingRef.current || doneRef.current) return;
    resolvingRef.current = true;
    clearFlashTimer();
    flashOpacity.value = withTiming(0, { duration: 150 });
    setFlashActive(false);
    flashActiveRef.current = false;

    let newScore = scoreRef.current;
    if (success) {
      newScore += 1;
      scoreRef.current = newScore;
      setScore(newScore);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Fast reflex!', 0.9, 'en-US');
    }

    if (roundRef.current >= TOTAL_ROUNDS) {
      setTimeout(() => {
        resolvingRef.current = false;
        endGameRef.current?.(newScore);
      }, success ? 700 : 500);
      return;
    }

    setTimeout(() => {
      resolvingRef.current = false;
      setRound((r) => {
        const next = r + 1;
        roundRef.current = next;
        return next;
      });
    }, success ? 800 : 600);
  }, [clearFlashTimer, flashOpacity]);

  useEffect(() => {
    finishRoundRef.current = finishRound;
  }, [finishRound]);

  const showFlash = useCallback(() => {
    if (doneRef.current || resolvingRef.current) return;

    const w = Math.max(screenWidth.current, FLASH_SIZE + 20);
    const h = Math.max(screenHeight.current, FLASH_SIZE + 100);
    const x = Math.random() * (w - FLASH_SIZE) + FLASH_SIZE / 2;
    const y = Math.random() * (h - FLASH_SIZE - 80) + FLASH_SIZE / 2 + 40;

    flashPosRef.current = { x, y };
    flashX.value = x;
    flashY.value = y;
    flashScale.value = 1;
    flashOpacity.value = withTiming(1, { duration: 100 });
    flashScale.value = withSpring(1.2, {}, () => {
      flashScale.value = withSpring(1);
    });
    setFlashActive(true);
    flashActiveRef.current = true;

    clearFlashTimer();
    flashTimerRef.current = setTimeout(() => {
      finishRoundRef.current?.(false);
    }, FLASH_DURATION + 300);
  }, [clearFlashTimer, flashOpacity, flashScale, flashX, flashY]);

  useEffect(() => {
    showFlashRef.current = showFlash;
  }, [showFlash]);

  useEffect(() => {
    if (!playing || done || showCountdown) return;
    const t = setTimeout(() => showFlashRef.current?.(), 350);
    return () => clearTimeout(t);
  }, [round, playing, done, showCountdown]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (doneRef.current || !flashActiveRef.current) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const { x, y } = flashPosRef.current;
    if (Math.hypot(tapX - x, tapY - y) <= TOLERANCE + FLASH_SIZE / 2) {
      finishRoundRef.current?.(true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    clearFlashTimer();
  }, [clearFlashTimer]);

  const flashStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: flashX.value - FLASH_SIZE / 2,
    top: flashY.value - FLASH_SIZE / 2,
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  return (
    <ReactionShell
      theme={FLASH_TAP_THEME}
      copy={FLASH_TAP_COPY}
      showInfo={showInfo}
      showCongrats
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint="Tap when the light flashes!"
      showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)}
      onExit={exit}
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
        <Animated.View style={flashStyle} pointerEvents="none">
          <FlashBurst size={FLASH_SIZE} color="#FACC15" emoji="💡" />
        </Animated.View>
      </Pressable>
      {showCountdown && (
        <RoundCountdownOverlay
          accent={FLASH_TAP_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            setPlaying(true);
            speakTTS('Tap when light flashes!', 0.8, 'en-US');
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });
export default FlashTapGame;
