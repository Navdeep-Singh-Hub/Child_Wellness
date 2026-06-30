<<<<<<< HEAD
export { default } from './synesthesiaLab/SynesthesiaLabGame';
=======
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { FlashBurst } from '@/components/game/occupational/level5/session9/VisualReactionVisuals';
import { SOUND_LIGHT_COPY, SOUND_LIGHT_THEME } from '@/components/game/occupational/level5/session9/visualReactionThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const TOTAL_ROUNDS = SESSION5_9_PACING.sensoryRounds;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 100;
const TOLERANCE = 60;
const ROUND_MS = 2000;

const COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444', sound: 'drum' as const },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6', sound: 'bell' as const },
  { name: 'Green', emoji: '🟢', color: '#10B981', sound: 'clap' as const },
] as const;

type ColorOption = (typeof COLORS)[number];

const SoundLightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [targetColor, setTargetColor] = useState<ColorOption | null>(null);
  const [lightColor, setLightColor] = useState<ColorOption | null>(null);

  const lightX = useSharedValue(SCREEN_WIDTH * 0.5);
  const lightY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const lightOpacity = useSharedValue(0);
  const lightScale = useSharedValue(1);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const lightPosRef = useRef({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.5 });
  const targetRef = useRef<ColorOption | null>(null);
  const lightRef = useRef<ColorOption | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const resolvingRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const roundActiveRef = useRef(false);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const finishRoundRef = useRef<((success: boolean) => void) | null>(null);
  const showRoundRef = useRef<(() => void) | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { doneRef.current = done; }, [done]);

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const hideRound = useCallback(() => {
    lightOpacity.value = withTiming(0, { duration: 150 });
    roundActiveRef.current = false;
    targetRef.current = null;
    lightRef.current = null;
    setTargetColor(null);
    setLightColor(null);
  }, [lightOpacity]);

  const endGame = useCallback(async (finalScore: number) => {
    clearRoundTimer();
    hideRound();
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.sensoryXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    try {
      await logGameAndAward({
        type: 'sound-light',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['multi-sensory', 'auditory-visual-integration', 'matching'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error(e);
    }
  }, [clearRoundTimer, hideRound, router]);

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const finishRound = useCallback((success: boolean) => {
    if (resolvingRef.current || doneRef.current) return;
    resolvingRef.current = true;
    clearRoundTimer();
    hideRound();

    let newScore = scoreRef.current;
    if (success) {
      newScore += 1;
      scoreRef.current = newScore;
      setScore(newScore);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Match!', 0.9, 'en-US');
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
  }, [clearRoundTimer, hideRound]);

  useEffect(() => {
    finishRoundRef.current = finishRound;
  }, [finishRound]);

  const showRound = useCallback(() => {
    if (doneRef.current || resolvingRef.current) return;

    const target = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    const lightMatches = Math.random() > 0.3;
    const light = lightMatches ? target : COLORS.find((c) => c.name !== target.name)!;

    targetRef.current = target;
    lightRef.current = light;
    setTargetColor(target);
    setLightColor(light);

    playSound(target.sound, 0.7, 1.0);

    const w = Math.max(screenWidth.current, TARGET_SIZE + 20);
    const h = Math.max(screenHeight.current, TARGET_SIZE + 100);
    const x = Math.random() * (w - TARGET_SIZE) + TARGET_SIZE / 2;
    const y = Math.random() * (h - TARGET_SIZE - 80) + TARGET_SIZE / 2 + 40;

    lightPosRef.current = { x, y };
    lightX.value = x;
    lightY.value = y;
    lightScale.value = 1;
    lightOpacity.value = withTiming(1, { duration: 300 });
    lightScale.value = withSpring(1.2, {}, () => {
      lightScale.value = withSpring(1);
    });
    roundActiveRef.current = true;

    clearRoundTimer();
    roundTimerRef.current = setTimeout(() => {
      finishRoundRef.current?.(false);
    }, ROUND_MS + 200);
  }, [clearRoundTimer, lightOpacity, lightScale, lightX, lightY]);

  useEffect(() => {
    showRoundRef.current = showRound;
  }, [showRound]);

  useEffect(() => {
    if (!playing || done || showCountdown) return;
    const t = setTimeout(() => showRoundRef.current?.(), 350);
    return () => clearTimeout(t);
  }, [round, playing, done, showCountdown]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (doneRef.current || !roundActiveRef.current || !targetRef.current || !lightRef.current) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const { x, y } = lightPosRef.current;
    if (Math.hypot(tapX - x, tapY - y) > TOLERANCE + TARGET_SIZE / 2) return;

    const isMatch = lightRef.current.name === targetRef.current.name;
    if (isMatch) {
      finishRoundRef.current?.(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Sound and light must match!', 0.8, 'en-US');
      finishRoundRef.current?.(false);
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
    clearRoundTimer();
  }, [clearRoundTimer]);

  const lightStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: lightX.value - TARGET_SIZE / 2,
    top: lightY.value - TARGET_SIZE / 2,
    opacity: lightOpacity.value,
    transform: [{ scale: lightScale.value }],
  }));

  return (
    <ReactionShell
      theme={SOUND_LIGHT_THEME}
      copy={SOUND_LIGHT_COPY}
      showInfo={showInfo}
      showCongrats
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint={targetColor ? `Hear ${targetColor.name} — tap if light matches` : 'Match sound and light!'}
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
        {lightColor && (
          <Animated.View style={lightStyle} pointerEvents="none">
            <View style={[styles.lightRing, { borderColor: lightColor.color }]}>
              <FlashBurst size={TARGET_SIZE} color={lightColor.color} emoji={lightColor.emoji} />
            </View>
          </Animated.View>
        )}
      </Pressable>
      {showCountdown && (
        <RoundCountdownOverlay
          accent={SOUND_LIGHT_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            setPlaying(true);
            setTimeout(() => speakTTS('Match sound and light!', 0.8, 'en-US'), 400);
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  lightRing: { borderWidth: 3, borderRadius: TARGET_SIZE / 2 + 6, padding: 3 },
});
export default SoundLightGame;
>>>>>>> parent of d0342ff (Revert "fgh")
