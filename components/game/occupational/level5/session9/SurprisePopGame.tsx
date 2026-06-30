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
const POP_EMOJIS = ['💥', '🎈', '⭐', '🎉'];

const SurprisePopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [popEmoji, setPopEmoji] = useState('💥');

  const popX = useSharedValue(SCREEN_WIDTH * 0.5);
  const popY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const popOpacity = useSharedValue(0);
  const popScale = useSharedValue(0.5);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popActive, setPopActive] = useState(false);
  const startedRef = useRef(false);

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    try {
      await logGameAndAward({
        type: 'surprise-pop', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['alertness', 'surprise-response', 'vigilance'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  const showPop = useCallback(() => {
    setPopEmoji(POP_EMOJIS[Math.floor(Math.random() * POP_EMOJIS.length)]!);
    popX.value = Math.random() * (screenWidth.current - POP_SIZE) + POP_SIZE / 2;
    popY.value = Math.random() * (screenHeight.current - POP_SIZE - 80) + POP_SIZE / 2 + 40;
    popScale.value = 0.5;
    popOpacity.value = withTiming(1, { duration: 200 });
    popScale.value = withSpring(1, {}, () => { popScale.value = withSpring(1.1); });
    setPopActive(true);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    popTimerRef.current = setTimeout(() => {
      popOpacity.value = withTiming(0, { duration: 200 });
      setPopActive(false);
    }, 1000);
  }, [popX, popY, popOpacity, popScale]);

  const scheduleNextPop = useCallback(() => {
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    popTimerRef.current = setTimeout(showPop, delay);
  }, [showPop]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || !popActive) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    if (Math.hypot(tapX - popX.value, tapY - popY.value) <= TOLERANCE + POP_SIZE / 2) {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
      popOpacity.value = withTiming(0, { duration: 200 });
      setPopActive(false);
      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= TOTAL_ROUNDS) setTimeout(() => endGame(newScore), 800);
        else { setRound((r) => r + 1); scheduleNextPop(); }
        return newScore;
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Alert!', 0.9, 'en-US');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [done, popActive, popX, popY, popOpacity, scheduleNextPop, endGame]);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
  }, []);

  const popStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: popX.value - POP_SIZE / 2,
    top: popY.value - POP_SIZE / 2,
    opacity: popOpacity.value,
    transform: [{ scale: popScale.value }],
  }));

  return (
    <ReactionShell
      theme={SURPRISE_POP_THEME} copy={SURPRISE_POP_COPY}
      showInfo={showInfo} showCongrats done={done} finalStats={finalStats}
      round={round} totalRounds={TOTAL_ROUNDS} score={score}
      hint="Watch for surprise pops!" showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)} onExit={exit} onContinue={onComplete} onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; screenHeight.current = e.nativeEvent.layout.height; }}
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
            scheduleNextPop();
            speakTTS('Watch for surprise pops!', 0.8, 'en-US');
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });
export default SurprisePopGame;
