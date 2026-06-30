/**
 * Shared left-to-right drag game core for OT Level 4 Session 1.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { BallTransferPlayArea } from '@/components/game/occupational/level4/session1/goalPass/GoalPassVisuals';
import { ColorMatchPlayArea } from '@/components/game/occupational/level4/session1/colorSlide/ColorSlideVisuals';
import { FeedMonsterPlayArea } from '@/components/game/occupational/level4/session1/monsterMunch/MonsterMunchVisuals';
import { RoadCrossingPlayArea } from '@/components/game/occupational/level4/session1/laneCross/LaneCrossVisuals';
import { TimedDragPlayArea } from '@/components/game/occupational/level4/session1/quickDrag/QuickDragVisuals';
import { DragColor, distPx, randomDragColor, useTraceSound } from '@/components/game/occupational/level4/session1/shared/dragUtils';
import { LANE_CROSS_CARS } from '@/components/game/occupational/level4/session1/laneCross/laneCrossTheme';
import { MONSTER_FOOD_ITEMS } from '@/components/game/occupational/level4/session1/monsterMunch/monsterMunchTheme';
import { SESSION4_1_PACING } from '@/components/game/occupational/level4/session1/shared/session1Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_1_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type HorizontalDragMode = 'ballTransfer' | 'feedMonster' | 'roadCrossing' | 'colorMatch' | 'timedDrag';

export type HorizontalDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  draggableEmoji: string;
  targetEmoji: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
  zoneBorder: string;
};

export type HorizontalDragGameConfig = {
  theme: HorizontalDragTheme;
  mode: HorizontalDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsGoal?: string;
  ttsColorWrong?: string;
  ttsTimed?: string;
  ttsTimedMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const HorizontalDragGame: React.FC<
  HorizontalDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag to the right target!',
  ttsMiss = 'Try dragging to the right zone!',
  ttsGoal = 'Great job!',
  ttsColorWrong = 'Colors must match!',
  ttsTimed = 'Drag fast — beat the clock!',
  ttsTimedMiss = 'Too slow — try again!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [successToast, setSuccessToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [foodEmoji, setFoodEmoji] = useState<string>(MONSTER_FOOD_ITEMS[0]);
  const [munchKey, setMunchKey] = useState(0);
  const [carEmoji, setCarEmoji] = useState<string>(LANE_CROSS_CARS[0]);
  const [crossKey, setCrossKey] = useState(0);
  const [splashKey, setSplashKey] = useState(0);
  const [rushKey, setRushKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [dragColor, setDragColor] = useState<DragColor>(randomDragColor());
  const [timeLeftMs, setTimeLeftMs] = useState(P.timedLimitMs);
  const [timerActive, setTimerActive] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const timerActiveRef = useRef(false);
  const dragColorRef = useRef(dragColor);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(72);
  const startY = useRef(200);
  const targetX = useRef(288);
  const targetY = useRef(200);

  const objX = useSharedValue(72);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);
  const objSpin = useSharedValue(0);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);
  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);
  useEffect(() => {
    dragColorRef.current = dragColor;
  }, [dragColor]);

  const objStyle = useAnimatedStyle(() => ({
    left: objX.value - 34,
    top: objY.value - 34,
    transform: [{ scale: objScale.value }, { rotate: `${objSpin.value}deg` }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const ballShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 28,
    top: objY.value + 20,
    opacity: 0.22 + (objScale.value - 1) * 0.15,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.3 }, { scaleY: 0.55 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [objX, objY]);

  const layoutPositions = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    startX.current = w * P.startXPct;
    targetX.current = w * P.targetXPct;
    startY.current = h * P.objectYPct;
    targetY.current = h * (mode === 'feedMonster' ? P.monsterTargetYPct : P.objectYPct);
    objX.value = startX.current;
    objY.value = startY.current;
  }, [mode, objX, objY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setTimerActive(false);
      timerActiveRef.current = false;
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags,
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess]);

  const shakePlayArea = useCallback(() => {
    playShake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-5, { duration: 45 }),
      withTiming(5, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [playShake]);

  const showWarn = useCallback(
    (msg: string, kind?: 'wrongColor' | 'miss' | 'slow') => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      const missLabel =
        mode === 'ballTransfer'
          ? 'Wide shot!'
          : mode === 'feedMonster'
            ? 'Dropped!'
            : mode === 'roadCrossing'
              ? 'Off road!'
              : mode === 'colorMatch'
                ? kind === 'wrongColor'
                  ? 'Wrong color!'
                  : 'Missed the bucket!'
                : mode === 'timedDrag'
                  ? kind === 'slow'
                    ? "Time's up!"
                    : 'Missed the gate!'
                  : 'Try again!';
      setWarnMessage(missLabel);
      setWarnVisible(true);
      if (
        mode === 'ballTransfer' ||
        mode === 'feedMonster' ||
        mode === 'roadCrossing' ||
        mode === 'colorMatch' ||
        mode === 'timedDrag'
      ) {
        shakePlayArea();
      }
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [mode, playWarn, shakePlayArea],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
  }, [objScale, objX, objY]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setTimerActive(false);
    timerActiveRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setIsDragging(false);
    setKickOffVisible(false);
    kickOffOpacity.value = withTiming(0, { duration: 120 });
    bumpScore();
    if (mode === 'ballTransfer' || mode === 'feedMonster' || mode === 'roadCrossing' || mode === 'colorMatch' || mode === 'timedDrag') {
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 700);
      speakTTS(ttsGoal, 0.82).catch(() => {});
      if (mode === 'feedMonster') setMunchKey(Date.now());
      if (mode === 'roadCrossing') setCrossKey(Date.now());
      if (mode === 'colorMatch') setSplashKey(Date.now());
      if (mode === 'timedDrag') setRushKey(Date.now());
    }
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    if (mode === 'timedDrag') {
      setTimerActive(false);
      timerActiveRef.current = false;
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    }
    roundTimerRef.current = setTimeout(
      () => advanceRound(),
      mode === 'ballTransfer' || mode === 'feedMonster' || mode === 'roadCrossing' || mode === 'colorMatch' || mode === 'timedDrag'
        ? 780
        : 650,
    );
  }, [advanceRound, bumpScore, kickOffOpacity, mode, objScale, ttsGoal]);

  const failTimedRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setTimerActive(false);
    timerActiveRef.current = false;
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    showWarn(ttsTimedMiss, 'slow');
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, showWarn, ttsTimedMiss]);

  const startTimedCountdown = useCallback(() => {
    setTimeLeftMs(P.timedLimitMs);
    setTimerActive(true);
    timerActiveRef.current = true;
    if (mode === 'timedDrag') {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 160 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 240 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1100);
    }
    tickTimerRef.current = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - P.timedTickMs;
        if (next <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
          if (roundActiveRef.current && !roundCompleteRef.current) {
            failTimedRound();
          }
          return 0;
        }
        return next;
      });
    }, P.timedTickMs);
  }, [failTimedRound, kickOffOpacity, mode]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    if (mode === 'colorMatch') {
      const c = randomDragColor();
      setDragColor(c);
      dragColorRef.current = c;
    }
    if (mode === 'feedMonster') {
      const food = MONSTER_FOOD_ITEMS[Math.floor(Math.random() * MONSTER_FOOD_ITEMS.length)]!;
      setFoodEmoji(food);
    }
    if (mode === 'roadCrossing') {
      const car = LANE_CROSS_CARS[Math.floor(Math.random() * LANE_CROSS_CARS.length)]!;
      setCarEmoji(car);
    }
    setIsDragging(false);
    const hintByMode =
      mode === 'timedDrag'
        ? 'Launch when the timer starts!'
        : mode === 'ballTransfer'
          ? 'Slide across the pitch!'
          : mode === 'feedMonster'
            ? 'Feed the hungry monster!'
            : mode === 'roadCrossing'
              ? 'Steer to the parking spot!'
              : mode === 'colorMatch'
                ? 'Match the paint color!'
                : 'Drag left to right!';
    setStatusHint(hintByMode);
    if (mode === 'ballTransfer' || mode === 'feedMonster' || mode === 'roadCrossing' || mode === 'colorMatch') {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 280 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    }
    if (mode === 'timedDrag') {
      speakTTS(ttsTimed, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => startTimedCountdown(), 300);
    } else {
      speakTTS(ttsDrag, 0.78).catch(() => {});
    }
  }, [kickOffOpacity, layoutPositions, mode, startTimedCountdown, ttsDrag, ttsTimed]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      setIsDragging(true);
      setKickOffVisible(false);
      kickOffOpacity.value = withTiming(0, { duration: 100 });
      objScale.value = withTiming(
        mode === 'ballTransfer'
          ? 1.22
          : mode === 'feedMonster'
            ? 1.2
            : mode === 'roadCrossing'
              ? 1.18
              : mode === 'colorMatch'
                ? 1.16
                : mode === 'timedDrag'
                  ? 1.2
                  : 1.15,
        { duration: 100 },
      );
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      const half = 34;
      const prevX = objX.value;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
      if (mode === 'ballTransfer') {
        objSpin.value += (objX.value - prevX) * 0.35;
      } else if (mode === 'feedMonster') {
        objSpin.value = Math.sin(objX.value * 0.05) * 10;
      } else if (mode === 'roadCrossing') {
        objSpin.value = (objX.value - prevX) * 0.8;
      } else if (mode === 'colorMatch') {
        objSpin.value = Math.sin(objX.value * 0.04) * 6;
      } else if (mode === 'timedDrag') {
        objSpin.value = (objX.value - prevX) * 1.2;
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      setIsDragging(false);
      objScale.value = withTiming(1, { duration: 100 });
      if (mode === 'ballTransfer' || mode === 'feedMonster' || mode === 'roadCrossing' || mode === 'colorMatch' || mode === 'timedDrag') {
        objSpin.value = withSpring(0, { damping: 14, stiffness: 120 });
      }
      const d = distPx(objX.value, objY.value, targetX.current, targetY.current);
      if (d <= P.matchTolerancePx) {
        completeRound();
        return;
      }
      if (mode === 'colorMatch' && d <= P.matchTolerancePx * 1.4) {
        showWarn(ttsColorWrong, 'wrongColor');
      } else {
        showWarn(ttsMiss, 'miss');
      }
      resetObject();
    });

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const timerPct = (timeLeftMs / P.timedLimitMs) * 100;
  const roundPct = ((round - 1) / P.rounds) * 100;
  const fullnessPct = (score / P.rounds) * 100;
  const isStadium = mode === 'ballTransfer';
  const isMonsterCave = mode === 'feedMonster';
  const isCityDrive = mode === 'roadCrossing';
  const isPaintStudio = mode === 'colorMatch';
  const isSpeedRush = mode === 'timedDrag';
  const isThemedDark = isStadium || isMonsterCave || isCityDrive || isSpeedRush;
  const isThemed = isThemedDark || isPaintStudio;
  const successLabel = isStadium
    ? 'GOAL!'
    : isMonsterCave
      ? 'YUM!'
      : isCityDrive
        ? 'SAFE!'
        : isPaintStudio
          ? 'MATCH!'
          : isSpeedRush
            ? 'FAST!'
            : 'Nice!';
  const roundBannerText = isStadium
    ? '⚽ KICK OFF!'
    : isMonsterCave
      ? '🍎 FEED TIME!'
      : isCityDrive
        ? '🚗 GREEN LIGHT!'
        : isPaintStudio
          ? '🎨 SLIDE!'
          : isSpeedRush
            ? '🚀 LAUNCH!'
            : '';
  const waitLabel = isStadium
    ? 'Stadium warming up…'
    : isMonsterCave
      ? 'Monster is getting hungry…'
      : isCityDrive
        ? 'Traffic clearing…'
        : isPaintStudio
          ? 'Mixing paints…'
          : isSpeedRush
            ? 'Charging up…'
            : 'Get ready…';
  const waitColor = isStadium
    ? '#DCFCE7'
    : isMonsterCave
      ? '#E9D5FF'
      : isCityDrive
        ? '#BAE6FD'
        : isPaintStudio
          ? '#F9A8D4'
          : isSpeedRush
            ? '#FED7AA'
            : T.subtitleColor;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      {isStadium && (
        <View style={styles.stadiumLights} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={`light-${i}`} style={[styles.stadiumLight, { left: `${8 + i * 18}%` }]} />
          ))}
        </View>
      )}
      {isMonsterCave && (
        <View style={styles.caveOrbs} pointerEvents="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={`orb-${i}`}
              style={[
                styles.caveOrb,
                {
                  left: `${5 + i * 16}%`,
                  top: 24 + (i % 3) * 18,
                  opacity: 0.12 + (i % 2) * 0.08,
                },
              ]}
            />
          ))}
        </View>
      )}
      {isCityDrive && (
        <View style={styles.cityGlow} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={`city-${i}`}
              style={[
                styles.cityGlowDot,
                {
                  left: `${10 + i * 18}%`,
                  top: 20 + (i % 2) * 12,
                  opacity: 0.1 + (i % 3) * 0.06,
                },
              ]}
            />
          ))}
        </View>
      )}
      {isPaintStudio && (
        <View style={styles.paintDots} pointerEvents="none">
          {['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map((c, i) => (
            <View
              key={`paint-dot-${i}`}
              style={[
                styles.paintDot,
                {
                  left: `${8 + i * 17}%`,
                  top: 22 + (i % 2) * 14,
                  backgroundColor: c,
                  opacity: 0.18,
                },
              ]}
            />
          ))}
        </View>
      )}
      {isSpeedRush && (
        <View style={styles.speedSparks} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={`spark-${i}`}
              style={[
                styles.speedSpark,
                {
                  left: `${6 + i * 19}%`,
                  top: 18 + (i % 2) * 16,
                  opacity: 0.15 + (i % 3) * 0.08,
                },
              ]}
            />
          ))}
        </View>
      )}
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View
          style={[
            styles.backInner,
            {
              borderColor: T.backBorder,
              backgroundColor: isThemedDark
                ? 'rgba(15,23,42,0.45)'
                : isPaintStudio
                  ? 'rgba(255,255,255,0.82)'
                  : 'rgba(255,255,255,0.75)',
            },
          ]}
        >
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }, isThemedDark && styles.themedTitle]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemedDark
                  ? 'rgba(15,23,42,0.38)'
                  : isPaintStudio
                    ? 'rgba(255,255,255,0.88)'
                    : 'rgba(255,255,255,0.7)',
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemedDark
                  ? 'rgba(251,191,36,0.18)'
                  : isPaintStudio
                    ? 'rgba(251,191,36,0.22)'
                    : 'rgba(251,191,36,0.2)',
              },
            ]}
          >
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {isThemed && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
        {mode === 'timedDrag' && timerActive && (
          <View style={styles.speedTimerRow}>
            <View style={[styles.timerTrack, styles.speedTimerTrack, { borderColor: T.accent }]}>
              <View
                style={[
                  styles.timerFill,
                  {
                    width: `${timerPct}%`,
                    backgroundColor: timerPct > 50 ? T.accent : timerPct > 25 ? '#F97316' : '#EF4444',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.speedTimerSecs,
                { color: timerPct > 25 ? T.accent : '#EF4444' },
              ]}
            >
              {Math.ceil(timeLeftMs / 1000)}s
            </Text>
          </View>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.playArea,
            playShakeStyle,
            {
              borderColor: T.playBorder,
              backgroundColor: T.playBg,
              borderWidth: isThemed ? 2 : 1,
              shadowColor: isThemed ? '#000' : 'transparent',
              shadowOpacity: isThemed ? 0.28 : 0,
              shadowRadius: isThemed ? 16 : 0,
              shadowOffset: isThemed ? { width: 0, height: 6 } : { width: 0, height: 0 },
              elevation: isThemed ? 8 : 0,
            },
          ]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && (
            <Text style={[styles.waitText, { color: waitColor }]}>{waitLabel}</Text>
          )}

          {roundActive && mode === 'ballTransfer' && (
            <BallTransferPlayArea roundActive={roundActive} showGuide={round <= 2} isDragging={isDragging} />
          )}

          {roundActive && mode === 'feedMonster' && (
            <FeedMonsterPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              fullnessPct={fullnessPct}
              munchKey={munchKey}
              plateFood={isDragging ? ' ' : foodEmoji}
            />
          )}

          {roundActive && mode === 'roadCrossing' && (
            <RoadCrossingPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              crossKey={crossKey}
              parkedCars={score}
            />
          )}

          {roundActive && mode === 'colorMatch' && (
            <ColorMatchPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              dragColor={dragColor}
              splashKey={splashKey}
              matchedCount={score}
            />
          )}

          {roundActive && mode === 'timedDrag' && (
            <TimedDragPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              timerActive={timerActive}
              timerPct={timerPct}
              timeLeftMs={timeLeftMs}
              rushKey={rushKey}
              streakCount={score}
            />
          )}

          {roundActive && (
            <>
              {(mode === 'ballTransfer' ||
                mode === 'feedMonster' ||
                mode === 'roadCrossing' ||
                mode === 'colorMatch' ||
                mode === 'timedDrag') && (
                <Animated.View style={[styles.ballShadow, ballShadowStyle]} pointerEvents="none" />
              )}
              <Animated.View
                style={[
                  mode === 'ballTransfer'
                    ? styles.ballDraggable
                    : mode === 'feedMonster'
                      ? styles.foodDraggable
                      : mode === 'roadCrossing'
                        ? styles.carDraggable
                        : mode === 'colorMatch'
                          ? styles.paintBlobDraggable
                          : mode === 'timedDrag'
                            ? styles.boltDraggable
                            : styles.draggable,
                  objStyle,
                ]}
              >
                {mode === 'ballTransfer' ? (
                  <LinearGradient
                    colors={['#FFFFFF', '#E2E8F0', '#CBD5E1']}
                    style={styles.ballGradient}
                  >
                    <Text style={styles.ballEmoji}>{T.draggableEmoji}</Text>
                  </LinearGradient>
                ) : mode === 'feedMonster' ? (
                  <LinearGradient
                    colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
                    style={styles.foodGradient}
                  >
                    <Text style={styles.foodEmoji}>{foodEmoji}</Text>
                  </LinearGradient>
                ) : mode === 'roadCrossing' ? (
                  <LinearGradient
                    colors={['#334155', '#1E293B', '#0F172A']}
                    style={styles.carGradient}
                  >
                    <Text style={styles.carEmoji}>{carEmoji}</Text>
                  </LinearGradient>
                ) : mode === 'colorMatch' ? (
                  <LinearGradient
                    colors={[dragColor.hex, `${dragColor.hex}DD`, `${dragColor.hex}99`]}
                    style={[styles.paintBlobGradient, { borderColor: dragColor.hex }]}
                  >
                    <Text style={styles.paintBlobEmoji}>{dragColor.emoji}</Text>
                  </LinearGradient>
                ) : mode === 'timedDrag' ? (
                  <LinearGradient
                    colors={['#FACC15', '#F97316', '#EA580C']}
                    style={styles.boltGradient}
                  >
                    <Text style={styles.boltEmoji}>{T.draggableEmoji}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.dragEmoji}>{T.draggableEmoji}</Text>
                )}
              </Animated.View>
            </>
          )}

          {kickOffVisible && isThemed && roundBannerText ? (
            <Animated.View
              style={[
                styles.kickOffBanner,
                isMonsterCave && styles.feedBanner,
                isCityDrive && styles.driveBanner,
                isPaintStudio && styles.paintBanner,
                isSpeedRush && styles.rushBanner,
                kickOffStyle,
              ]}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.kickOffText,
                  isMonsterCave && styles.feedBannerText,
                  isCityDrive && styles.driveBannerText,
                  isPaintStudio && styles.paintBannerText,
                  isSpeedRush && styles.rushBannerText,
                ]}
              >
                {roundBannerText}
              </Text>
            </Animated.View>
          ) : null}

          <SparkleBurst
            key={sparkleKey}
            visible={sparkleKey > 0}
            color={T.sparkleColor}
            count={isThemed ? 16 : 10}
            size={isThemed ? 8 : 6}
          />
          <ResultToast text={successLabel} type="ok" show={successToast} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View
          style={[
            styles.warnPill,
            isThemedDark && styles.themedWarnPill,
            isPaintStudio && styles.paintWarnPill,
          ]}
        >
          <Text
            style={[
              styles.warnText,
              isThemedDark && styles.themedWarnText,
              isPaintStudio && styles.paintWarnText,
            ]}
          >
            {warnMessage}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  stadiumTitle: {
    textShadowColor: 'rgba(59,130,246,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 0.3,
  },
  themedTitle: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
    letterSpacing: 0.3,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  stadiumLights: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    pointerEvents: 'none',
  },
  stadiumLight: {
    position: 'absolute',
    top: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(254,243,199,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.15)',
  },
  caveOrbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  caveOrb: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244,114,182,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  cityGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  cityGlowDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,211,238,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
  },
  paintDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  paintDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  speedSparks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  speedSpark: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#F97316',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
  },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  timerTrack: { width: '70%', height: 10, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  speedTimerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '78%', marginBottom: 8 },
  speedTimerTrack: { flex: 1, marginBottom: 0, height: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  speedTimerSecs: { fontSize: 18, fontWeight: '900', minWidth: 36, textAlign: 'right' },
  timerFill: { height: '100%', borderRadius: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  roadPath: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '22%',
    height: '56%',
    borderRadius: 14,
  },
  roadDash: {
    position: 'absolute',
    left: '48%',
    top: '30%',
    width: 2,
    height: '40%',
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  roadLane: {
    position: 'absolute',
    top: '22%',
    width: '24%',
    height: '56%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadLaneLeft: { left: '10%' },
  roadLaneRight: { right: '10%' },
  roadArrow: {
    position: 'absolute',
    left: '46%',
    top: '46%',
    fontSize: 28,
    fontWeight: '900',
    opacity: 0.65,
  },
  zone: {
    position: 'absolute',
    top: '32%',
    width: '22%',
    height: '36%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  leftZone: {},
  rightZone: {},
  zoneLabel: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  zoneEmoji: { fontSize: 36 },
  draggable: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragEmoji: { fontSize: 40 },
  ballDraggable: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  ballEmoji: { fontSize: 42 },
  foodDraggable: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  foodEmoji: { fontSize: 38 },
  carDraggable: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 14,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carGradient: {
    width: 74,
    height: 74,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.45)',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  carEmoji: { fontSize: 40 },
  paintBlobDraggable: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paintBlobGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  paintBlobEmoji: { fontSize: 34 },
  boltDraggable: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(250,204,21,0.65)',
    shadowColor: '#F97316',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  boltEmoji: { fontSize: 40 },
  ballShadow: {
    position: 'absolute',
    width: 56,
    height: 20,
    borderRadius: 28,
    backgroundColor: '#000',
    zIndex: 4,
  },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    backgroundColor: 'rgba(15,23,42,0.78)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252,211,77,0.55)',
    zIndex: 8,
  },
  kickOffText: {
    color: '#FCD34D',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  feedBanner: {
    borderColor: 'rgba(244,114,182,0.55)',
    backgroundColor: 'rgba(46,16,101,0.85)',
  },
  feedBannerText: {
    color: '#F9A8D4',
    fontSize: 20,
  },
  driveBanner: {
    borderColor: 'rgba(34,211,238,0.55)',
    backgroundColor: 'rgba(15,23,42,0.88)',
  },
  driveBannerText: {
    color: '#22D3EE',
    fontSize: 19,
    letterSpacing: 1.2,
  },
  paintBanner: {
    borderColor: 'rgba(236,72,153,0.5)',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  paintBannerText: {
    color: '#BE185D',
    fontSize: 20,
    letterSpacing: 1,
  },
  rushBanner: {
    borderColor: 'rgba(249,115,22,0.6)',
    backgroundColor: 'rgba(28,10,5,0.9)',
  },
  rushBannerText: {
    color: '#FACC15',
    fontSize: 21,
    letterSpacing: 1.5,
    textShadowColor: '#F97316',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  warnText: { fontSize: 15, fontWeight: '800', color: '#B91C1C' },
  themedWarnPill: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.35)',
  },
  themedWarnText: { color: '#FCD34D' },
  paintWarnPill: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.4)',
  },
  paintWarnText: { color: '#BE185D' },
});

export default HorizontalDragGame;
