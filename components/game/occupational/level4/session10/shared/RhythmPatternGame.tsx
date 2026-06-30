/**
 * Shared cross-body rhythm imitation core for OT Level 4 Session 10.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { BeatMirrorPlayArea } from '@/components/game/occupational/level4/session10/beatMirror/BeatMirrorVisuals';
import { CrossClapPlayArea } from '@/components/game/occupational/level4/session10/crossClap/CrossClapVisuals';
import { FastBeatPlayArea } from '@/components/game/occupational/level4/session10/fastBeat/FastBeatVisuals';
import { RhythmRecallPlayArea } from '@/components/game/occupational/level4/session10/rhythmRecall/RhythmRecallVisuals';
import { ShoulderTapPlayArea } from '@/components/game/occupational/level4/session10/shoulderTap/ShoulderTapVisuals';
import {
  ClapStep,
  MusicStep,
  RhythmStep,
  ShoulderStep,
  SideStep,
  UserBeat,
  speedBeatMs,
  speedToleranceMs,
  useTraceSound,
  validatePatternTiming,
  validateSteps,
} from '@/components/game/occupational/level4/session10/shared/rhythmUtils';
import {
  CLAP_PATTERNS,
  MEMORY_PATTERNS,
  MUSIC_PATTERNS,
  SESSION4_10_PACING,
  SHOULDER_PATTERNS,
  SPEED_PATTERNS,
} from '@/components/game/occupational/level4/session10/shared/session10Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
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

const P = SESSION4_10_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type RhythmMode = 'clapCross' | 'shoulderCross' | 'musicBeat' | 'memory' | 'speed';
type Phase = 'listen' | 'remember' | 'copy';

export type RhythmPatternTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
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
};

export type RhythmPatternGameConfig = {
  theme: RhythmPatternTheme;
  mode: RhythmMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsListen?: string;
  ttsCopy?: string;
  ttsSuccess?: string;
  ttsFail?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const roundsForMode = (mode: RhythmMode) => {
  switch (mode) {
    case 'clapCross':
      return P.clapRounds;
    case 'shoulderCross':
      return P.shoulderRounds;
    case 'musicBeat':
      return P.musicRounds;
    case 'memory':
      return P.memoryRounds;
    case 'speed':
      return P.speedRounds;
  }
};

const xpForMode = (mode: RhythmMode) => {
  switch (mode) {
    case 'memory':
      return P.xpMemory;
    default:
      return P.xpClap;
  }
};

const patternsForRound = (mode: RhythmMode, round: number): readonly RhythmStep[] => {
  const idx = (round - 1) % 8;
  switch (mode) {
    case 'clapCross':
      return CLAP_PATTERNS[idx] ?? CLAP_PATTERNS[0];
    case 'shoulderCross':
      return SHOULDER_PATTERNS[idx] ?? SHOULDER_PATTERNS[0];
    case 'musicBeat':
      return MUSIC_PATTERNS[idx] ?? MUSIC_PATTERNS[0];
    case 'memory':
      return MEMORY_PATTERNS[(round - 1) % MEMORY_PATTERNS.length] ?? MEMORY_PATTERNS[0];
    case 'speed':
      return SPEED_PATTERNS[(round - 1) % SPEED_PATTERNS.length] ?? SPEED_PATTERNS[0];
  }
};

const beatMsForMode = (mode: RhythmMode, round: number) => {
  if (mode === 'speed') {
    return speedBeatMs(round, P.speedInitialBeatMs, P.speedMinBeatMs, P.speedDecreaseMs);
  }
  if (mode === 'shoulderCross') return P.shoulderBeatMs;
  if (mode === 'musicBeat') return P.musicBeatMs;
  if (mode === 'memory') return P.memoryBeatMs;
  return P.clapBeatMs;
};

const toleranceForMode = (mode: RhythmMode, beatMs: number) => {
  if (mode === 'speed') return speedToleranceMs(beatMs, P.speedTolerancePct);
  if (mode === 'shoulderCross') return P.shoulderToleranceMs;
  if (mode === 'musicBeat') return P.musicToleranceMs;
  if (mode === 'memory') return P.memoryToleranceMs;
  return P.clapToleranceMs;
};

const soundForMode = (mode: RhythmMode): 'clap' | 'drum' => (mode === 'clapCross' ? 'clap' : 'drum');

export const RhythmPatternGame: React.FC<
  RhythmPatternGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsListen = 'Listen to the pattern!',
  ttsCopy = 'Now copy the pattern!',
  ttsSuccess = 'Perfect!',
  ttsFail = 'Try again!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const totalRounds = roundsForMode(mode);
  const xpPer = xpForMode(mode);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [statusHint, setStatusHint] = useState('');
  const [beatDisplay, setBeatDisplay] = useState(0);
  const [patternLen, setPatternLen] = useState(0);
  const [userLen, setUserLen] = useState(0);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [clapKey, setClapKey] = useState(0);
  const [shoulderKey, setShoulderKey] = useState(0);
  const [mirrorKey, setMirrorKey] = useState(0);
  const [recallKey, setRecallKey] = useState(0);
  const [fastKey, setFastKey] = useState(0);

  const isCrossClap = mode === 'clapCross';
  const isShoulderTap = mode === 'shoulderCross';
  const isBeatMirror = mode === 'musicBeat';
  const isRhythmRecall = mode === 'memory';
  const isFastBeat = mode === 'speed';
  const isThemedRhythm = isCrossClap || isShoulderTap || isBeatMirror || isRhythmRecall || isFastBeat;

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const phaseRef = useRef<Phase>('listen');
  const patternRef = useRef<RhythmStep[]>([]);
  const userRef = useRef<UserBeat<RhythmStep>[]>([]);
  const beatMsRef = useRef(P.clapBeatMs);
  const copyStartRef = useRef(0);
  const beatTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPatternRef = useRef<(steps: readonly RhythmStep[], beatMs: number) => void>(() => {});

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftShoulder = useSharedValue(1);
  const rightShoulder = useSharedValue(1);
  const beatPulse = useSharedValue(0);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));
  const leftShoulderStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftShoulder.value }] }));
  const rightShoulderStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightShoulder.value }] }));
  const beatStyle = useAnimatedStyle(() => ({ opacity: 0.35 + beatPulse.value * 0.65 }));
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const clearBeatTimers = useCallback(() => {
    beatTimersRef.current.forEach((t) => clearTimeout(t));
    beatTimersRef.current = [];
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    cancelAnimation(leftScale);
    cancelAnimation(rightScale);
    cancelAnimation(leftShoulder);
    cancelAnimation(rightShoulder);
    cancelAnimation(beatPulse);
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [beatPulse, kickOffOpacity, leftScale, leftShoulder, playShake, rightScale, rightShoulder]);

  const pulseHand = useCallback(
    (side: 'left' | 'right' | 'both') => {
      if (side === 'left' || side === 'both') {
        leftScale.value = withSequence(withSpring(1.2), withSpring(1));
      }
      if (side === 'right' || side === 'both') {
        rightScale.value = withSequence(withSpring(1.2), withSpring(1));
      }
    },
    [leftScale, rightScale],
  );

  const pulseClapDemo = useCallback(
    (step: ClapStep) => {
      const scale = step === 'left' ? rightScale : leftScale;
      scale.value = withSequence(withSpring(1.25), withSpring(1));
    },
    [leftScale, rightScale],
  );

  const pulseShoulderDemo = useCallback(
    (step: ShoulderStep) => {
      if (step === 'right-to-left') {
        rightScale.value = withSequence(withSpring(1.2), withSpring(1));
        leftShoulder.value = withSequence(withSpring(1.15), withSpring(1));
      } else {
        leftScale.value = withSequence(withSpring(1.2), withSpring(1));
        rightShoulder.value = withSequence(withSpring(1.15), withSpring(1));
      }
    },
    [leftScale, leftShoulder, rightScale, rightShoulder],
  );

  const pulseMusicDemo = useCallback(
    (step: MusicStep) => {
      if (step === 'left-hand') pulseHand('left');
      else if (step === 'right-hand') pulseHand('right');
      else pulseHand('both');
    },
    [pulseHand],
  );

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const xp = Math.round(finalScore * xpPer);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearBeatTimers();
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
    [clearBeatTimers, logType, router, skillTags, totalRounds, ttsComplete, xpPer],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    if (isCrossClap) {
      setSuccessToast(true);
      setClapKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isShoulderTap) {
      setSuccessToast(true);
      setShoulderKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isBeatMirror) {
      setSuccessToast(true);
      setMirrorKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isRhythmRecall) {
      setSuccessToast(true);
      setRecallKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isFastBeat) {
      setSuccessToast(true);
      setFastKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [isBeatMirror, isCrossClap, isFastBeat, isRhythmRecall, isShoulderTap, playSuccess, ttsSuccess]);

  const failCopy = useCallback(
    (options?: { replay?: boolean; hint?: string }) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(ttsFail, 0.78).catch(() => {});
      userRef.current = [];
      setUserLen(0);
      copyStartRef.current = Date.now();
      const hint = options?.hint ?? 'Try again!';
      if (options?.hint) setStatusHint(options.hint);
      if (isThemedRhythm) {
        setWarnMessage(hint);
        setWarnVisible(true);
        playShake.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
        toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
      }

      if (options?.replay) {
        const steps = patternRef.current;
        const beatMs = beatMsRef.current;
        setTimeout(() => playPatternRef.current(steps, beatMs), 450);
      }
    },
    [isThemedRhythm, playShake, playWarn, ttsFail],
  );

  const advanceRound = useCallback(() => {
    clearBeatTimers();
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearBeatTimers, endGame, totalRounds]);

  const startCopyPhase = useCallback(() => {
    setPhase('copy');
    phaseRef.current = 'copy';
    userRef.current = [];
    setUserLen(0);
    copyStartRef.current = Date.now();
    setStatusHint('Your turn — copy the pattern!');
    speakTTS(ttsCopy, 0.78).catch(() => {});
  }, [ttsCopy]);

  const playPattern = useCallback(
    (steps: readonly RhythmStep[], beatMs: number) => {
      clearBeatTimers();
      setPhase('listen');
      phaseRef.current = 'listen';
      setBeatDisplay(0);
      setStatusHint('Listen…');
      speakTTS(ttsListen, 0.78).catch(() => {});

      let i = 0;
      const playBeat = () => {
        if (i >= steps.length) {
          if (mode === 'memory') {
            setPhase('remember');
            phaseRef.current = 'remember';
            setStatusHint('Remember the pattern…');
            speakTTS('Remember the pattern!', 0.78).catch(() => {});
            const t = setTimeout(() => startCopyPhase(), P.memoryPauseMs);
            beatTimersRef.current.push(t);
          } else {
            const t = setTimeout(() => startCopyPhase(), beatMs);
            beatTimersRef.current.push(t);
          }
          return;
        }

        const step = steps[i];
        beatPulse.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 400 }));
        playSound(soundForMode(mode), 0.8, 1.0).catch(() => {});

        if (mode === 'clapCross') pulseClapDemo(step as ClapStep);
        else if (mode === 'shoulderCross') pulseShoulderDemo(step as ShoulderStep);
        else if (mode === 'musicBeat') pulseMusicDemo(step as MusicStep);
        else pulseHand(step as SideStep);

        setBeatDisplay(i + 1);
        i += 1;
        const t = setTimeout(playBeat, beatMs);
        beatTimersRef.current.push(t);
      };

      const lead = setTimeout(playBeat, P.listenLeadMs);
      beatTimersRef.current.push(lead);
    },
    [beatPulse, clearBeatTimers, mode, pulseClapDemo, pulseHand, pulseMusicDemo, pulseShoulderDemo, startCopyPhase, ttsListen],
  );

  playPatternRef.current = playPattern;

  const checkUserInput = useCallback(() => {
    const expected = patternRef.current;
    const actual = userRef.current;
    if (!validateSteps(expected, actual)) {
      failCopy({ hint: 'Copy the same pattern!' });
      return;
    }

    const needsTiming = mode === 'memory' || mode === 'speed';
    if (needsTiming) {
      const tol = toleranceForMode(mode, beatMsRef.current);
      if (!validatePatternTiming(actual, beatMsRef.current, tol)) {
        failCopy({
          replay: true,
          hint: 'Match the rhythm — listen and try again!',
        });
        return;
      }
    }

    bumpScore();
    setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, failCopy, mode]);

  const recordStep = useCallback(
    (step: RhythmStep) => {
      if (phaseRef.current !== 'copy' || doneRef.current) return;
      const stepIdx = userRef.current.length;
      if (patternRef.current[stepIdx] !== step) {
        failCopy();
        return;
      }
      const time = Date.now() - copyStartRef.current;
      userRef.current = [...userRef.current, { time, step }];
      setUserLen(userRef.current.length);

      if (mode === 'clapCross') {
        pulseClapDemo(step as ClapStep);
        playSound('clap', 0.7, 1.0).catch(() => {});
      } else if (mode === 'shoulderCross') {
        pulseShoulderDemo(step as ShoulderStep);
        playSound('drum', 0.7, 1.0).catch(() => {});
      } else if (mode === 'musicBeat') {
        pulseMusicDemo(step as MusicStep);
        playSound('drum', 0.7, 1.0).catch(() => {});
      } else {
        pulseHand(step as SideStep);
        playSound('drum', 0.7, 1.0).catch(() => {});
      }

      if (userRef.current.length >= patternRef.current.length) {
        checkUserInput();
      }
    },
    [checkUserInput, failCopy, mode, pulseClapDemo, pulseHand, pulseMusicDemo, pulseShoulderDemo],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    const beatMs = beatMsForMode(mode, roundRef.current);
    beatMsRef.current = beatMs;
    const steps = [...patternsForRound(mode, roundRef.current)];
    patternRef.current = steps;
    setPatternLen(steps.length);
    userRef.current = [];
    setUserLen(0);
    if (isThemedRhythm) {
      setSuccessToast(false);
      setWarnVisible(false);
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 350 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    }
    playPattern(steps, beatMs);
  }, [isThemedRhythm, kickOffOpacity, mode, playPattern]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearBeatTimers();
    const t = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    beatTimersRef.current.push(t);
    return clearBeatTimers;
  }, [round, startRoundPlay, ttsIntro, clearBeatTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearBeatTimers();
    },
    [clearBeatTimers],
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

  const canInput = phase === 'copy';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearBeatTimers();
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
              {round}/{totalRounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {statusHint ? <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text> : null}
        {isThemedRhythm && (
          <View
            style={[
              styles.roundTrack,
              isCrossClap && styles.clapRoundTrack,
              isShoulderTap && styles.shoulderRoundTrack,
              isBeatMirror && styles.mirrorRoundTrack,
              isRhythmRecall && styles.recallRoundTrack,
              isFastBeat && styles.fastRoundTrack,
              { borderColor: T.accent },
            ]}
          >
            <View style={[styles.roundFill, { width: `${(round / totalRounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isCrossClap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>👏</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>↔</Text>
            <Text style={styles.decoEmoji}>👏</Text>
          </View>
        )}
        {isShoulderTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>👉</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🫲</Text>
            <Text style={styles.decoEmoji}>🫱</Text>
          </View>
        )}
        {isBeatMirror && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>👈</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🎵</Text>
            <Text style={styles.decoEmoji}>👉</Text>
          </View>
        )}
        {isRhythmRecall && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>👂</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🧠</Text>
            <Text style={styles.decoEmoji}>🔁</Text>
          </View>
        )}
        {isFastBeat && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>⚡</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🎵</Text>
            <Text style={styles.decoEmoji}>⚡</Text>
          </View>
        )}
        {phase === 'listen' && patternLen > 0 && !isThemedRhythm && (
          <Animated.View style={[styles.beatBadge, beatStyle]}>
            <Text style={styles.beatText}>
              Beat {beatDisplay}/{patternLen}
            </Text>
          </Animated.View>
        )}
        {canInput && patternLen > 0 && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Steps {userLen}/{patternLen}
          </Text>
        )}
      </View>

      <Animated.View style={[styles.playAreaWrap, isThemedRhythm && playShakeStyle]}>
        <View
          style={[
            styles.playArea,
            { borderColor: T.playBorder, backgroundColor: T.playBg },
            isThemedRhythm && styles.playAreaThemed,
          ]}
        >
          {isCrossClap && (
            <CrossClapPlayArea
              phase={phase}
              showGuide={isCrossClap && round <= 2}
              clapKey={clapKey}
              beatDisplay={beatDisplay}
              patternLen={patternLen}
            />
          )}

          {isShoulderTap && (
            <ShoulderTapPlayArea
              phase={phase}
              showGuide={isShoulderTap && round <= 2}
              shoulderKey={shoulderKey}
              beatDisplay={beatDisplay}
              patternLen={patternLen}
            />
          )}

          {isBeatMirror && (
            <BeatMirrorPlayArea
              phase={phase}
              showGuide={isBeatMirror && round <= 2}
              mirrorKey={mirrorKey}
              beatDisplay={beatDisplay}
              patternLen={patternLen}
            />
          )}

          {isRhythmRecall && (
            <RhythmRecallPlayArea
              phase={phase}
              showGuide={isRhythmRecall && round <= 2}
              recallKey={recallKey}
              beatDisplay={beatDisplay}
              patternLen={patternLen}
            />
          )}

          {isFastBeat && (
            <FastBeatPlayArea
              phase={phase}
              showGuide={isFastBeat && round <= 2}
              fastKey={fastKey}
              beatDisplay={beatDisplay}
              patternLen={patternLen}
              round={round}
              totalRounds={totalRounds}
            />
          )}

          {phase === 'remember' && !isThemedRhythm && (
            <Text style={[styles.rememberText, { color: T.accentDark }]}>🧠 Remember…</Text>
          )}
          {phase === 'remember' && isThemedRhythm && !isRhythmRecall && (
            <Text style={[styles.rememberTextThemed, { color: T.accentDark }]}>🧠 Remember…</Text>
          )}

          {mode === 'shoulderCross' && (
            <View style={[styles.shoulderRow, isShoulderTap && styles.shoulderRowThemed]}>
              <Animated.View style={[styles.shoulder, isShoulderTap && styles.shoulderThemed, leftShoulderStyle]}>
                <Text style={styles.shoulderEmoji}>🫲</Text>
              </Animated.View>
              <Animated.View style={[styles.shoulder, isShoulderTap && styles.shoulderThemed, rightShoulderStyle]}>
                <Text style={styles.shoulderEmoji}>🫱</Text>
              </Animated.View>
            </View>
          )}

          <View style={styles.handsRow}>
            <Animated.View
              style={[
                styles.hand,
                { backgroundColor: T.leftColor },
                isCrossClap && styles.clapHand,
                isShoulderTap && styles.shoulderHand,
                isBeatMirror && styles.mirrorHand,
                isRhythmRecall && styles.recallHand,
                isFastBeat && styles.fastHand,
                leftStyle,
              ]}
            >
              <Text style={styles.handEmoji}>👈</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.hand,
                { backgroundColor: T.rightColor },
                isCrossClap && styles.clapHand,
                isShoulderTap && styles.shoulderHand,
                isBeatMirror && styles.mirrorHand,
                isRhythmRecall && styles.recallHand,
                isFastBeat && styles.fastHand,
                rightStyle,
              ]}
            >
              <Text style={styles.handEmoji}>👉</Text>
            </Animated.View>
          </View>

          {canInput && (
            <View style={styles.inputRow}>
              {mode === 'clapCross' && (
                <>
                  <TouchableOpacity
                    style={[styles.inputBtn, isCrossClap && styles.clapInputBtn]}
                    onPress={() => recordStep('left' as ClapStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isCrossClap && styles.clapInputLabel]}>👏 LEFT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isCrossClap && styles.clapInputBtn]}
                    onPress={() => recordStep('right' as ClapStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isCrossClap && styles.clapInputLabel]}>RIGHT 👏</Text>
                  </TouchableOpacity>
                </>
              )}
              {mode === 'shoulderCross' && (
                <>
                  <TouchableOpacity
                    style={[styles.inputBtn, isShoulderTap && styles.shoulderInputBtn]}
                    onPress={() => recordStep('right-to-left' as ShoulderStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isShoulderTap && styles.shoulderInputLabel]}>👉 → 🫲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isShoulderTap && styles.shoulderInputBtn]}
                    onPress={() => recordStep('left-to-right' as ShoulderStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isShoulderTap && styles.shoulderInputLabel]}>👈 → 🫱</Text>
                  </TouchableOpacity>
                </>
              )}
              {mode === 'musicBeat' && (
                <>
                  <TouchableOpacity
                    style={[styles.inputBtn, isBeatMirror && styles.mirrorInputBtn]}
                    onPress={() => recordStep('left-hand' as MusicStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isBeatMirror && styles.mirrorInputLabel]}>👈</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isBeatMirror && styles.mirrorInputBtnBoth]}
                    onPress={() => recordStep('both-hands' as MusicStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isBeatMirror && styles.mirrorInputLabel]}>🙌</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isBeatMirror && styles.mirrorInputBtn]}
                    onPress={() => recordStep('right-hand' as MusicStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isBeatMirror && styles.mirrorInputLabel]}>👉</Text>
                  </TouchableOpacity>
                </>
              )}
              {mode === 'memory' && (
                <>
                  <TouchableOpacity
                    style={[styles.inputBtn, isRhythmRecall && styles.recallInputBtn]}
                    onPress={() => recordStep('left' as SideStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isRhythmRecall && styles.recallInputLabel]}>👈 LEFT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isRhythmRecall && styles.recallInputBtn]}
                    onPress={() => recordStep('right' as SideStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isRhythmRecall && styles.recallInputLabel]}>RIGHT 👉</Text>
                  </TouchableOpacity>
                </>
              )}
              {mode === 'speed' && (
                <>
                  <TouchableOpacity
                    style={[styles.inputBtn, isFastBeat && styles.fastInputBtn]}
                    onPress={() => recordStep('left' as SideStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isFastBeat && styles.fastInputLabel]}>👈 LEFT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputBtn, isFastBeat && styles.fastInputBtn]}
                    onPress={() => recordStep('right' as SideStep)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.inputLabel, isFastBeat && styles.fastInputLabel]}>RIGHT 👉</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {kickOffVisible && isCrossClap ? (
            <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.kickOffText}>👏 CROSS CLAP!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isShoulderTap ? (
            <Animated.View style={[styles.kickOffBanner, styles.shoulderKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.shoulderKickOffText]}>👆 SHOULDER TAP!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isBeatMirror ? (
            <Animated.View style={[styles.kickOffBanner, styles.mirrorKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.mirrorKickOffText]}>🎵 BEAT MIRROR!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isRhythmRecall ? (
            <Animated.View style={[styles.kickOffBanner, styles.recallKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.recallKickOffText]}>🧠 RHYTHM RECALL!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isFastBeat ? (
            <Animated.View style={[styles.kickOffBanner, styles.fastKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.fastKickOffText]}>⚡ FAST BEAT!</Text>
            </Animated.View>
          ) : null}

          <SparkleBurst
            key={sparkleKey}
            visible={sparkleKey > 0}
            color={T.sparkleColor}
            count={isThemedRhythm ? 16 : 10}
            size={isThemedRhythm ? 8 : 6}
          />
          {isCrossClap && <ResultToast text="CLAP!" type="ok" show={successToast} />}
          {isShoulderTap && <ResultToast text="TAP!" type="ok" show={successToast} />}
          {isBeatMirror && <ResultToast text="BEAT!" type="ok" show={successToast} />}
          {isRhythmRecall && <ResultToast text="RECALL!" type="ok" show={successToast} />}
          {isFastBeat && <ResultToast text="FAST!" type="ok" show={successToast} />}
        </View>
      </Animated.View>

      {warnVisible && isCrossClap && (
        <View style={styles.clapWarnPill}>
          <Text style={styles.clapWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isShoulderTap && (
        <View style={styles.shoulderWarnPill}>
          <Text style={styles.shoulderWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isBeatMirror && (
        <View style={styles.mirrorWarnPill}>
          <Text style={styles.mirrorWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isRhythmRecall && (
        <View style={styles.recallWarnPill}>
          <Text style={styles.recallWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isFastBeat && (
        <View style={styles.fastWarnPill}>
          <Text style={styles.fastWarnText}>{warnMessage}</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  beatBadge: {
    backgroundColor: 'rgba(139,92,246,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 8,
  },
  beatText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: {
    width: '70%',
    height: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(12,25,41,0.55)',
  },
  clapRoundTrack: { backgroundColor: 'rgba(12,25,41,0.55)' },
  shoulderRoundTrack: { backgroundColor: 'rgba(5,46,22,0.55)' },
  mirrorRoundTrack: { backgroundColor: 'rgba(46,16,101,0.55)' },
  recallRoundTrack: { backgroundColor: 'rgba(66,32,6,0.55)' },
  fastRoundTrack: { backgroundColor: 'rgba(69,10,10,0.55)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  decoEmoji: { fontSize: 20 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  playAreaThemed: { borderWidth: 2, overflow: 'hidden' },
  rememberText: { position: 'absolute', top: 24, fontSize: 22, fontWeight: '900' },
  rememberTextThemed: { position: 'absolute', top: 24, fontSize: 22, fontWeight: '900', zIndex: 5 },
  shoulderRow: { position: 'absolute', top: 48, flexDirection: 'row', width: '80%', justifyContent: 'space-between', zIndex: 5 },
  shoulderRowThemed: { top: 56 },
  shoulder: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  shoulderThemed: {
    backgroundColor: 'rgba(5,46,22,0.75)',
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.45)',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  shoulderEmoji: { fontSize: 28 },
  handsRow: { flexDirection: 'row', gap: 40, marginBottom: 24 },
  hand: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  clapHand: { zIndex: 5, borderColor: 'rgba(191,219,254,0.55)', shadowColor: '#60A5FA', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  shoulderHand: { zIndex: 5, borderColor: 'rgba(187,247,208,0.55)', shadowColor: '#4ADE80', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  mirrorHand: { zIndex: 5, borderColor: 'rgba(221,214,254,0.55)', shadowColor: '#A78BFA', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  recallHand: { zIndex: 5, borderColor: 'rgba(253,230,138,0.55)', shadowColor: '#FBBF24', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  fastHand: { zIndex: 5, borderColor: 'rgba(254,202,202,0.55)', shadowColor: '#EF4444', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  handEmoji: { fontSize: 40 },
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingHorizontal: 12, zIndex: 5 },
  inputBtn: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)' },
  clapInputBtn: { backgroundColor: 'rgba(12,25,41,0.85)', borderColor: 'rgba(96,165,250,0.45)' },
  inputLabel: { fontWeight: '800', fontSize: 14, color: '#334155' },
  clapInputLabel: { color: '#BFDBFE' },
  shoulderInputBtn: { backgroundColor: 'rgba(5,46,22,0.85)', borderColor: 'rgba(74,222,128,0.45)' },
  shoulderInputLabel: { color: '#BBF7D0' },
  mirrorInputBtn: { backgroundColor: 'rgba(46,16,101,0.85)', borderColor: 'rgba(139,92,246,0.45)' },
  mirrorInputBtnBoth: { backgroundColor: 'rgba(46,16,101,0.85)', borderColor: 'rgba(244,114,182,0.45)' },
  mirrorInputLabel: { color: '#DDD6FE', fontSize: 18 },
  recallInputBtn: { backgroundColor: 'rgba(66,32,6,0.85)', borderColor: 'rgba(251,191,36,0.45)' },
  recallInputLabel: { color: '#FDE68A' },
  fastInputBtn: { backgroundColor: 'rgba(69,10,10,0.85)', borderColor: 'rgba(239,68,68,0.45)' },
  fastInputLabel: { color: '#FECACA' },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '8%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 2,
    borderColor: '#60A5FA',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#BFDBFE', letterSpacing: 1 },
  clapWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  clapWarnText: { fontSize: 14, fontWeight: '800', color: '#BFDBFE', textAlign: 'center' },
  shoulderKickOff: { backgroundColor: 'rgba(5,46,22,0.92)', borderColor: '#4ADE80' },
  shoulderKickOffText: { color: '#BBF7D0' },
  shoulderWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(5,46,22,0.92)',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  shoulderWarnText: { fontSize: 14, fontWeight: '800', color: '#BBF7D0', textAlign: 'center' },
  mirrorKickOff: { backgroundColor: 'rgba(46,16,101,0.92)', borderColor: '#A78BFA' },
  mirrorKickOffText: { color: '#DDD6FE' },
  mirrorWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  mirrorWarnText: { fontSize: 14, fontWeight: '800', color: '#DDD6FE', textAlign: 'center' },
  recallKickOff: { backgroundColor: 'rgba(66,32,6,0.92)', borderColor: '#FBBF24' },
  recallKickOffText: { color: '#FDE68A' },
  recallWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(66,32,6,0.92)',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  recallWarnText: { fontSize: 14, fontWeight: '800', color: '#FDE68A', textAlign: 'center' },
  fastKickOff: { backgroundColor: 'rgba(69,10,10,0.92)', borderColor: '#EF4444' },
  fastKickOffText: { color: '#FECACA' },
  fastWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  fastWarnText: { fontSize: 14, fontWeight: '800', color: '#FECACA', textAlign: 'center' },
});

export default RhythmPatternGame;
