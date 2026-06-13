/**
 * Jungle Swing Adventure — OT Level 3 Session 7 swing & circular motion engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CircleProgressRing } from '@/components/game/occupational/level3/session7/components/CircleProgressRing';
import { RhythmSwingCue } from '@/components/game/occupational/level3/session7/components/RhythmSwingCue';
import { SwingGuideBadge } from '@/components/game/occupational/level3/session7/components/SwingGuideBadge';
import { VineTargets } from '@/components/game/occupational/level3/session7/components/VineTargets';
import {
  SESSION7_PACING,
  circleMinProgress,
  demoSwingMs,
  difficultyTier,
  monkeyMinSwipePx,
  monkeySwingsNeeded,
  musicBeatIntervalMs,
  musicSwingToleranceMs,
  musicSwingsNeeded,
  pendulumDirChanges,
  ropeSwingHalfMs,
  ropeTimingWindowMs,
  swipeThresholdPx,
} from '@/components/game/occupational/level3/session7/session7Pacing';
import {
  type DiagonalDir,
  type SwingDir,
  buildVineSequence,
  diagonalArrow,
  isDiagonalSwipe,
  normalizeAngleDelta,
  onBeat,
  scoreBeatTiming,
  scoreCircleProgress,
  scorePeakTiming,
  swipeDistance,
  useTraceSound,
} from '@/components/game/occupational/level3/session7/swingUtils';
import { useSwingAnalytics } from '@/components/game/occupational/level3/session7/useSwingAnalytics';
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
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION7_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Awesome Swing!', 'Perfect Circle!', 'Great Motion!', 'Fantastic Control!', "You're a Jungle Champion!"];

export type SwingMotionMode = 'pendulumCopy' | 'monkeySwing' | 'fanMotion' | 'ropeTiming' | 'musicSwing';

export type SwingMotionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  objectEmoji: string;
  demoEmoji?: string;
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
  hintText: string;
};

export type SwingMotionGameConfig = {
  theme: SwingMotionTheme;
  mode: SwingMotionMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCopyPrompt?: string;
  ttsSwingMore?: string;
  ttsSwipeMore?: string;
  ttsCircleMore?: string;
  ttsTimingMiss?: string;
  ttsBeatMiss?: string;
  ttsMusicPrompt?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const SwingMotionGame: React.FC<
  SwingMotionGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCopyPrompt = 'Now copy the side-to-side swing!',
  ttsSwingMore = 'Swing farther!',
  ttsSwipeMore = 'Swipe bigger!',
  ttsCircleMore = 'Trace a full circle!',
  ttsTimingMiss = 'Swipe when the rope is at the peak!',
  ttsBeatMiss = 'Swing on the beat!',
  ttsMusicPrompt = 'Now swing with the music!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordSuccess,
    recordError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useSwingAnalytics();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    correct: number;
    total: number;
    xp: number;
    analytics: ReturnType<typeof analyticsSnapshot>;
  } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [phase, setPhase] = useState<'idle' | 'watch' | 'copy' | 'listen' | 'swing' | 'play'>('idle');
  const [fanProgress, setFanProgress] = useState(0);
  const [musicBeat, setMusicBeat] = useState(0);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [vineTarget, setVineTarget] = useState<DiagonalDir | null>(null);
  const [musicTotal, setMusicTotal] = useState(4);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const phaseRef = useRef<'idle' | 'watch' | 'copy' | 'listen' | 'swing' | 'play'>('idle');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(500);
  const playCenterX = useRef(180);
  const playCenterY = useRef(250);

  const userDirChangesRef = useRef(0);
  const userLastDirRef = useRef<SwingDir | null>(null);
  const userStartXPctRef = useRef(P.pendulumCenterXPct);
  const monkeySwingsRef = useRef(0);
  const angleProgressRef = useRef(0);
  const lastAngleRef = useRef<number | null>(null);
  const lastPeakTimeRef = useRef(0);
  const musicSwingsRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const panStartX = useRef(0);
  const panStartY = useRef(0);
  const panDistRef = useRef(0);
  const panTxRef = useRef(0);
  const panTyRef = useRef(0);
  const vineSequenceRef = useRef<DiagonalDir[]>([]);
  const vineStepRef = useRef(0);
  const musicIntervalRef = useRef(880);
  const musicToleranceRef = useRef(320);
  const musicNeededRef = useRef(4);
  const fanMinRef = useRef(0.78);
  const pendulumNeededRef = useRef(4);

  const objX = useSharedValue(P.pendulumCenterXPct);
  const objY = useSharedValue(P.pendulumCenterYPct);
  const objScale = useSharedValue(1);
  const objRotate = useSharedValue(0);
  const demoX = useSharedValue(P.pendulumCenterXPct);
  const ropeAngle = useSharedValue(-30);
  const beatScale = useSharedValue(1);
  const fanRotation = useSharedValue(0);

  const tier = difficultyTier(round, P.rounds);

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
    phaseRef.current = phase;
  }, [phase]);

  const markRopePeak = useCallback(() => {
    lastPeakTimeRef.current = Date.now();
  }, []);

  useAnimatedReaction(
    () => ropeAngle.value,
    (v, prev) => {
      const atPeak = Math.abs(v) < P.ropePeakAngleDeg;
      const wasPeak = prev !== null && Math.abs(prev) < P.ropePeakAngleDeg;
      if (atPeak && !wasPeak) {
        runOnJS(markRopePeak)();
      }
    },
  );

  const objStyle = useAnimatedStyle(() => ({
    left: `${objX.value}%`,
    top: `${objY.value}%`,
    transform: [
      { translateX: -44 },
      { translateY: -44 },
      { rotate: `${objRotate.value}deg` },
      { scale: objScale.value },
    ],
  }));

  const demoStyle = useAnimatedStyle(() => ({
    left: `${demoX.value}%`,
    top: `${P.pendulumCenterYPct - 12}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }, { scale: 0.85 }],
  }));

  const ropeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ropeAngle.value}deg` }, { scale: objScale.value }],
  }));

  const fanStyle = useAnimatedStyle(() => ({
    left: `${P.fanCenterXPct}%`,
    top: `${P.fanCenterYPct}%`,
    transform: [
      { translateX: -44 },
      { translateY: -44 },
      { rotate: `${fanRotation.value}deg` },
      { scale: objScale.value },
    ],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    cancelAnimation(demoX);
    cancelAnimation(ropeAngle);
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [demoX, objX, objY, ropeAngle]);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 16 + snap.coordinationScore * 0.18);
      setFinalStats({ correct: finalScore, total: P.rounds, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total: P.rounds,
            accuracy: snap.coordinationScore,
            xpAwarded: xp,
            durationMs: snap.durationMs,
            responseTimeMs: snap.avgReactionMs,
            skillTags,
            meta: analyticsMeta(),
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(
    (opts?: {
      swing?: number;
      circular?: number;
      smoothness?: number;
      timing?: number;
      rhythm?: number;
      tracking?: number;
      motor?: number;
    }) => {
      setSparkleKey(Date.now());
      setCoins((c) => c + 5);
      setCueSuccess(true);
      recordSuccess(opts);
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      praiseVoice();
      setScore((s) => {
        scoreRef.current = s + 1;
        return s + 1;
      });
      setTimeout(() => setCueSuccess(undefined), 650);
    },
    [playSuccess, praiseVoice, recordSuccess],
  );

  const showWarn = useCallback(
    (msg: string) => {
      recordError();
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCueSuccess(false);
      setWarnVisible(true);
      setTimeout(() => {
        setWarnVisible(false);
        setCueSuccess(undefined);
      }, 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, recordError],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setPhase('idle');
    setFanProgress(0);
    setMusicBeat(0);
    setVineTarget(null);
    vineStepRef.current = 0;
    userDirChangesRef.current = 0;
    userLastDirRef.current = null;
    monkeySwingsRef.current = 0;
    angleProgressRef.current = 0;
    lastAngleRef.current = null;
    musicSwingsRef.current = 0;
    objX.value = mode === 'monkeySwing' ? P.monkeyStartXPct : P.pendulumCenterXPct;
    objY.value = mode === 'monkeySwing' ? P.monkeyStartYPct : P.pendulumCenterYPct;
    objScale.value = 1;
    objRotate.value = 0;
    demoX.value = P.pendulumCenterXPct;
    fanRotation.value = 0;
    ropeAngle.value = -30;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, fanRotation, mode, objRotate, objScale, objX, objY, demoX, ropeAngle]);

  const completeRound = useCallback(
    (opts?: {
      swing?: number;
      circular?: number;
      smoothness?: number;
      timing?: number;
      rhythm?: number;
      tracking?: number;
      motor?: number;
    }) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore(opts);
      objScale.value = withSequence(withTiming(1.22, { duration: 160 }), withTiming(1, { duration: 160 }));
      if (mode === 'ropeTiming') cancelAnimation(ropeAngle);
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, mode, objScale, ropeAngle],
  );

  const beginCopyPhase = useCallback(() => {
    setPhase('copy');
    phaseRef.current = 'copy';
    setStatusHint('Copy the swing!');
    speakTTS(ttsCopyPrompt, 0.78).catch(() => {});
  }, [ttsCopyPrompt]);

  const runDemoSwing = useCallback(() => {
    const left = P.pendulumCenterXPct - P.swingDistancePct;
    const right = P.pendulumCenterXPct + P.swingDistancePct;
    const half = demoSwingMs(tier);
    demoX.value = P.pendulumCenterXPct;
    demoX.value = withSequence(
      withTiming(left, { duration: half }),
      withTiming(P.pendulumCenterXPct, { duration: half }),
      withTiming(right, { duration: half }),
      withTiming(P.pendulumCenterXPct, { duration: half }),
      withTiming(left, { duration: half }),
      withTiming(P.pendulumCenterXPct, { duration: half }, (finished) => {
        if (finished) runOnJS(beginCopyPhase)();
      }),
    );
  }, [beginCopyPhase, demoX, tier]);

  const startRopeSwing = useCallback(() => {
    const half = ropeSwingHalfMs(tier);
    lastPeakTimeRef.current = Date.now();
    ropeAngle.value = -30;
    ropeAngle.value = withRepeat(
      withSequence(withTiming(30, { duration: half }), withTiming(-30, { duration: half })),
      -1,
      false,
    );
  }, [ropeAngle, tier]);

  const pulseBeat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    beatScale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(1, { duration: 120 }));
  }, [beatScale]);

  const playMusicBeats = useCallback(
    (count: number) => {
      const needed = musicNeededRef.current;
      if (count > needed || doneRef.current) {
        setPhase('swing');
        phaseRef.current = 'swing';
        setStatusHint('Swing on each beat!');
        speakTTS(ttsMusicPrompt, 0.78).catch(() => {});
        return;
      }
      pulseBeat();
      lastBeatTimeRef.current = Date.now();
      setMusicBeat(count);
      beatTimerRef.current = setTimeout(() => playMusicBeats(count + 1), musicIntervalRef.current);
    },
    [pulseBeat, ttsMusicPrompt],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    objScale.value = 1;
    pendulumNeededRef.current = pendulumDirChanges(tier);
    fanMinRef.current = circleMinProgress(tier);
    musicIntervalRef.current = musicBeatIntervalMs(tier);
    musicToleranceRef.current = musicSwingToleranceMs(tier);
    musicNeededRef.current = musicSwingsNeeded(tier);
    setMusicTotal(musicNeededRef.current);

    if (mode === 'pendulumCopy') {
      setPhase('watch');
      phaseRef.current = 'watch';
      setStatusHint('Watch the demo…');
      userDirChangesRef.current = 0;
      userLastDirRef.current = null;
      objX.value = P.pendulumCenterXPct;
      runDemoSwing();
      return;
    }
    if (mode === 'monkeySwing') {
      const swings = monkeySwingsNeeded(tier);
      vineSequenceRef.current = buildVineSequence(swings, tier);
      vineStepRef.current = 0;
      const first = vineSequenceRef.current[0] ?? 'ne';
      setVineTarget(tier >= 3 ? first : null);
      setPhase('play');
      phaseRef.current = 'play';
      setStatusHint(
        tier >= 3
          ? `Swipe ${diagonalArrow(first)} on the vine!`
          : `Swing ${swings} times diagonally!`,
      );
      objX.value = P.monkeyStartXPct;
      objY.value = P.monkeyStartYPct;
      monkeySwingsRef.current = 0;
      return;
    }
    if (mode === 'fanMotion') {
      setPhase('play');
      phaseRef.current = 'play';
      setStatusHint('Trace a full circle!');
      angleProgressRef.current = 0;
      lastAngleRef.current = null;
      setFanProgress(0);
      fanRotation.value = 0;
      return;
    }
    if (mode === 'ropeTiming') {
      setPhase('play');
      phaseRef.current = 'play';
      setStatusHint('Swipe when the rope peaks!');
      startRopeSwing();
      return;
    }
    if (mode === 'musicSwing') {
      setPhase('listen');
      phaseRef.current = 'listen';
      setStatusHint('Listen to the beats…');
      musicSwingsRef.current = 0;
      objX.value = P.pendulumCenterXPct;
      beatTimerRef.current = setTimeout(() => playMusicBeats(1), 400);
    }
  }, [fanRotation, mode, objScale, objX, objY, playMusicBeats, runDemoSwing, startAnalyticsRound, startRopeSwing, tier]);

  useEffect(() => {
    if (round === 1) {
      resetAnalytics();
      speakTTS(ttsIntro, 0.78);
    }
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers, resetAnalytics]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const checkPendulumCopy = useCallback(
    (deltaX: number) => {
      if (Math.abs(deltaX) <= 40) return;
      const dir: SwingDir = deltaX < 0 ? 'left' : 'right';
      if (userLastDirRef.current && userLastDirRef.current !== dir) {
        userDirChangesRef.current++;
        userLastDirRef.current = dir;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (userDirChangesRef.current >= pendulumNeededRef.current) {
          const swingScore = Math.min(100, 70 + userDirChangesRef.current * 8);
          completeRound({ swing: swingScore, tracking: swingScore, smoothness: swingScore });
        }
      } else if (!userLastDirRef.current) {
        userLastDirRef.current = dir;
      }
    },
    [completeRound],
  );

  const onPanBegin = useCallback(
    (x: number, y: number) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      panStartX.current = x;
      panStartY.current = y;
      panDistRef.current = 0;
      panTxRef.current = 0;
      panTyRef.current = 0;
      userStartXPctRef.current = objX.value;

      if (mode === 'fanMotion' && phaseRef.current === 'play') {
        const cx = playCenterX.current;
        const cy = playCenterY.current;
        const dx = x - cx;
        const dy = y - cy;
        lastAngleRef.current = Math.atan2(dy, dx);
        angleProgressRef.current = 0;
        setFanProgress(0);
      }
    },
    [mode, objX],
  );

  const onPanUpdate = useCallback(
    (x: number, y: number, tx: number, ty: number) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      panDistRef.current = swipeDistance(tx, ty);
      panTxRef.current = tx;
      panTyRef.current = ty;

      if (mode === 'pendulumCopy' && phaseRef.current === 'copy') {
        const basePct = userStartXPctRef.current;
        const deltaPct = (tx / playW.current) * 100;
        const next = Math.max(
          P.pendulumCenterXPct - P.swingDistancePct,
          Math.min(P.pendulumCenterXPct + P.swingDistancePct, basePct + deltaPct),
        );
        objX.value = next;
        checkPendulumCopy(tx);
        return;
      }

      if (mode === 'monkeySwing' && phaseRef.current === 'play') {
        const newXPct = (x / playW.current) * 100;
        const newYPct = (y / playH.current) * 100;
        objX.value = Math.max(10, Math.min(90, newXPct));
        objY.value = Math.max(18, Math.min(82, newYPct));
        objRotate.value = (Math.atan2(ty, tx) * 180) / Math.PI;
        return;
      }

      if (mode === 'fanMotion' && phaseRef.current === 'play' && lastAngleRef.current !== null) {
        const dx = x - playCenterX.current;
        const dy = y - playCenterY.current;
        const currentAngle = Math.atan2(dy, dx);
        const diff = normalizeAngleDelta(currentAngle - lastAngleRef.current);
        if (Math.abs(diff) > 0.08) {
          angleProgressRef.current += Math.abs(diff);
          const prog = Math.min(1, angleProgressRef.current / (2 * Math.PI));
          setFanProgress(prog);
          fanRotation.value = (angleProgressRef.current * 180) / Math.PI;
          lastAngleRef.current = currentAngle;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          if (prog >= fanMinRef.current && !roundCompleteRef.current) {
            const circ = scoreCircleProgress(prog, fanMinRef.current);
            completeRound({ circular: circ, smoothness: circ, motor: circ });
          }
        }
        return;
      }

      if (mode === 'musicSwing' && phaseRef.current === 'swing') {
        const newXPct = (x / playW.current) * 100;
        objX.value = Math.max(22, Math.min(78, newXPct));
      }
    },
    [checkPendulumCopy, completeRound, fanRotation, mode, objRotate, objX, objY],
  );

  const onPanEnd = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const dist = panDistRef.current;

    if (mode === 'pendulumCopy' && phaseRef.current === 'copy') {
      objX.value = withTiming(P.pendulumCenterXPct, { duration: 280 });
      return;
    }

    if (mode === 'monkeySwing' && phaseRef.current === 'play') {
      const minPx = monkeyMinSwipePx(tier);
      const { ok, dir, score: diagScore } = isDiagonalSwipe(panTxRef.current, panTyRef.current, minPx);
      const expected = vineSequenceRef.current[vineStepRef.current];
      const dirOk = ok && (tier < 3 || dir === expected);
      if (dirOk) {
        monkeySwingsRef.current++;
        vineStepRef.current++;
        const next = vineSequenceRef.current[vineStepRef.current];
        if (tier >= 3) setVineTarget(next ?? null);
        if (monkeySwingsRef.current >= vineSequenceRef.current.length) {
          completeRound({ swing: diagScore, motor: diagScore, tracking: diagScore });
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          speakTTS(
            tier >= 3 && next ? `Swipe ${diagonalArrow(next)}!` : ttsSwingMore,
            0.78,
          ).catch(() => {});
          roundTimerRef.current = setTimeout(() => {
            objX.value = withTiming(P.monkeyStartXPct, { duration: 350 });
            objY.value = withTiming(P.monkeyStartYPct, { duration: 350 });
            objRotate.value = withTiming(0, { duration: 350 });
          }, 320);
        }
      } else {
        showWarn(ok ? `Swipe ${expected ? diagonalArrow(expected) : 'diagonally'}!` : ttsSwipeMore);
        objX.value = withTiming(P.monkeyStartXPct, { duration: 280 });
        objY.value = withTiming(P.monkeyStartYPct, { duration: 280 });
        objRotate.value = withTiming(0, { duration: 280 });
      }
      return;
    }

    if (mode === 'fanMotion' && phaseRef.current === 'play') {
      if (angleProgressRef.current / (2 * Math.PI) < fanMinRef.current) {
        showWarn(ttsCircleMore);
        fanRotation.value = withTiming(0, { duration: 280 });
        angleProgressRef.current = 0;
        lastAngleRef.current = null;
        setFanProgress(0);
      }
      return;
    }

    if (mode === 'ropeTiming' && phaseRef.current === 'play') {
      if (dist < swipeThresholdPx(tier)) {
        showWarn(ttsSwipeMore);
        return;
      }
      const now = Date.now();
      const sincePeak = Math.abs(now - lastPeakTimeRef.current);
      const window = ropeTimingWindowMs(tier);
      const { grade, score: timingScore } = scorePeakTiming(sincePeak, window);
      if (grade !== 'miss') {
        completeRound({ timing: timingScore, tracking: timingScore, motor: timingScore });
      } else {
        showWarn(ttsTimingMiss);
      }
      return;
    }

    if (mode === 'musicSwing' && phaseRef.current === 'swing') {
      if (dist < swipeThresholdPx(tier)) {
        showWarn(ttsSwipeMore);
        objX.value = withTiming(P.pendulumCenterXPct, { duration: 250 });
        return;
      }
      const now = Date.now();
      const interval = musicIntervalRef.current;
      const tol = musicToleranceRef.current;
      if (onBeat(now, lastBeatTimeRef.current, interval, tol)) {
        musicSwingsRef.current++;
        const since = (now - lastBeatTimeRef.current) % interval;
        const diff = Math.min(since, interval - since);
        const rhythmScore = scoreBeatTiming(diff, tol);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        if (musicSwingsRef.current >= musicNeededRef.current) {
          completeRound({ rhythm: rhythmScore, swing: rhythmScore, tracking: rhythmScore });
        } else {
          lastBeatTimeRef.current = now;
          setMusicBeat(musicSwingsRef.current + 1);
        }
      } else {
        showWarn(ttsBeatMiss);
        objX.value = withTiming(P.pendulumCenterXPct, { duration: 250 });
      }
    }
  }, [
    completeRound,
    mode,
    objRotate,
    objX,
    objY,
    showWarn,
    tier,
    ttsBeatMiss,
    ttsCircleMore,
    ttsSwingMore,
    ttsSwipeMore,
    ttsTimingMiss,
  ]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => onPanBegin(e.x, e.y))
    .onUpdate((e) => onPanUpdate(e.x, e.y, e.translationX, e.translationY))
    .onEnd(() => onPanEnd());

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🌴 Jungle Celebration Festival!\n🔄 ${a.swingAccuracy}% · 🌀 ${a.circularAccuracy}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.coordinationScore}
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
  if (done) return null;

  const showDemo = mode === 'pendulumCopy' && phase === 'watch';
  const showObject =
    roundActive &&
    (mode === 'pendulumCopy' ? phase === 'copy' : mode !== 'fanMotion' && mode !== 'ropeTiming');
  const showFan = roundActive && mode === 'fanMotion';
  const showRope = roundActive && mode === 'ropeTiming';

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
          <View style={[styles.statPill, styles.coinPill, { borderColor: T.statBorder }]}>
            <Text>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {roundActive && <SwingGuideBadge visible label={T.hintText} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            playCenterX.current = e.nativeEvent.layout.width / 2;
            playCenterY.current = e.nativeEvent.layout.height * (P.fanCenterYPct / 100);
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {mode === 'musicSwing' && (phase === 'listen' || phase === 'swing') && (
            <RhythmSwingCue
              visible
              phase={phase === 'listen' ? 'listen' : 'swing'}
              beatScale={beatScale}
              beat={musicBeat}
              total={musicTotal}
            />
          )}

          {mode === 'monkeySwing' && roundActive && (
            <VineTargets visible target={vineTarget} />
          )}

          {showDemo && (
            <>
              <Text style={[styles.demoLabel, { color: T.accentDark }]}>Watch</Text>
              <Animated.View style={[styles.object, demoStyle]}>
                <Text style={styles.objectEmoji}>{T.demoEmoji ?? T.objectEmoji}</Text>
              </Animated.View>
            </>
          )}

          {showFan && (
            <>
              <CircleProgressRing progress={fanProgress} accent={T.accent} label="Spin" />
              <Animated.View style={[styles.object, fanStyle]}>
                <Text style={styles.objectEmoji}>{T.objectEmoji}</Text>
              </Animated.View>
            </>
          )}

          {showRope && (
            <View style={styles.ropeWrap}>
              <View style={[styles.ropeAnchor, { backgroundColor: T.accent }]} />
              <Animated.View style={[styles.ropeArm, ropeStyle]}>
                <View style={[styles.ropeLine, { backgroundColor: T.accentDark }]} />
                <Text style={styles.ropeEmoji}>{T.objectEmoji}</Text>
              </Animated.View>
            </View>
          )}

          {showObject && (
            <Animated.View style={[styles.object, objStyle]}>
              <Text style={styles.objectEmoji}>{T.objectEmoji}</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again!</Text>
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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  demoLabel: { position: 'absolute', alignSelf: 'center', top: '18%', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  object: { position: 'absolute', width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  objectEmoji: { fontSize: 64 },
  ropeWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: '8%' },
  ropeAnchor: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  ropeArm: { alignItems: 'center', transformOrigin: 'top center' as never },
  ropeLine: { width: 3, height: 120, borderRadius: 2 },
  ropeEmoji: { fontSize: 52, marginTop: 4 },
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
});

export default SwingMotionGame;
