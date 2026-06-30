/**
 * Shared hand-based midline pass core for OT Level 4 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { BeatPassPlayArea } from '@/components/game/occupational/level4/session6/beatPass/BeatPassVisuals';
import { HandSwapPlayArea } from '@/components/game/occupational/level4/session6/handSwap/HandSwapVisuals';
import { TossGrabPlayArea } from '@/components/game/occupational/level4/session6/tossGrab/TossGrabVisuals';
import { useTraceSound } from '@/components/game/occupational/level4/session6/shared/midlineUtils';
import { SESSION4_6_PACING } from '@/components/game/occupational/level4/session6/shared/session6Pacing';
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

const P = SESSION4_6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type MidlinePassMode = 'handPass' | 'throwCatch' | 'rhythmPass';
type BallState = 'left' | 'right' | 'moving' | 'throwing' | 'catching';

export type MidlinePassTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  ballEmoji: string;
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
  leftColor?: string;
  rightColor?: string;
};

export type MidlinePassGameConfig = {
  theme: MidlinePassTheme;
  mode: MidlinePassMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsWrong?: string;
  ttsMiss?: string;
  ttsMissBeat?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const MidlinePassGame: React.FC<
  MidlinePassGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Pass the ball across your body!',
  ttsSuccess = 'Perfect pass!',
  ttsWrong = 'Use the hand with the ball!',
  ttsMiss = 'Missed! Try again!',
  ttsMissBeat = 'Missed the beat! Try again!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const passesNeeded = mode === 'rhythmPass' ? P.rhythmPassesPerRound : P.handPassesPerRound;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [passCount, setPassCount] = useState(0);
  const [ballSide, setBallSide] = useState<'left' | 'right'>('left');
  const [ballState, setBallState] = useState<BallState>('left');
  const [activeHand, setActiveHand] = useState<'left' | 'right' | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [swapKey, setSwapKey] = useState(0);
  const [tossKey, setTossKey] = useState(0);
  const [beatKey, setBeatKey] = useState(0);

  const isHandSwap = mode === 'handPass';
  const isTossGrab = mode === 'throwCatch';
  const isBeatPass = mode === 'rhythmPass';
  const isThemedPass = isHandSwap || isTossGrab || isBeatPass;

  const rhythmHint = useCallback(
    (side: 'left' | 'right', passNum: number) => {
      if (isBeatPass) {
        return `🎵 TAP ${side.toUpperCase()} on beat! (${passNum}/${passesNeeded})`;
      }
      const hand = side === 'left' ? 'BLUE (left)' : 'RED (right)';
      return `🎵 TAP ${hand} hand! (${passNum}/${passesNeeded})`;
    },
    [isBeatPass, passesNeeded],
  );

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const ballStateRef = useRef<BallState>('left');
  const passCountRef = useRef(0);
  const canInteractRef = useRef(true);
  const waitingBeatRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const ballX = useSharedValue(90);
  const ballY = useSharedValue(200);
  const ballScale = useSharedValue(1);
  const ballRot = useSharedValue(0);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const beatPulse = useSharedValue(0);
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

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - 28,
    top: ballY.value - 28,
    transform: [{ scale: ballScale.value }, { rotate: `${ballRot.value}deg` }],
  }));

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));
  const beatStyle = useAnimatedStyle(() => ({
    opacity: beatPulse.value,
    transform: [{ scale: 0.85 + beatPulse.value * 0.15 }],
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
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(ballX);
    cancelAnimation(ballY);
    cancelAnimation(ballRot);
    cancelAnimation(kickOffOpacity);
    cancelAnimation(playShake);
  }, [ballRot, ballX, ballY, kickOffOpacity, playShake]);

  const layoutBall = useCallback(
    (side: 'left' | 'right') => {
      const w = playW.current;
      const h = playH.current;
      const yPct = mode === 'throwCatch' ? P.throwYPct : P.ballYPct;
      ballX.value = side === 'left' ? w * P.leftXPct : w * P.rightXPct;
      ballY.value = h * yPct;
    },
    [ballX, ballY, mode],
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
    canInteractRef.current = false;
    waitingBeatRef.current = false;
    clearTimers();
    bumpScore();
    if (isHandSwap) {
      setSuccessToast(true);
      setSwapKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isTossGrab) {
      setSuccessToast(true);
      setTossKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isBeatPass) {
      setSuccessToast(true);
      setBeatKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers, isBeatPass, isHandSwap, isTossGrab]);

  const resetRoundState = useCallback(() => {
    passCountRef.current = 0;
    setPassCount(0);
    ballStateRef.current = 'left';
    setBallState('left');
    setBallSide('left');
    setActiveHand(null);
    canInteractRef.current = true;
    waitingBeatRef.current = false;
    ballRot.value = 0;
    layoutBall('left');
    leftScale.value = withSpring(1.1);
    rightScale.value = withSpring(1);
    if (isThemedPass) {
      setSuccessToast(false);
      setWarnVisible(false);
    }
  }, [ballRot, isThemedPass, layoutBall, leftScale, rightScale]);

  const showWrong = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
      if (isThemedPass) {
        setWarnMessage(msg);
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
    [isThemedPass, playShake, playWarn],
  );

  const afterPassLand = useCallback(
    (newSide: 'left' | 'right') => {
      ballStateRef.current = newSide;
      setBallState(newSide);
      setBallSide(newSide);
      canInteractRef.current = true;
      passCountRef.current += 1;
      setPassCount(passCountRef.current);

      if (passCountRef.current >= passesNeeded) {
        completeRound();
        return;
      }

      if (mode === 'rhythmPass') {
        roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), 900);
      } else {
        setStatusHint(
          isHandSwap
            ? newSide === 'left'
              ? '👈 Tap LEFT to swap!'
              : '👉 Tap RIGHT to swap!'
            : newSide === 'left'
              ? 'Tap LEFT to pass!'
              : 'Tap RIGHT to pass!',
        );
        if (newSide === 'left') leftScale.value = withSequence(withSpring(1.15), withSpring(1));
        else rightScale.value = withSequence(withSpring(1.15), withSpring(1));
      }
    },
    [completeRound, isHandSwap, leftScale, mode, passesNeeded, rightScale],
  );

  const animatePass = useCallback(
    (from: 'left' | 'right') => {
      canInteractRef.current = false;
      ballStateRef.current = 'moving';
      setBallState('moving');
      setStatusHint(isHandSwap ? '🌉 Ball crossing midline…' : 'Ball crossing midline…');
      const w = playW.current;
      const h = playH.current;
      const targetX = from === 'left' ? w * P.rightXPct : w * P.leftXPct;
      const y = h * P.ballYPct;
      if (from === 'left') leftScale.value = withSequence(withSpring(0.9), withSpring(1));
      else rightScale.value = withSequence(withSpring(0.9), withSpring(1));
      ballX.value = withTiming(targetX, { duration: P.passAnimMs });
      ballY.value = withTiming(y, { duration: P.passAnimMs });
      ballScale.value = withSequence(withTiming(1.15, { duration: 180 }), withTiming(1, { duration: 180 }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      roundTimerRef.current = setTimeout(() => afterPassLand(from === 'left' ? 'right' : 'left'), P.passAnimMs);
    },
    [afterPassLand, ballScale, ballX, ballY, isHandSwap, leftScale, rightScale],
  );

  const triggerBeatRef = useRef<() => void>(() => {});

  const triggerBeat = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current || roundCompleteRef.current) return;
    waitingBeatRef.current = true;
    canInteractRef.current = true;
    const side = ballStateRef.current === 'left' || ballStateRef.current === 'right' ? ballStateRef.current : 'left';
    setActiveHand(side);
    setStatusHint(rhythmHint(side, passCountRef.current + 1));
    beatPulse.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 400 }), withTiming(0, { duration: 900 }));
    if (side === 'left') leftScale.value = withSequence(withSpring(1.22), withSpring(1.08));
    else rightScale.value = withSequence(withSpring(1.22), withSpring(1.08));
    speakTTS(isBeatPass ? `Tap the ${side} hand on beat!` : side === 'left' ? 'Tap the blue hand!' : 'Tap the red hand!', 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      if (waitingBeatRef.current && roundActiveRef.current && !roundCompleteRef.current) {
        waitingBeatRef.current = false;
        setActiveHand(null);
        if (isBeatPass) {
          showWrong(ttsMissBeat);
        } else {
          playWarn();
        }
        setStatusHint(isBeatPass ? 'Missed beat — wait for 🎵 BEAT…' : 'Missed beat — wait for 🎵 BEAT…');
        speakTTS(isBeatPass ? ttsMissBeat : 'Missed the beat! Try again!', 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), P.rhythmBeatGraceMs);
      }
    }, P.rhythmBeatMs);
  }, [beatPulse, isBeatPass, leftScale, playWarn, rightScale, rhythmHint, showWrong, ttsMissBeat]);

  triggerBeatRef.current = triggerBeat;

  const startThrowCatch = useCallback(() => {
    if (doneRef.current) return;
    ballStateRef.current = 'left';
    setBallState('left');
    setBallSide('left');
    canInteractRef.current = true;
    setStatusHint(isTossGrab ? '🎾 Tap LEFT to throw!' : 'Tap LEFT to throw!');
    layoutBall('left');
    leftScale.value = withSpring(1.12);
  }, [isTossGrab, layoutBall, leftScale]);

  const throwBall = useCallback(() => {
    if (!canInteractRef.current || ballStateRef.current !== 'left') return;
    canInteractRef.current = false;
    ballStateRef.current = 'throwing';
    setBallState('throwing');
    setStatusHint(isTossGrab ? '✨ Ball arcing over the net…' : 'Ball flying…');
    const w = playW.current;
    const h = playH.current;
    const targetX = w * P.rightXPct;
    const midY = h * 0.22;
    const endY = h * P.throwYPct;
    leftScale.value = withSequence(withSpring(0.88), withSpring(1));
    ballX.value = withTiming(targetX, { duration: P.throwDurationMs });
    ballY.value = withSequence(
      withTiming(midY, { duration: P.throwDurationMs / 2 }),
      withTiming(endY, { duration: P.throwDurationMs / 2 }),
    );
    ballRot.value = withTiming(360, { duration: P.throwDurationMs });
    speakTTS('Throw!', 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      ballStateRef.current = 'catching';
      setBallState('catching');
      canInteractRef.current = true;
      setStatusHint(isTossGrab ? '🧤 Tap RIGHT to grab!' : 'Tap RIGHT to catch!');
      rightScale.value = withSequence(withSpring(1.2), withSpring(1.05));
      speakTTS('Catch with your right hand!', 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        if (ballStateRef.current === 'catching') {
          if (isTossGrab) {
            showWrong(ttsMiss);
          } else {
            playWarn();
            speakTTS('Missed! Try again!', 0.78).catch(() => {});
          }
          startThrowCatch();
        }
      }, P.catchWindowMs);
    }, P.throwDurationMs);
  }, [ballRot, ballX, ballY, isTossGrab, leftScale, playWarn, rightScale, showWrong, startThrowCatch, ttsMiss]);

  const catchBall = useCallback(() => {
    if (!canInteractRef.current || ballStateRef.current !== 'catching') return;
    clearTimers();
    canInteractRef.current = false;
    ballStateRef.current = 'right';
    setBallState('right');
    rightScale.value = withSequence(withSpring(1.2), withSpring(1));
    completeRound();
  }, [clearTimers, completeRound, rightScale]);

  const handleHand = useCallback(
    (hand: 'left' | 'right') => {
      if (!roundActiveRef.current || doneRef.current || roundCompleteRef.current) return;

      if (mode === 'throwCatch') {
        if (hand === 'left' && ballStateRef.current === 'left') throwBall();
        else if (hand === 'right' && ballStateRef.current === 'catching') catchBall();
        else if (ballStateRef.current === 'catching' && hand === 'left') {
          showWrong(isTossGrab ? ttsWrong : 'Wait for the ball!');
        } else if (isTossGrab && hand === 'right' && ballStateRef.current === 'left') {
          showWrong(ttsWrong);
        }
        return;
      }

      const current = ballStateRef.current;
      if (current !== 'left' && current !== 'right') return;
      if (!canInteractRef.current) return;
      if (mode === 'rhythmPass' && !waitingBeatRef.current) {
        if (isBeatPass) {
          showWrong(ttsWrong);
        } else {
          playWarn();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
        setStatusHint(isBeatPass ? 'Wait for 🎵 BEAT to flash!' : 'Wait for 🎵 BEAT to flash, then tap!');
        speakTTS(isBeatPass ? ttsWrong : 'Wait for the beat!', 0.78).catch(() => {});
        return;
      }

      if (current !== hand) {
        playWarn();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        const ballOn = current === 'left' ? 'blue left' : 'red right';
        const msg = isHandSwap
          ? ttsWrong
          : `Ball is on ${ballOn} — tap that hand!`;
        speakTTS(
          isHandSwap
            ? `Tap the ${current} hand — it has the ball!`
            : `Ball is on the ${ballOn} hand. Tap the ${ballOn} hand!`,
          0.78,
        ).catch(() => {});
        if (isHandSwap) {
          showWrong(msg);
        } else {
          setStatusHint(`Ball is on ${ballOn} — tap that hand!`);
        }
        return;
      }

      if (mode === 'rhythmPass') {
        waitingBeatRef.current = false;
        setActiveHand(null);
        clearTimers();
      }
      animatePass(hand);
    },
    [animatePass, catchBall, clearTimers, isBeatPass, isHandSwap, isTossGrab, mode, playWarn, showWrong, throwBall, ttsMissBeat, ttsWrong],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetRoundState();
    if (mode === 'throwCatch') {
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isTossGrab) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      startThrowCatch();
    } else if (mode === 'rhythmPass') {
      speakTTS(ttsCue, 0.78).catch(() => {});
      setStatusHint(isBeatPass ? '⏳ Wait for the neon beat flash…' : 'Wait for 🎵 BEAT, then tap the hand with the ball!');
      if (isBeatPass) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
      roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), 700);
    } else {
      setStatusHint(isHandSwap ? '👈 Tap LEFT to swap across midline!' : 'Tap LEFT to pass!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isHandSwap) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
    }
  }, [isBeatPass, isHandSwap, isTossGrab, kickOffOpacity, mode, resetRoundState, startThrowCatch, ttsCue]);

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

  const showBallOnHand = mode !== 'throwCatch' || ballState === 'left';
  const showFlyingBall =
    mode === 'throwCatch'
      ? ballState === 'throwing' || ballState === 'catching'
      : ballState === 'moving';

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
        {isBeatPass && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Beats {passCount}/{passesNeeded}
          </Text>
        )}
        {mode === 'rhythmPass' && !isBeatPass && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Passes {passCount}/{passesNeeded}
          </Text>
        )}
        {isHandSwap && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Swaps {passCount}/{passesNeeded}
          </Text>
        )}
        {isHandSwap && (
          <View style={[styles.roundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${(round / P.rounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isTossGrab && (
          <View style={[styles.roundTrack, styles.tossRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${(round / P.rounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isBeatPass && (
          <View style={[styles.roundTrack, styles.beatRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${(round / P.rounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isHandSwap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoHand}>👈</Text>
            <Text style={[styles.decoSwap, { color: T.accent }]}>🌉</Text>
            <Text style={styles.decoHand}>👉</Text>
          </View>
        )}
        {isTossGrab && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoHand}>🎾</Text>
            <Text style={[styles.decoSwap, { color: T.accent }]}>→</Text>
            <Text style={styles.decoHand}>🧤</Text>
          </View>
        )}
        {isBeatPass && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoHand}>🎵</Text>
            <Text style={[styles.decoSwap, { color: T.accent }]}>🏀</Text>
            <Text style={styles.decoHand}>🎵</Text>
          </View>
        )}
      </View>

      <Animated.View style={[styles.playAreaWrap, isThemedPass && playShakeStyle]}>
      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, isThemedPass && styles.playAreaThemed]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
          layoutBall(ballSide);
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {isHandSwap && (
          <HandSwapPlayArea
            roundActive={roundActive}
            showGuide={isHandSwap && round <= 2}
            ballSide={ballSide}
            ballState={ballState}
            passCount={passCount}
            passesNeeded={passesNeeded}
            swapKey={swapKey}
          />
        )}

        {isTossGrab && (
          <TossGrabPlayArea
            roundActive={roundActive}
            showGuide={isTossGrab && round <= 2}
            ballState={ballState}
            tossKey={tossKey}
          />
        )}

        {isBeatPass && (
          <BeatPassPlayArea
            roundActive={roundActive}
            showGuide={isBeatPass && round <= 2}
            activeHand={activeHand}
            passCount={passCount}
            passesNeeded={passesNeeded}
            beatKey={beatKey}
          />
        )}

        {mode === 'rhythmPass' && !isBeatPass && roundActive && (
          <Animated.View style={[styles.beatBadge, beatStyle]}>
            <Text style={styles.beatText}>🎵 BEAT</Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={[styles.handsRow, isThemedPass && styles.themedHandsRow]}>
            <TouchableOpacity onPress={() => handleHand('left')} activeOpacity={0.85}>
              <Animated.View
                style={[
                  styles.hand,
                  !isThemedPass && styles.leftHand,
                  leftStyle,
                  isHandSwap && styles.swapHand,
                  isHandSwap && { borderColor: T.leftColor ?? '#3B82F6' },
                  isHandSwap && ballSide === 'left' && ballState === 'left' && styles.swapHandActive,
                  isTossGrab && styles.tossHand,
                  isTossGrab && { borderColor: T.leftColor ?? '#22C55E' },
                  isTossGrab && ballState === 'left' && styles.tossHandActive,
                  isBeatPass && styles.beatHand,
                  isBeatPass && { borderColor: T.leftColor ?? '#8B5CF6' },
                  isBeatPass && activeHand === 'left' && styles.beatHandActive,
                  mode === 'rhythmPass' && !isBeatPass && activeHand === 'left' && styles.handActive,
                ]}
              >
                {isHandSwap ? (
                  <LinearGradient colors={['#2563EB', '#3B82F6', '#60A5FA']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👈</Text>
                    <Text style={styles.swapHandLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isTossGrab ? (
                  <LinearGradient colors={['#15803D', '#22C55E', '#4ADE80']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👈</Text>
                    <Text style={styles.swapHandLabel}>THROW</Text>
                  </LinearGradient>
                ) : isBeatPass ? (
                  <LinearGradient colors={['#5B21B6', '#8B5CF6', '#A78BFA']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👈</Text>
                    <Text style={styles.swapHandLabel}>{activeHand === 'left' ? 'TAP!' : 'LEFT'}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.handEmoji}>👈</Text>
                    <Text style={styles.handLabel}>
                      {mode === 'throwCatch' ? 'THROW' : mode === 'rhythmPass' && activeHand === 'left' ? 'TAP!' : 'LEFT'}
                    </Text>
                  </>
                )}
                {showBallOnHand && ballSide === 'left' && ballState === 'left' && (
                  <View style={[styles.ballBadge, isHandSwap && styles.swapBallBadge, isTossGrab && styles.tossBallBadge, isBeatPass && styles.beatBallBadge]}>
                    <Text style={styles.ballBadgeEmoji}>{T.ballEmoji}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>

            {!isThemedPass && <View style={styles.midline} />}

            <TouchableOpacity onPress={() => handleHand('right')} activeOpacity={0.85}>
              <Animated.View
                style={[
                  styles.hand,
                  !isThemedPass && styles.rightHand,
                  rightStyle,
                  isHandSwap && styles.swapHand,
                  isHandSwap && { borderColor: T.rightColor ?? '#14B8A6' },
                  isHandSwap && ballSide === 'right' && ballState === 'right' && styles.swapHandActive,
                  isTossGrab && styles.tossHand,
                  isTossGrab && { borderColor: T.rightColor ?? '#F59E0B' },
                  isTossGrab && ballState === 'catching' && styles.tossHandCatch,
                  isBeatPass && styles.beatHand,
                  isBeatPass && { borderColor: T.rightColor ?? '#E879F9' },
                  isBeatPass && activeHand === 'right' && styles.beatHandActive,
                  mode === 'rhythmPass' && !isBeatPass && activeHand === 'right' && styles.handActive,
                ]}
              >
                {isHandSwap ? (
                  <LinearGradient colors={['#0D9488', '#14B8A6', '#2DD4BF']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👉</Text>
                    <Text style={styles.swapHandLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isTossGrab ? (
                  <LinearGradient colors={['#B45309', '#F59E0B', '#FBBF24']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👉</Text>
                    <Text style={styles.swapHandLabel}>GRAB</Text>
                  </LinearGradient>
                ) : isBeatPass ? (
                  <LinearGradient colors={['#A21CAF', '#E879F9', '#F0ABFC']} style={styles.swapHandGradient}>
                    <Text style={styles.handEmoji}>👉</Text>
                    <Text style={styles.swapHandLabel}>{activeHand === 'right' ? 'TAP!' : 'RIGHT'}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.handEmoji}>👉</Text>
                    <Text style={styles.handLabel}>
                      {mode === 'throwCatch' ? 'CATCH' : mode === 'rhythmPass' && activeHand === 'right' ? 'TAP!' : 'RIGHT'}
                    </Text>
                  </>
                )}
                {ballSide === 'right' && ballState === 'right' && (
                  <View style={[styles.ballBadge, isHandSwap && styles.swapBallBadge, isTossGrab && styles.tossBallBadge, isBeatPass && styles.beatBallBadge]}>
                    <Text style={styles.ballBadgeEmoji}>{T.ballEmoji}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {roundActive && showFlyingBall && (
          <Animated.View pointerEvents="none" style={[styles.ball, isHandSwap && styles.swapBall, isTossGrab && styles.tossBall, isBeatPass && styles.beatBall, ballStyle]}>
            <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
          </Animated.View>
        )}

        {kickOffVisible && isHandSwap ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>🤲 HAND SWAP!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isTossGrab ? (
          <Animated.View style={[styles.kickOffBanner, styles.tossKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.tossKickOffText]}>🎾 TOSS & GRAB!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isBeatPass ? (
          <Animated.View style={[styles.kickOffBanner, styles.beatKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.beatKickOffText]}>🎵 BEAT PASS!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst
          key={sparkleKey}
          visible={sparkleKey > 0}
          color={T.sparkleColor}
          count={isThemedPass ? 16 : 10}
          size={isThemedPass ? 8 : 6}
        />
        {isHandSwap && <ResultToast text="SWAP!" type="ok" show={successToast} />}
        {isTossGrab && <ResultToast text="GRAB!" type="ok" show={successToast} />}
        {isBeatPass && <ResultToast text="BEAT!" type="ok" show={successToast} />}
      </View>
      </Animated.View>

      {warnVisible && isHandSwap && (
        <View style={styles.swapWarnPill}>
          <Text style={styles.swapWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isTossGrab && (
        <View style={styles.tossWarnPill}>
          <Text style={styles.tossWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isBeatPass && (
        <View style={styles.beatWarnPill}>
          <Text style={styles.beatWarnText}>{warnMessage}</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: { width: '70%', height: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden', marginBottom: 6, backgroundColor: 'rgba(12,25,41,0.55)' },
  tossRoundTrack: { backgroundColor: 'rgba(20,83,45,0.55)' },
  beatRoundTrack: { backgroundColor: 'rgba(30,27,75,0.55)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  decoHand: { fontSize: 16 },
  decoSwap: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  playAreaThemed: { overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  beatBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(139,92,246,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 3,
  },
  beatText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  handsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  themedHandsRow: { zIndex: 2 },
  swapHandsRow: { zIndex: 2 },
  midline: { width: 3, height: 100, backgroundColor: 'rgba(148,163,184,0.45)', borderRadius: 2 },
  hand: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftHand: { backgroundColor: '#3B82F6' },
  rightHand: { backgroundColor: '#EF4444' },
  handActive: {
    borderColor: '#FDE047',
    borderWidth: 5,
    shadowColor: '#FDE047',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  handEmoji: { fontSize: 40, marginBottom: 2 },
  handLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
  ballBadge: {
    position: 'absolute',
    top: -10,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballBadgeEmoji: { fontSize: 16 },
  swapHand: {
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  swapHandActive: {
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 12,
  },
  swapHandGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
  },
  swapHandLabel: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  swapBallBadge: { backgroundColor: '#F59E0B', borderWidth: 2, borderColor: '#22D3EE' },
  tossHand: {
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  tossHandActive: {
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 12,
  },
  tossHandCatch: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 4,
  },
  tossBallBadge: { backgroundColor: '#FBBF24', borderWidth: 2, borderColor: '#22C55E' },
  beatHand: {
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  beatHandActive: {
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 4,
  },
  beatBallBadge: { backgroundColor: '#C4B5FD', borderWidth: 2, borderColor: '#E879F9' },
  ball: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  ballEmoji: { fontSize: 32 },
  swapBall: {
    backgroundColor: 'rgba(245,158,11,0.95)',
    borderWidth: 2,
    borderColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tossBall: {
    backgroundColor: 'rgba(251,191,36,0.95)',
    borderWidth: 2,
    borderColor: '#22C55E',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  beatBall: {
    backgroundColor: 'rgba(167,139,250,0.95)',
    borderWidth: 2,
    borderColor: '#E879F9',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 2,
    borderColor: '#22D3EE',
    zIndex: 3,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#22D3EE', letterSpacing: 1 },
  tossKickOff: {
    backgroundColor: 'rgba(20,83,45,0.92)',
    borderColor: '#FBBF24',
  },
  tossKickOffText: { color: '#FBBF24' },
  beatKickOff: {
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderColor: '#A78BFA',
  },
  beatKickOffText: { color: '#C4B5FD' },
  swapWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  swapWarnText: { fontSize: 14, fontWeight: '800', color: '#A5F3FC', textAlign: 'center' },
  tossWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(20,83,45,0.92)',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  tossWarnText: { fontSize: 14, fontWeight: '800', color: '#FEF3C7', textAlign: 'center' },
  beatWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  beatWarnText: { fontSize: 14, fontWeight: '800', color: '#DDD6FE', textAlign: 'center' },
});

export default MidlinePassGame;
