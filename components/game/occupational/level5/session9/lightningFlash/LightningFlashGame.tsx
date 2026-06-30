import { LightningFlashBackdrop } from '@/components/game/occupational/level5/session9/lightningFlash/LightningFlashVisuals';
import { LIGHTNING_FLASH_COPY, LIGHTNING_FLASH_THEME } from '@/components/game/occupational/level5/session9/lightningFlash/lightningFlashTheme';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { FlashBurst } from '@/components/game/occupational/level5/session9/shared/ReactionFX';
import { ReactionCountdown } from '@/components/game/occupational/level5/session9/shared/ReactionUI';
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
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const flashX = useSharedValue(SCREEN_WIDTH * 0.5);
  const flashY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(1);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const startedRef = useRef(false);

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    try {
      await logGameAndAward({
        type: 'flash-tap', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['reflex', 'reaction-time', 'visual-response'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  const showFlash = useCallback(() => {
    flashX.value = Math.random() * (screenWidth.current - FLASH_SIZE) + FLASH_SIZE / 2;
    flashY.value = Math.random() * (screenHeight.current - FLASH_SIZE - 80) + FLASH_SIZE / 2 + 40;
    flashOpacity.value = withTiming(1, { duration: 100 });
    flashScale.value = withSpring(1.2, {}, () => { flashScale.value = withSpring(1); });
    setFlashActive(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      flashOpacity.value = withTiming(0, { duration: 200 });
      setFlashActive(false);
    }, FLASH_DURATION);
  }, [flashX, flashY, flashOpacity, flashScale]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || !flashActive) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const distance = Math.hypot(tapX - flashX.value, tapY - flashY.value);
    if (distance <= TOLERANCE + FLASH_SIZE / 2) {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashOpacity.value = withTiming(0, { duration: 200 });
      setFlashActive(false);
      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= TOTAL_ROUNDS) setTimeout(() => endGame(newScore), 800);
        else setTimeout(() => { setRound((r) => r + 1); setTimeout(showFlash, 900); }, 1200);
        return newScore;
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Fast reflex!', 0.9, 'en-US');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [done, flashActive, flashX, flashY, flashOpacity, showFlash, endGame]);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: flashX.value - FLASH_SIZE / 2,
    top: flashY.value - FLASH_SIZE / 2,
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  return (
    <ReactionShell
      theme={LIGHTNING_FLASH_THEME} copy={LIGHTNING_FLASH_COPY} backdrop={<LightningFlashBackdrop />}
      showInfo={showInfo} showCongrats done={done} finalStats={finalStats}
      round={round} totalRounds={TOTAL_ROUNDS} score={score}
      hint="Tap when the light flashes!" showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)} onExit={exit} onContinue={onComplete} onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; screenHeight.current = e.nativeEvent.layout.height; }}
        onPress={handleTap}
      >
        <Animated.View style={flashStyle} pointerEvents="none">
          <FlashBurst size={FLASH_SIZE} color="#FACC15" emoji="💡" />
        </Animated.View>
      </Pressable>
      {showCountdown && (
        <ReactionCountdown
          accent={LIGHTNING_FLASH_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            showFlash();
            speakTTS('Tap when light flashes!', 0.8, 'en-US');
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });
export default FlashTapGame;
