/**
 * Shared alternating left/right tap core for OT Level 4 Session 5.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { SwitchTapPlayArea } from '@/components/game/occupational/level4/session5/SwitchTapPlayArea';
import { HandWalkPlayArea } from '@/components/game/occupational/level4/session5/HandWalkPlayArea';
import { FlashPickPlayArea } from '@/components/game/occupational/level4/session5/FlashPickPlayArea';
import { RhythmSwitchPlayArea } from '@/components/game/occupational/level4/session5/RhythmSwitchPlayArea';
import { SpeedSwitchPlayArea } from '@/components/game/occupational/level4/session5/SpeedSwitchPlayArea';
import { Hand, otherHand, useTraceSound } from '@/components/game/occupational/level4/session5/alternateUtils';
import { SESSION4_5_PACING } from '@/components/game/occupational/level4/session5/session5Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_5_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type AlternateTapMode = 'sequence' | 'walking' | 'beat' | 'flash' | 'speed';
export type AlternateTargetStyle = 'circle' | 'drum' | 'panel';

export type AlternateTapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
  leftEmoji: string;
  rightEmoji: string;
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
  targetStyle: AlternateTargetStyle;
};

export type AlternateTapGameConfig = {
  theme: AlternateTapTheme;
  mode: AlternateTapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsWrong?: string;
  ttsTooSlow?: string;
  ttsWatch?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const stepsForMode = (mode: AlternateTapMode) => {
  switch (mode) {
    case 'sequence':
      return P.sequenceSteps;
    case 'walking':
      return P.walkingSteps;
    case 'beat':
      return P.beatSteps;
    case 'speed':
      return P.speedSteps;
    case 'flash':
      return 1;
    default:
      return P.sequenceSteps;
  }
};

const speedInterval = (step: number, total: number) => {
  const progress = total <= 1 ? 0 : step / (total - 1);
  return P.speedInitialMs - (P.speedInitialMs - P.speedFinalMs) * progress;
};

export const AlternateTapGame: React.FC<
  AlternateTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Alternate left and right!',
  ttsSuccess = 'Perfect!',
  ttsWrong = 'Use the other hand!',
  ttsTooSlow = 'Too slow!',
  ttsWatch = 'Watch for the flash…',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const stepsPerRound = stepsForMode(mode);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [stepDisplay, setStepDisplay] = useState(1);
  const [flashTimeLeft, setFlashTimeLeft] = useState(P.flashDurationMs);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [switchKey, setSwitchKey] = useState(0);
  const [walkKey, setWalkKey] = useState(0);
  const [pickKey, setPickKey] = useState(0);
  const [beatKey, setBeatKey] = useState(0);
  const [speedKey, setSpeedKey] = useState(0);
  const [flashedSide, setFlashedSide] = useState<Hand | null>(null);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [activeHand, setActiveHand] = useState<Hand>('left');

  const isSwitchTap = mode === 'sequence';
  const isHandWalk = mode === 'walking';
  const isFlashPick = mode === 'flash';
  const isRhythmSwitch = mode === 'beat';
  const isSpeedSwitch = mode === 'speed';

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const stepRef = useRef(0);
  const expectedRef = useRef<Hand>('left');
  const waitingRef = useRef(false);
  const flashedSideRef = useRef<Hand | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftY = useSharedValue(0);
  const rightY = useSharedValue(0);
  const leftFlash = useSharedValue(0);
  const rightFlash = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);
  const playShake = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: leftY.value }, { scale: leftScale.value }],
    opacity: mode === 'flash' ? 0.35 + leftFlash.value * 0.65 : 1,
    backgroundColor:
      mode === 'flash' && !isFlashPick && leftFlash.value > 0.4
        ? '#F59E0B'
        : isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch
          ? 'transparent'
          : T.leftColor,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rightY.value }, { scale: rightScale.value }],
    opacity: mode === 'flash' ? 0.35 + rightFlash.value * 0.65 : 1,
    backgroundColor:
      mode === 'flash' && !isFlashPick && rightFlash.value > 0.4
        ? '#F59E0B'
        : isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch
          ? 'transparent'
          : T.rightColor,
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
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
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(leftScale);
    cancelAnimation(rightScale);
    cancelAnimation(leftY);
    cancelAnimation(rightY);
    cancelAnimation(kickOffOpacity);
    cancelAnimation(playShake);
  }, [kickOffOpacity, leftScale, leftY, playShake, rightScale, rightY]);

  const pulseHand = useCallback(
    (hand: Hand) => {
      const scale = hand === 'left' ? leftScale : rightScale;
      scale.value = withSequence(withSpring(1.18), withSpring(1));
    },
    [leftScale, rightScale],
  );

  const bounceHand = useCallback(
    (hand: Hand) => {
      const y = hand === 'left' ? leftY : rightY;
      const scale = hand === 'left' ? leftScale : rightScale;
      y.value = withSequence(withSpring(-28), withSpring(0));
      scale.value = withSequence(withSpring(1.15), withSpring(1));
    },
    [leftScale, leftY, rightScale, rightY],
  );

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
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
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const showWrong = useCallback(
    (msg?: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg ?? ttsWrong, 0.78).catch(() => {});
      if (isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) {
        setWarnMessage(msg ?? ttsWrong);
        setWarnVisible(true);
        playShake.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
        toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
      }
    },
    [isFlashPick, isHandWalk, isRhythmSwitch, isSpeedSwitch, isSwitchTap, playShake, playWarn, ttsWrong],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    waitingRef.current = false;
    clearTimers();
    bumpScore();
    if (isSwitchTap) {
      setSuccessToast(true);
      setSwitchKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isHandWalk) {
      setSuccessToast(true);
      setWalkKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isFlashPick) {
      setSuccessToast(true);
      setPickKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isRhythmSwitch) {
      setSuccessToast(true);
      setBeatKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isSpeedSwitch) {
      setSuccessToast(true);
      setSpeedKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers, isFlashPick, isHandWalk, isRhythmSwitch, isSpeedSwitch, isSwitchTap]);

  const resetStepState = useCallback(() => {
    stepRef.current = 0;
    expectedRef.current = 'left';
    waitingRef.current = false;
    flashedSideRef.current = null;
    setStepDisplay(1);
    setActiveHand('left');
    setFlashedSide(null);
    if (isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) {
      setSuccessToast(false);
      setWarnVisible(false);
    }
    leftFlash.value = 0;
    rightFlash.value = 0;
    leftY.value = 0;
    rightY.value = 0;
    leftScale.value = withSpring(1);
    rightScale.value = withSpring(1);
  }, [isFlashPick, isHandWalk, isRhythmSwitch, isSpeedSwitch, isSwitchTap, leftFlash, leftScale, leftY, rightFlash, rightScale, rightY]);

  const scheduleSpeedTap = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    waitingRef.current = true;
    const hand = expectedRef.current;
    setActiveHand(hand);
    const pct = stepRef.current / Math.max(1, stepsPerRound - 1);
    const label = pct < 0.34 ? 'SLOW' : pct < 0.67 ? 'MEDIUM' : 'FAST';
    setStatusHint(
      isSpeedSwitch
        ? `⚡ ${label} — tap ${hand.toUpperCase()}!`
        : `Tap ${hand.toUpperCase()}!`,
    );
    pulseHand(hand);
    speakTTS(`Tap ${hand}!`, 0.78).catch(() => {});
    const limit = speedInterval(stepRef.current, stepsPerRound) * 1.4;
    roundTimerRef.current = setTimeout(() => {
      if (waitingRef.current && roundActiveRef.current && !roundCompleteRef.current) {
        showWrong(isSpeedSwitch ? 'Too slow — speed up!' : 'Too slow! Speed up!');
        scheduleSpeedTap();
      }
    }, limit);
  }, [isSpeedSwitch, pulseHand, showWrong, stepsPerRound]);

  const triggerFlash = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    const side: Hand = Math.random() < 0.5 ? 'left' : 'right';
    flashedSideRef.current = side;
    setFlashedSide(side);
    waitingRef.current = true;
    setFlashTimeLeft(P.flashDurationMs);
    setStatusHint(isFlashPick ? `⚡ ${side.toUpperCase()} flashed — tap it!` : `Flash ${side.toUpperCase()} — tap it!`);
    if (side === 'left') {
      leftFlash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 1200 }));
    } else {
      rightFlash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 1200 }));
    }
    speakTTS(`Flash ${side}! Use your ${side} hand!`, 0.78).catch(() => {});
    if (isFlashPick) {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 300 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1000);
    }
    tickTimerRef.current = setInterval(() => {
      setFlashTimeLeft((prev) => {
        const next = prev - P.flashTickMs;
        if (next <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
          if (waitingRef.current && roundActiveRef.current) {
            waitingRef.current = false;
            flashedSideRef.current = null;
            setFlashedSide(null);
            leftFlash.value = withTiming(0);
            rightFlash.value = withTiming(0);
            showWrong(isFlashPick ? ttsTooSlow : 'Too slow!');
            roundTimerRef.current = setTimeout(() => triggerFlash(), P.flashRetryDelayMs);
          }
          return 0;
        }
        return next;
      });
    }, P.flashTickMs);
  }, [isFlashPick, kickOffOpacity, leftFlash, rightFlash, showWrong, ttsTooSlow]);

  const triggerBeat = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    waitingRef.current = true;
    const hand = expectedRef.current;
    setActiveHand(hand);
    setStatusHint(
      isRhythmSwitch
        ? `🥁 Beat ${stepRef.current + 1}/${stepsPerRound} — ${hand.toUpperCase()} drum!`
        : `Beat ${stepRef.current + 1}/${stepsPerRound} — tap ${hand.toUpperCase()}!`,
    );
    pulseHand(hand);
    speakTTS(`Tap the ${hand} drum!`, 0.78).catch(() => {});
  }, [isRhythmSwitch, pulseHand, stepsPerRound]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetStepState();
    if (mode === 'flash') {
      setStatusHint(isFlashPick ? 'Eyes on both panels…' : 'Watch for the flash…');
      if (isFlashPick) {
        speakTTS(ttsWatch, 0.78).catch(() => {});
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1200);
      }
      roundTimerRef.current = setTimeout(() => triggerFlash(), isFlashPick ? 800 : 500);
    } else if (mode === 'beat') {
      setStatusHint(isRhythmSwitch ? 'Feel the groove — alternate drums!' : 'Follow the beat!');
      if (isRhythmSwitch) {
        speakTTS(ttsCue, 0.78).catch(() => {});
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      roundTimerRef.current = setTimeout(() => triggerBeat(), P.beatCueDelayMs);
    } else if (mode === 'speed') {
      setStatusHint(isSpeedSwitch ? 'Turbo lane — start slow, then blast!' : 'Start slow — speed up!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isSpeedSwitch) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      roundTimerRef.current = setTimeout(() => scheduleSpeedTap(), 350);
    } else if (mode === 'walking') {
      setStatusHint(isHandWalk ? 'Step LEFT — walk the trail!' : 'Walk your hands!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isHandWalk) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      pulseHand('left');
    } else {
      setStatusHint(isSwitchTap ? 'Start LEFT — then switch!' : 'Alternate left and right!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isSwitchTap) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      pulseHand('left');
    }
  }, [isFlashPick, isHandWalk, isRhythmSwitch, isSpeedSwitch, isSwitchTap, kickOffOpacity, mode, resetStepState, scheduleSpeedTap, triggerBeat, triggerFlash, ttsCue, ttsWatch, pulseHand]);

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

  const handleCorrectTap = useCallback(
    (hand: Hand) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

      if (mode === 'flash') {
        if (!waitingRef.current || flashedSideRef.current !== hand) {
          showWrong(hand === 'left' ? 'Use your right hand!' : 'Use your left hand!');
          return;
        }
        clearTimers();
        waitingRef.current = false;
        flashedSideRef.current = null;
        setFlashedSide(null);
        leftFlash.value = withTiming(0);
        rightFlash.value = withTiming(0);
        if (hand === 'left') leftScale.value = withSequence(withSpring(1.2), withSpring(1));
        else rightScale.value = withSequence(withSpring(1.2), withSpring(1));
        completeRound();
        return;
      }

      if (mode === 'beat' && !waitingRef.current) return;
      if (expectedRef.current !== hand) {
        showWrong();
        if (hand === 'left') leftScale.value = withSequence(withSpring(0.85), withSpring(1));
        else rightScale.value = withSequence(withSpring(0.85), withSpring(1));
        return;
      }

      if (mode === 'walking') bounceHand(hand);
      else if (hand === 'left') leftScale.value = withSequence(withSpring(1.15), withSpring(1));
      else rightScale.value = withSequence(withSpring(1.15), withSpring(1));

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      if (mode === 'beat') waitingRef.current = false;
      if (mode === 'speed') {
        clearTimers();
        waitingRef.current = false;
      }

      stepRef.current += 1;
      setStepDisplay(stepRef.current + 1);

      if (stepRef.current >= stepsPerRound) {
        completeRound();
        return;
      }

      expectedRef.current = otherHand(hand);
      setActiveHand(expectedRef.current);

      if (mode === 'beat') {
        roundTimerRef.current = setTimeout(() => triggerBeat(), P.beatCueDelayMs);
      } else if (mode === 'speed') {
        roundTimerRef.current = setTimeout(() => scheduleSpeedTap(), P.speedStepGapMs);
      } else {
        setStatusHint(`Tap ${expectedRef.current.toUpperCase()}!`);
        pulseHand(expectedRef.current);
      }
    },
    [
      bounceHand,
      completeRound,
      leftFlash,
      leftScale,
      mode,
      pulseHand,
      rightFlash,
      rightScale,
      scheduleSpeedTap,
      showWrong,
      stepsPerRound,
      triggerBeat,
      clearTimers,
    ],
  );

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

  const targetShape =
    T.targetStyle === 'drum'
      ? styles.drumTarget
      : T.targetStyle === 'panel'
        ? styles.panelTarget
        : styles.circleTarget;

  const speedPct = mode === 'speed' ? (stepDisplay - 1) / Math.max(1, stepsPerRound - 1) : 0;
  const speedLabel = speedPct < 0.34 ? 'SLOW' : speedPct < 0.67 ? 'MEDIUM' : 'FAST';
  const roundPct = (round / P.rounds) * 100;
  const showGuide = (isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) && round <= 2;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
        {mode !== 'flash' && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Step {Math.min(stepDisplay, stepsPerRound)}/{stepsPerRound}
            {mode === 'speed' ? ` · ${speedLabel}` : ''}
          </Text>
        )}
        {mode === 'flash' && roundActive && flashTimeLeft > 0 && flashTimeLeft < P.flashDurationMs && (
          <Text style={[styles.stepText, { color: T.accent }]}>
            {(flashTimeLeft / 1000).toFixed(1)}s
          </Text>
        )}
        {(isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) && (
          <View style={[styles.roundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isSwitchTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoHand}>👈</Text>
            <Text style={[styles.decoSwitch, { color: T.accent }]}>↔</Text>
            <Text style={styles.decoHand}>👉</Text>
          </View>
        )}
        {isHandWalk && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoWalk}>🚶</Text>
            <Text style={[styles.decoSwitch, { color: T.accent }]}>👣</Text>
            <Text style={styles.decoWalk}>🚶</Text>
          </View>
        )}
        {isFlashPick && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoBolt}>⚡</Text>
            <Text style={[styles.decoSwitch, { color: T.accent }]}>🎯</Text>
            <Text style={styles.decoBolt}>⚡</Text>
          </View>
        )}
        {isRhythmSwitch && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoNote}>🎵</Text>
            <Text style={[styles.decoSwitch, { color: T.accent }]}>🥁</Text>
            <Text style={styles.decoNote}>🎵</Text>
          </View>
        )}
        {isSpeedSwitch && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoBolt}>🐢</Text>
            <Text style={[styles.decoSwitch, { color: T.accent }]}>⚡</Text>
            <Text style={styles.decoBolt}>🚀</Text>
          </View>
        )}
      </View>

      <Animated.View style={[styles.playAreaWrap, (isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) && playShakeStyle]}>
      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {isSwitchTap && (
          <SwitchTapPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            activeHand={activeHand}
            stepDisplay={stepDisplay}
            stepsTotal={stepsPerRound}
            switchKey={switchKey}
          />
        )}

        {isHandWalk && (
          <HandWalkPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            activeHand={activeHand}
            stepDisplay={stepDisplay}
            stepsTotal={stepsPerRound}
            walkKey={walkKey}
          />
        )}

        {isFlashPick && (
          <FlashPickPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            flashedSide={flashedSide}
            flashTimeLeft={flashTimeLeft}
            flashDurationMs={P.flashDurationMs}
            pickKey={pickKey}
          />
        )}

        {isRhythmSwitch && (
          <RhythmSwitchPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            activeHand={activeHand}
            stepDisplay={stepDisplay}
            stepsTotal={stepsPerRound}
            beatKey={beatKey}
          />
        )}

        {isSpeedSwitch && (
          <SpeedSwitchPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            activeHand={activeHand}
            stepDisplay={stepDisplay}
            stepsTotal={stepsPerRound}
            speedKey={speedKey}
            speedLabel={speedLabel}
            speedPct={speedPct}
          />
        )}

        {roundActive && mode === 'walking' && !isHandWalk && <View style={styles.pathLine} />}

        {roundActive && (
          <View style={[styles.targetsRow, mode === 'flash' && styles.panelRow, isHandWalk && styles.walkRow, isFlashPick && styles.pickRow, isRhythmSwitch && styles.rhythmRow, isSpeedSwitch && styles.speedRow]}>
            <TouchableOpacity onPress={() => handleCorrectTap('left')} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View
                style={[
                  targetShape,
                  leftStyle,
                  isSwitchTap && styles.switchTarget,
                  isSwitchTap && { borderColor: T.leftColor },
                  isSwitchTap && activeHand === 'left' && styles.switchTargetActive,
                  isHandWalk && styles.walkTarget,
                  isHandWalk && { borderColor: T.leftColor },
                  isHandWalk && activeHand === 'left' && styles.walkTargetActive,
                  isFlashPick && styles.pickPanel,
                  isFlashPick && { borderColor: T.leftColor },
                  isFlashPick && flashedSide === 'left' && styles.pickPanelFlash,
                  isRhythmSwitch && styles.rhythmTarget,
                  isRhythmSwitch && { borderColor: T.leftColor },
                  isRhythmSwitch && activeHand === 'left' && styles.rhythmTargetActive,
                  isSpeedSwitch && styles.speedTarget,
                  isSpeedSwitch && { borderColor: T.leftColor },
                  isSpeedSwitch && activeHand === 'left' && styles.speedTargetActive,
                ]}
              >
                {isSwitchTap ? (
                  <LinearGradient colors={['#3B82F6', '#2563EB', '#1D4ED8']} style={styles.switchTargetGradient}>
                    <Text style={styles.targetEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.targetLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isHandWalk ? (
                  <LinearGradient colors={['#4ADE80', '#22C55E', '#16A34A']} style={styles.walkTargetGradient}>
                    <Text style={styles.walkEmoji}>👣</Text>
                    <Text style={styles.walkLabel}>STEP</Text>
                  </LinearGradient>
                ) : isFlashPick ? (
                  <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={styles.pickPanelGradient}>
                    <Text style={styles.pickPanelEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.pickPanelLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isRhythmSwitch ? (
                  <LinearGradient colors={['#EA580C', '#F97316', '#FB923C']} style={styles.rhythmTargetGradient}>
                    <Text style={styles.targetEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.rhythmLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isSpeedSwitch ? (
                  <LinearGradient colors={['#2563EB', '#3B82F6', '#60A5FA']} style={styles.speedTargetGradient}>
                    <Text style={styles.speedEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.speedTargetLabel}>LEFT</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={[styles.targetEmoji, mode === 'flash' && styles.panelEmoji]}>{T.leftEmoji}</Text>
                    <Text style={styles.targetLabel}>LEFT</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleCorrectTap('right')} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View
                style={[
                  targetShape,
                  rightStyle,
                  isSwitchTap && styles.switchTarget,
                  isSwitchTap && { borderColor: T.rightColor },
                  isSwitchTap && activeHand === 'right' && styles.switchTargetActive,
                  isHandWalk && styles.walkTarget,
                  isHandWalk && { borderColor: T.rightColor },
                  isHandWalk && activeHand === 'right' && styles.walkTargetActive,
                  isFlashPick && styles.pickPanel,
                  isFlashPick && { borderColor: T.rightColor },
                  isFlashPick && flashedSide === 'right' && styles.pickPanelFlash,
                  isRhythmSwitch && styles.rhythmTarget,
                  isRhythmSwitch && { borderColor: T.rightColor },
                  isRhythmSwitch && activeHand === 'right' && styles.rhythmTargetActive,
                  isSpeedSwitch && styles.speedTarget,
                  isSpeedSwitch && { borderColor: T.rightColor },
                  isSpeedSwitch && activeHand === 'right' && styles.speedTargetActive,
                ]}
              >
                {isSwitchTap ? (
                  <LinearGradient colors={['#FB7185', '#F43F5E', '#E11D48']} style={styles.switchTargetGradient}>
                    <Text style={styles.targetEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.targetLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isHandWalk ? (
                  <LinearGradient colors={['#FDE047', '#FACC15', '#EAB308']} style={styles.walkTargetGradient}>
                    <Text style={styles.walkEmoji}>👣</Text>
                    <Text style={styles.walkLabel}>STEP</Text>
                  </LinearGradient>
                ) : isFlashPick ? (
                  <LinearGradient colors={['#7F1D1D', '#EF4444', '#F87171']} style={styles.pickPanelGradient}>
                    <Text style={styles.pickPanelEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.pickPanelLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isRhythmSwitch ? (
                  <LinearGradient colors={['#B91C1C', '#DC2626', '#EF4444']} style={styles.rhythmTargetGradient}>
                    <Text style={styles.targetEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.rhythmLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isSpeedSwitch ? (
                  <LinearGradient colors={['#7C3AED', '#8B5CF6', '#A78BFA']} style={styles.speedTargetGradient}>
                    <Text style={styles.speedEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.speedTargetLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={[styles.targetEmoji, mode === 'flash' && styles.panelEmoji]}>{T.rightEmoji}</Text>
                    <Text style={styles.targetLabel}>RIGHT</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {kickOffVisible && isSwitchTap ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>👆 SWITCH TAP!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isHandWalk ? (
          <Animated.View style={[styles.kickOffBanner, styles.walkKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.walkKickOffText]}>🚶 HAND WALK!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isFlashPick && flashedSide ? (
          <Animated.View style={[styles.kickOffBanner, styles.pickKickOffGo, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.pickKickOffGoText]}>⚡ TAP NOW!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isFlashPick && !flashedSide ? (
          <Animated.View style={[styles.kickOffBanner, styles.pickKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.pickKickOffText]}>👀 WATCH!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isRhythmSwitch ? (
          <Animated.View style={[styles.kickOffBanner, styles.rhythmKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.rhythmKickOffText]}>🥁 RHYTHM!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isSpeedSwitch ? (
          <Animated.View style={[styles.kickOffBanner, styles.speedKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.speedKickOffText]}>⚡ SPEED SWITCH!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst
          key={sparkleKey}
          visible={sparkleKey > 0}
          color={T.sparkleColor}
          count={isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch ? 16 : 10}
          size={isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch ? 8 : 6}
        />
        {isSwitchTap && <ResultToast text="SWITCH!" type="ok" show={successToast} />}
        {isHandWalk && <ResultToast text="STEP!" type="ok" show={successToast} />}
        {isFlashPick && <ResultToast text="PICK!" type="ok" show={successToast} />}
        {isRhythmSwitch && <ResultToast text="BEAT!" type="ok" show={successToast} />}
        {isSpeedSwitch && <ResultToast text="ZOOM!" type="ok" show={successToast} />}
      </View>
      </Animated.View>

      {warnVisible && (isSwitchTap || isHandWalk || isFlashPick || isRhythmSwitch || isSpeedSwitch) && (
        <View style={[
          styles.switchWarnPill,
          isHandWalk && styles.walkWarnPill,
          isFlashPick && styles.pickWarnPill,
          isRhythmSwitch && styles.rhythmWarnPill,
          isSpeedSwitch && styles.speedWarnPill,
        ]}>
          <Text style={[
            styles.switchWarnText,
            isHandWalk && styles.walkWarnText,
            isFlashPick && styles.pickWarnText,
            isRhythmSwitch && styles.rhythmWarnText,
            isSpeedSwitch && styles.speedWarnText,
          ]}>{warnMessage}</Text>
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: { width: '70%', height: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden', marginBottom: 6, backgroundColor: 'rgba(15,23,42,0.45)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  decoHand: { fontSize: 16 },
  decoWalk: { fontSize: 16 },
  decoBolt: { fontSize: 16, color: '#FDE68A' },
  decoNote: { fontSize: 16 },
  decoSwitch: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  pathLine: {
    position: 'absolute',
    alignSelf: 'center',
    width: '76%',
    height: 4,
    backgroundColor: 'rgba(148,163,184,0.5)',
    borderRadius: 2,
    top: '52%',
  },
  targetsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  walkRow: { zIndex: 2 },
  pickRow: { zIndex: 2, gap: 8 },
  rhythmRow: { zIndex: 2 },
  speedRow: { zIndex: 2 },
  panelRow: { paddingHorizontal: 8, gap: 10 },
  targetWrap: { alignItems: 'center' },
  circleTarget: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumTarget: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTarget: {
    width: 148,
    height: 220,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 44, marginBottom: 4 },
  panelEmoji: { fontSize: 64, marginBottom: 8 },
  targetLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
  switchTarget: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  switchTargetActive: {
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 12,
  },
  switchTargetGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 58,
  },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 2,
    borderColor: '#818CF8',
    zIndex: 3,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#818CF8', letterSpacing: 1 },
  switchWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  switchWarnText: { fontSize: 14, fontWeight: '800', color: '#C7D2FE', textAlign: 'center' },
  walkKickOff: {
    backgroundColor: 'rgba(20,83,45,0.92)',
    borderColor: '#4ADE80',
  },
  walkKickOffText: { color: '#4ADE80' },
  walkTarget: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  walkTargetActive: {
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 12,
  },
  walkTargetGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 58,
  },
  walkEmoji: { fontSize: 38, marginBottom: 2 },
  walkLabel: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  walkWarnPill: {
    backgroundColor: 'rgba(20,83,45,0.92)',
    borderColor: '#4ADE80',
  },
  walkWarnText: { color: '#BBF7D0' },
  pickKickOff: {
    backgroundColor: 'rgba(26,10,10,0.92)',
    borderColor: '#64748B',
  },
  pickKickOffText: { color: '#94A3B8', fontSize: 20 },
  pickKickOffGo: {
    backgroundColor: 'rgba(26,10,10,0.92)',
    borderColor: '#FBBF24',
  },
  pickKickOffGoText: { color: '#FBBF24' },
  pickPanel: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  pickPanelFlash: {
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 14,
  },
  pickPanelGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  pickPanelEmoji: { fontSize: 56, marginBottom: 8 },
  pickPanelLabel: { fontSize: 12, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  pickWarnPill: {
    backgroundColor: 'rgba(26,10,10,0.92)',
    borderColor: '#FBBF24',
  },
  pickWarnText: { color: '#FEF3C7' },
  rhythmKickOff: {
    backgroundColor: 'rgba(28,20,16,0.92)',
    borderColor: '#F59E0B',
  },
  rhythmKickOffText: { color: '#FBBF24' },
  rhythmTarget: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  rhythmTargetActive: {
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 14,
  },
  rhythmTargetGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 64,
  },
  rhythmLabel: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  rhythmWarnPill: {
    backgroundColor: 'rgba(28,20,16,0.92)',
    borderColor: '#F59E0B',
  },
  rhythmWarnText: { color: '#FEF3C7' },
  speedKickOff: {
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderColor: '#8B5CF6',
  },
  speedKickOffText: { color: '#C4B5FD' },
  speedTarget: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  speedTargetActive: {
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 14,
  },
  speedTargetGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 58,
  },
  speedEmoji: { fontSize: 40, marginBottom: 2 },
  speedTargetLabel: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  speedWarnPill: {
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderColor: '#8B5CF6',
  },
  speedWarnText: { color: '#DDD6FE' },
});

export default AlternateTapGame;
