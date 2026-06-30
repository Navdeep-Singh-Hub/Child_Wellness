import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { FlashBurst } from '@/components/game/occupational/level5/session9/VisualReactionVisuals';
import { SURPRISE_POP_COPY, SURPRISE_POP_THEME } from '@/components/game/occupational/level5/session9/visualReactionThemes';
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
const POP_SIZE = 100;
const TOLERANCE = 60;
const MIN_DELAY = 1000;
const MAX_DELAY = 4000;
const POP_VISIBLE_MS = 1000;
const POP_EMOJIS = ['💥', '🎈', '⭐', '🎉'];

const SurprisePopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [popEmoji, setPopEmoji] = useState('💥');
  const [popActive, setPopActive] = useState(false);

  const popX = useSharedValue(SCREEN_WIDTH * 0.5);
  const popY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const popOpacity = useSharedValue(0);
  const popScale = useSharedValue(0.5);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const popPosRef = useRef({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 });
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const resolvingRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const popActiveRef = useRef(false);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const finishRoundRef = useRef<((success: boolean) => void) | null>(null);
  const showPopRef = useRef<(() => void) | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { doneRef.current = done; }, [done]);
  useEffect(() => { popActiveRef.current = popActive; }, [popActive]);

  const clearPopTimer = useCallback(() => {
    if (popTimerRef.current) {
      clearTimeout(popTimerRef.current);
      popTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearPopTimer();
    setPopActive(false);
    popActiveRef.current = false;
    popOpacity.value = withTiming(0, { duration: 150 });
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    try {
      await logGameAndAward({
        type: 'surprise-pop',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['alertness', 'surprise-response', 'vigilance'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error(e);
    }
  }, [clearPopTimer, popOpacity, router]);

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const finishRound = useCallback((success: boolean) => {
    if (resolvingRef.current || doneRef.current) return;
    resolvingRef.current = true;
    clearPopTimer();
    popOpacity.value = withTiming(0, { duration: 150 });
    setPopActive(false);
    popActiveRef.current = false;

    let newScore = scoreRef.current;
    if (success) {
      newScore += 1;
      scoreRef.current = newScore;
      setScore(newScore);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Alert!', 0.9, 'en-US');
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
  }, [clearPopTimer, popOpacity]);

  useEffect(() => {
    finishRoundRef.current = finishRound;
  }, [finishRound]);

  const showPop = useCallback(() => {
    if (doneRef.current || resolvingRef.current) return;

    setPopEmoji(POP_EMOJIS[Math.floor(Math.random() * POP_EMOJIS.length)]!);

    const w = Math.max(screenWidth.current, POP_SIZE + 20);
    const h = Math.max(screenHeight.current, POP_SIZE + 100);
    const x = Math.random() * (w - POP_SIZE) + POP_SIZE / 2;
    const y = Math.random() * (h - POP_SIZE - 80) + POP_SIZE / 2 + 40;

    popPosRef.current = { x, y };
    popX.value = x;
    popY.value = y;
    popScale.value = 0.5;
    popOpacity.value = withTiming(1, { duration: 200 });
    popScale.value = withSpring(1, {}, () => {
      popScale.value = withSpring(1.1);
    });
    setPopActive(true);
    popActiveRef.current = true;

    clearPopTimer();
    popTimerRef.current = setTimeout(() => {
      finishRoundRef.current?.(false);
    }, POP_VISIBLE_MS + 200);
  }, [clearPopTimer, popOpacity, popScale, popX, popY]);

  useEffect(() => {
    showPopRef.current = showPop;
  }, [showPop]);

  useEffect(() => {
    if (!playing || done || showCountdown) return;
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    const t = setTimeout(() => showPopRef.current?.(), delay);
    return () => clearTimeout(t);
  }, [round, playing, done, showCountdown]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (doneRef.current || !popActiveRef.current) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const { x, y } = popPosRef.current;
    if (Math.hypot(tapX - x, tapY - y) <= TOLERANCE + POP_SIZE / 2) {
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
    clearPopTimer();
  }, [clearPopTimer]);

  const popStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: popX.value - POP_SIZE / 2,
    top: popY.value - POP_SIZE / 2,
    opacity: popOpacity.value,
    transform: [{ scale: popScale.value }],
  }));

  return (
    <ReactionShell
      theme={SURPRISE_POP_THEME}
      copy={SURPRISE_POP_COPY}
      showInfo={showInfo}
      showCongrats
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint="Watch for surprise pops!"
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
        <Animated.View style={popStyle} pointerEvents="none">
          <FlashBurst size={POP_SIZE} color="#FB923C" emoji={popEmoji} />
        </Animated.View>
      </Pressable>
      {showCountdown && (
        <RoundCountdownOverlay
          accent={SURPRISE_POP_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            setPlaying(true);
            speakTTS('Watch for surprise pops!', 0.8, 'en-US');
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });
export default SurprisePopGame;
