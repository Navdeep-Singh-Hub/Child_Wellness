/**
 * Superhero Power Academy — OT Level 6 Session 1 shared posture engine.
 *
 * Drives all five Sitting Posture Control games from camera-derived posture
 * metrics (web) or a guided hold-timer fallback (native / no camera).
 *
 * Modes: powerSit · crown · statue · freeze · reach
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { DistractionLayer } from '@/components/game/occupational/level6/session1/components/DistractionLayer';
import { StarTarget } from '@/components/game/occupational/level6/session1/components/StarTarget';
import { TrafficLight, type LightState } from '@/components/game/occupational/level6/session1/components/TrafficLight';
import {
  averageBaseline,
  coachingCue,
  computeMetrics,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotion,
  headStability,
  REACH_ANCHORS,
  REACH_SEQUENCE,
  stillnessFromMotion,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
  type ReachDir,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { SESSION1_PACING } from '@/components/game/occupational/level6/session1/session1Pacing';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { PostureIntroPanel, PostureHUD } from '@/components/game/occupational/level6/session1/shared/PostureUI';
import { PostureBackdrop } from '@/components/game/occupational/level6/session1/shared/PostureVisuals';
import { ThunderForgeBackdrop } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeBackdrop';
import { ThunderForgeCalibration } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeCalibration';
import { ThunderForgeCoach } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeCoach';
import { ThunderForgeHUD } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeHUD';
import { ThunderForgeIntro } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeIntro';
import { ThunderForgeReactorMeter } from '@/components/game/occupational/level6/session1/thunderForge/ThunderForgeReactorMeter';
import { RoyalObservatoryBackdrop } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalObservatoryBackdrop';
import { RoyalObservatoryCalibration } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalObservatoryCalibration';
import { RoyalObservatoryCoach } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalObservatoryCoach';
import { RoyalObservatoryHUD } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalObservatoryHUD';
import { RoyalObservatoryIntro } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalObservatoryIntro';
import { RoyalCrownGauge } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalCrownGauge';
import { RoyalDistractionLayer } from '@/components/game/occupational/level6/session1/royalObservatory/RoyalDistractionLayer';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { friendlyPoseError } from '@/hooks/usePoseDetectionNative';
import { POSTURE_GAME_THEMES, type PostureMode } from '@/components/game/occupational/level6/session1/superheroTheme';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION1_PACING;
const VOICE_PRAISE = ['Great job!', 'Awesome!', 'Keep going!', 'You did it!', 'Super strong!'];

type Phase = 'intro' | 'calibrate' | 'play';

const roundsForMode = (mode: PostureMode): number => {
  switch (mode) {
    case 'powerSit':
      return P.powerSitRounds;
    case 'crown':
      return P.crownRounds;
    case 'statue':
      return P.statueRounds;
    case 'freeze':
      return P.freezeRounds;
    case 'reach':
      return P.reachRounds;
  }
};

export const PostureControlGame: React.FC<{
  mode: PostureMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = POSTURE_GAME_THEMES[mode];
  const S = T.shell;
  const totalRounds = roundsForMode(mode);
  const isThunderForge = mode === 'powerSit';
  const isRoyalObservatory = mode === 'crown';

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const {
    metrics,
    present,
    isDetecting,
    hasCamera,
    cameraSupported,
    permissionGranted,
    error,
    previewContainerId,
    requestCameraAccess,
  } = poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
    recordFreeze,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  // ── UI state ──
  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Per-mode display state
  const [power, setPower] = useState(0);
  const [crownSafePct, setCrownSafePct] = useState(100);
  const [crownRemainSec, setCrownRemainSec] = useState(0);
  const [crownStability, setCrownStability] = useState(1);
  const [stillPct, setStillPct] = useState(100);
  const [light, setLight] = useState<LightState>('off');
  const [reachDir, setReachDir] = useState<ReachDir>('right');
  const [reachCaught, setReachCaught] = useState(false);
  const [distraction, setDistraction] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const camLive = hasCamera && !forceFallback;

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const hasCameraRef = useRef(hasCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  // power-sit
  const powerRef = useRef(0);
  const powerMilestoneRef = useRef(0);
  const crownWarnRef = useRef(false);
  const holdStartRef = useRef<number | null>(null);
  const wasUprightRef = useRef(false);
  // crown / statue
  const safeMsRef = useRef(0);
  const totalMsRef = useRef(0);
  const stillStreakStartRef = useRef<number | null>(null);
  const roundStartRef = useRef(0);
  // freeze
  const freezeExpectRef = useRef<'green' | 'red' | null>(null);
  const freezeHitRef = useRef(0);
  const freezeTotalRef = useRef(0);
  const freezeOnsetRef = useRef(0);
  const freezeReactedRef = useRef<number | null>(null);
  // reach
  const reachActiveRef = useRef(false);
  const reachDirRef = useRef<ReachDir>('right');
  const reachBalanceOkRef = useRef(true);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    camLiveRef.current = camLive;
  }, [camLive]);
  useEffect(() => {
    hasCameraRef.current = hasCamera;
  }, [hasCamera]);

  // ── Helpers ──
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const praise = useCallback(() => {
    const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
    speakTTS(msg, 0.8).catch(() => {});
  }, []);

  const celebrate = useCallback(() => {
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const finalScore = scoreRef.current;
    // Headline accuracy: stars earned vs total opportunities.
    const accuracy = totalRounds > 0 ? Math.round((finalScore / totalRounds) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(finalScore * 22 + snap.avgPostureQuality * 0.4 + snap.uprightPct * 0.3);
    setFinalStats({ correct: finalScore, total: totalRounds, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['sitting-posture', 'core-activation', 'postural-control', 'midline-orientation', 'attention'],
          meta: analyticsMeta(accuracy),
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalRounds]);

  const awardStar = useCallback(
    (earned: boolean) => {
      if (earned) {
        setScore((s) => s + 1);
        setCoins((c) => c + 1);
        celebrate();
        praise();
      }
    },
    [celebrate, praise],
  );

  // ── Round lifecycle ──
  const startRound = useCallback(() => {
    const mode_ = mode;
    roundStartRef.current = Date.now();
    safeMsRef.current = 0;
    totalMsRef.current = 0;
    stillStreakStartRef.current = null;
    holdStartRef.current = null;
    wasUprightRef.current = false;
    prevMetricsRef.current = null;

    if (mode_ === 'powerSit') {
      powerRef.current = 0;
      powerMilestoneRef.current = 0;
      setPower(0);
      setCoachCue(isThunderForge ? 'Charge the reactor — sit tall and still!' : T.hintText);
    } else if (mode_ === 'crown') {
      crownWarnRef.current = false;
      setCrownSafePct(100);
      setCrownRemainSec(P.crownRoundMs / 1000);
      setCoachCue(isRoyalObservatory ? 'Royal watch begins — keep the crown steady!' : 'Hold your head tall and steady!');
      scheduleDistraction(P.crownDistractionEveryMs);
      scheduleRoundTimeout(P.crownRoundMs, () => finishTimedRound('crown'));
    } else if (mode_ === 'statue') {
      setStillPct(100);
      setCoachCue('Freeze like a statue — do not move!');
      scheduleDistraction(P.statueDistractionEveryMs);
      scheduleRoundTimeout(P.statueRoundMs, () => finishTimedRound('statue'));
    } else if (mode_ === 'freeze') {
      runFreezeCommand();
    } else if (mode_ === 'reach') {
      spawnReachTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, T.hintText]);

  const advanceRound = useCallback(() => {
    if (doneRef.current) return;
    if (roundRef.current >= totalRounds) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRound(), P.nextRoundDelayMs);
  }, [endGame, schedule, startRound, totalRounds]);

  // ── Distractions (crown / statue) ──
  const scheduleDistraction = useCallback(
    (everyMs: number) => {
      const fire = () => {
        if (doneRef.current || phaseRef.current !== 'play') return;
        setDistraction((d) => d + 1);
        schedule(fire, everyMs);
      };
      schedule(fire, everyMs);
    },
    [schedule],
  );

  const scheduleRoundTimeout = useCallback(
    (ms: number, fn: () => void) => {
      schedule(fn, ms);
    },
    [schedule],
  );

  const finishTimedRound = useCallback(
    (m: 'crown' | 'statue') => {
      if (doneRef.current) return;
      const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 0;
      recordHold(safeMsRef.current);
      const earned = pct >= 55;
      awardStar(earned);
      setCoachCue(earned
        ? (m === 'crown' ? (isRoyalObservatory ? 'The crown is safe! Royal excellence! 👑' : 'Crown kept safe! 👑') : 'Perfectly still! 🗿')
        : (m === 'crown' && isRoyalObservatory ? 'The crown wobbled — steady your head next watch!' : 'Good try — steady next time!'));
      advanceRound();
    },
    [advanceRound, recordHold, awardStar],
  );

  // ── Freeze (traffic light) ──
  const runFreezeCommand = useCallback(() => {
    if (doneRef.current) return;
    // Yellow: prepare.
    freezeExpectRef.current = null;
    setLight('yellow');
    setCoachCue('Get ready…');
    schedule(() => {
      if (doneRef.current) return;
      const isGreen = Math.random() < 0.5;
      const expect: 'green' | 'red' = isGreen ? 'green' : 'red';
      freezeExpectRef.current = expect;
      freezeHitRef.current = 0;
      freezeTotalRef.current = 0;
      freezeOnsetRef.current = Date.now();
      freezeReactedRef.current = null;
      setLight(expect);
      setCoachCue(expect === 'green' ? 'SIT TALL!' : 'FREEZE — stay still!');
      const dur =
        expect === 'green'
          ? P.freezeGreenMsMin + Math.random() * (P.freezeGreenMsMax - P.freezeGreenMsMin)
          : P.freezeRedMsMin + Math.random() * (P.freezeRedMsMax - P.freezeRedMsMin);
      schedule(() => {
        if (doneRef.current) return;
        const ratio = freezeTotalRef.current > 0 ? freezeHitRef.current / freezeTotalRef.current : camLiveRef.current ? 0 : 1;
        const correct = ratio >= 0.5;
        const reaction = freezeReactedRef.current ? freezeReactedRef.current - freezeOnsetRef.current : undefined;
        recordFreeze(correct, reaction);
        freezeExpectRef.current = null;
        setLight('off');
        awardStar(correct);
        setCoachCue(correct ? 'Perfect!' : 'Watch the light!');
        advanceRound();
      }, dur);
    }, P.freezeYellowMs);
  }, [advanceRound, recordFreeze, awardStar, schedule]);

  // ── Reach (stars) ──
  const spawnReachTarget = useCallback(() => {
    if (doneRef.current) return;
    const dir = REACH_SEQUENCE[(roundRef.current - 1) % REACH_SEQUENCE.length]!;
    reachDirRef.current = dir;
    reachActiveRef.current = true;
    reachBalanceOkRef.current = true;
    setReachDir(dir);
    setReachCaught(false);
    setCoachCue('Reach to the star! 🌟');
    // Fallback / safety: auto-catch on timeout so play never stalls.
    schedule(() => {
      if (doneRef.current || !reachActiveRef.current) return;
      if (!camLiveRef.current) {
        catchStar();
      } else {
        reachActiveRef.current = false;
        setCoachCue('Almost! Try the next star.');
        advanceRound();
      }
    }, P.reachTimeoutMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, advanceRound]);

  const catchStar = useCallback(() => {
    if (doneRef.current || !reachActiveRef.current) return;
    reachActiveRef.current = false;
    setReachCaught(true);
    recordStar();
    awardStar(true);
    if (!reachBalanceOkRef.current) recordPostureBreak();
    setCoachCue('Star caught! Sit back tall.');
    advanceRound();
  }, [advanceRound, recordStar, recordPostureBreak, awardStar]);

  // Guard so power-completion only fires the advance once per round.
  const completedRef = useRef(false);
  const phaseGuardComplete = useCallback((fn: () => void) => {
    if (completedRef.current) return;
    completedRef.current = true;
    fn();
    setTimeout(() => {
      completedRef.current = false;
    }, P.nextRoundDelayMs + 200);
  }, []);

  // ── Main sampling loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;
    const dtSec = dt / 1000;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = camLiveRef.current;

    // Derived signals (camera) or assumed-compliant (fallback).
    const up = cam ? uprightScore(m, base) : 0.85;
    const stab = cam ? headStability(m, base) : 0.85;
    const motion = cam ? frameMotion(prevMetricsRef.current, m) : 0;
    const still = cam ? stillnessFromMotion(motion) : 0.85;
    prevMetricsRef.current = m;

    const isUpright = up >= (mode === 'freeze' ? P.freezeUprightThreshold : P.powerUprightThreshold);
    const isStill = still >= (mode === 'freeze' ? P.freezeStillThreshold : P.statueStillThreshold);

    if (cam && mode !== 'reach') {
      setQuality(mode === 'statue' ? still : mode === 'crown' ? stab : up);
      setCoachCue(m.present ? coachingCue(m, base) : 'Sit so the camera can see your head and shoulders.');
    } else if (cam && mode === 'reach') {
      setQuality(up);
    }

    switch (mode) {
      case 'powerSit': {
        if (cam ? isUpright : true) {
          powerRef.current = Math.min(100, powerRef.current + P.powerFillPerSec * dtSec);
          if (holdStartRef.current === null) holdStartRef.current = now;
          wasUprightRef.current = true;
        } else {
          powerRef.current = Math.max(0, powerRef.current - P.powerDrainPerSec * dtSec);
          if (wasUprightRef.current) {
            recordPostureBreak();
            if (holdStartRef.current) recordHold(now - holdStartRef.current);
            holdStartRef.current = null;
          }
          wasUprightRef.current = false;
        }
        // Fallback fills steadily to complete in fallbackHoldMs.
        if (!cam) powerRef.current = Math.min(100, powerRef.current + (100 / P.fallbackHoldMs) * dt);
        setPower(powerRef.current);
        if (powerRef.current >= 50 && powerMilestoneRef.current < 50) {
          powerMilestoneRef.current = 50;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          if (isThunderForge) setCoachCue('Half power! Keep your core strong!');
        }
        recordTick(dt, { upright: cam ? isUpright : true, still: false, quality: cam ? up : 0.85 });
        if (powerRef.current >= 100) {
          if (holdStartRef.current) recordHold(now - holdStartRef.current);
          phaseGuardComplete(() => {
            awardStar(true);
            setCoachCue(isThunderForge ? 'Reactor cycle complete! ⚡' : 'Power charged! ⚡');
            advanceRound();
          });
        }
        break;
      }
      case 'crown': {
        totalMsRef.current += dt;
        if (cam ? stab >= P.crownStableThreshold : true) safeMsRef.current += dt;
        if (!cam) safeMsRef.current = totalMsRef.current; // fallback: assume steady
        const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 100;
        const remainSec = Math.max(0, (roundStartRef.current + P.crownRoundMs - now) / 1000);
        setCrownSafePct(pct);
        setCrownRemainSec(remainSec);
        setCrownStability(cam ? stab : 0.85);
        if (isRoyalObservatory) {
          if (pct < 35 && !crownWarnRef.current) {
            crownWarnRef.current = true;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setCoachCue('Careful — the crown is tipping!');
          } else if (pct >= 55 && crownWarnRef.current) {
            crownWarnRef.current = false;
            setCoachCue('Beautiful steadiness — the crown glows!');
          }
        }
        recordTick(dt, { upright: isUpright, still: isStill, quality: cam ? stab : 0.85 });
        break;
      }
      case 'statue': {
        totalMsRef.current += dt;
        if (cam ? isStill : true) {
          safeMsRef.current += dt;
          if (stillStreakStartRef.current === null) stillStreakStartRef.current = now;
        } else {
          if (stillStreakStartRef.current) {
            recordHold(now - stillStreakStartRef.current);
            stillStreakStartRef.current = null;
            recordPostureBreak();
          }
        }
        if (!cam) safeMsRef.current = totalMsRef.current;
        const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 100;
        setStillPct(pct);
        recordTick(dt, { upright: isUpright, still: cam ? isStill : true, quality: cam ? still : 0.85 });
        break;
      }
      case 'freeze': {
        const expect = freezeExpectRef.current;
        if (expect) {
          freezeTotalRef.current += 1;
          const ok = expect === 'green' ? isUpright : isStill;
          if (ok) {
            freezeHitRef.current += 1;
            if (freezeReactedRef.current === null) freezeReactedRef.current = now;
          }
          recordTick(dt, { upright: isUpright, still: isStill, quality: cam ? (expect === 'green' ? up : still) : 0.85 });
        }
        break;
      }
      case 'reach': {
        recordTick(dt, { upright: isUpright, still: false, quality: cam ? up : 0.85 });
        if (cam && reachActiveRef.current && m.present) {
          // Track balance during the reach.
          if (up < P.reachRecenterThreshold * 0.6) reachBalanceOkRef.current = false;
          const anchor = REACH_ANCHORS[reachDirRef.current];
          // Mirror wrist x to match the selfie preview the child sees.
          const wrists = [m.leftWrist, m.rightWrist].filter(Boolean) as { x: number; y: number }[];
          for (const w of wrists) {
            const wx = 1 - w.x;
            const d = Math.hypot(wx - anchor.x, w.y - anchor.y);
            if (d <= P.reachTargetRadius) {
              catchStar();
              break;
            }
          }
        }
        break;
      }
    }
  }, [advanceRound, awardStar, catchStar, mode, recordTick, recordHold, recordPostureBreak, phaseGuardComplete]);

  // ── Calibration ──
  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      // Skip straight to guided play.
      resetAnalytics();
      setPhase('play');
      phaseRef.current = 'play';
      lastTickRef.current = 0;
      schedule(() => startRound(), P.roundIntroDelayMs);
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue(isThunderForge ? 'Reactor boot — hold tall like a superhero!' : isRoyalObservatory ? 'Align the crown lens — hold your head tall!' : 'Sit up nice and tall like a superhero!');
    speakTTS(
      isThunderForge
        ? 'Hold still while the forge calibrates your posture!'
        : isRoyalObservatory
          ? 'Hold your head tall while the observatory aligns the crown lens!'
          : 'Sit up nice and tall, and hold still!',
      0.8,
    ).catch(() => {});
    calibSamplesRef.current = [];
    const start = Date.now();
    const sampler = setInterval(() => {
      const m = metricsRef.current;
      if (m.present) calibSamplesRef.current.push(m);
      const prog = Math.min(1, (Date.now() - start) / P.calibrationMs);
      setCalibProgress(prog);
      if (prog >= 1) {
        clearInterval(sampler);
        baselineRef.current =
          calibSamplesRef.current.length >= 4 ? averageBaseline(calibSamplesRef.current) : DEFAULT_BASELINE;
        resetAnalytics();
        setPhase('play');
        phaseRef.current = 'play';
        lastTickRef.current = 0;
        schedule(() => startRound(), P.roundIntroDelayMs);
      }
    }, 120);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [resetAnalytics, cameraSupported, forceFallback, schedule, startRound]);

  // Run the tick loop while playing.
  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [phase, tick]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  // Intro voice + cleanup.
  useEffect(() => {
    speakTTS(T.voiceIntro, 0.8).catch(() => {});
    return () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = useCallback(async () => {
    if (forceFallback) {
      beginCalibration();
      return;
    }
    if (cameraSupported) {
      const granted = await requestCameraAccess();
      if (!granted) {
        setCoachCue('Allow camera access to track your posture.');
        speakTTS('Please allow camera access.', 0.8).catch(() => {});
        return;
      }
      // Allow React to re-render with permission + MediapipeCamera props before calibrating.
      await new Promise((r) => setTimeout(r, 150));
      const deadline = Date.now() + 6000;
      while (!hasCameraRef.current && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!hasCameraRef.current) {
        setCoachCue('Body tracking did not start. Tap Retry or play guided mode.');
        speakTTS('Camera tracking is not ready yet.', 0.8).catch(() => {});
        return;
      }
    }
    beginCalibration();
  }, [beginCalibration, cameraSupported, forceFallback, requestCameraAccess]);

  const handleBack = useCallback(() => {
    setActive(false);
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

  // ── Render ──
  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        message={T.congrats}
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={finalStats.accuracy}
        xpAwarded={finalStats.xp}
        onContinue={() => onComplete?.()}
        onHome={handleBack}
      />
    );
  }

  const charging = phase === 'play' && (quality >= P.powerUprightThreshold || !camLive);
  const showForgeCoach = isThunderForge && (phase === 'play' || phase === 'calibrate');
  const showRoyalCoach = isRoyalObservatory && (phase === 'play' || phase === 'calibrate');
  const useCustomIntro = isThunderForge || isRoyalObservatory;
  const crownRoundSec = P.crownRoundMs / 1000;

  return (
    <View style={styles.root}>
      {isThunderForge ? (
        <ThunderForgeBackdrop reduceMotion={reduceMotion} charging={charging} />
      ) : isRoyalObservatory ? (
        <RoyalObservatoryBackdrop
          reduceMotion={reduceMotion}
          steady={crownStability >= P.crownStableThreshold}
        />
      ) : (
        <PostureBackdrop backdrop={T.backdrop} shell={S} />
      )}
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        {isThunderForge ? (
          <ThunderForgeHUD round={round} totalRounds={totalRounds} score={score} coins={coins} />
        ) : isRoyalObservatory ? (
          <RoyalObservatoryHUD round={round} totalRounds={totalRounds} score={score} coins={coins} />
        ) : (
          <PostureHUD theme={T} round={round} totalRounds={totalRounds} score={score} coins={coins} />
        )}

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            shell={S}
            previewContainerId={previewContainerId}
            cameraSupported={cameraSupported}
            permissionGranted={permissionGranted}
            hasCamera={hasCamera}
            present={present}
            isDetecting={isDetecting}
            calibrating={phase === 'calibrate'}
            quality={quality}
            glowColor={T.glow}
            hero={T.hero}
            coachCue={showForgeCoach || showRoyalCoach ? '' : phase === 'play' || phase === 'calibrate' ? coachCue : ''}
          >
            {phase === 'play' && isThunderForge && (
              <ThunderForgeReactorMeter power={power} charging={charging} reduceMotion={reduceMotion} />
            )}
            {phase === 'play' && isRoyalObservatory && (
              <>
                <RoyalCrownGauge
                  stability={crownStability}
                  safePct={crownSafePct}
                  remainSec={crownRemainSec}
                  totalSec={crownRoundSec}
                  reduceMotion={reduceMotion}
                />
                <RoyalDistractionLayer trigger={distraction} reduceMotion={reduceMotion} />
              </>
            )}
            {phase === 'play' && mode === 'statue' && (
              <>
                <View style={styles.stillBadge} pointerEvents="none">
                  <Text style={styles.stillLabel}>STILLNESS</Text>
                  <Text style={styles.stillValue}>{Math.round(stillPct)}%</Text>
                </View>
                <DistractionLayer trigger={distraction} />
              </>
            )}
            {phase === 'play' && mode === 'freeze' && <TrafficLight state={light} />}
            {phase === 'play' && mode === 'reach' && (
              <StarTarget anchor={REACH_ANCHORS[reachDir]} active={!reachCaught} caught={reachCaught} />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={S.sparkleColor} count={14} />

            {phase === 'calibrate' && isThunderForge && <ThunderForgeCalibration progress={calibProgress} />}
            {phase === 'calibrate' && isRoyalObservatory && <RoyalObservatoryCalibration progress={calibProgress} />}
            {phase === 'calibrate' && !useCustomIntro && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Hold still… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {showForgeCoach && (
          <ThunderForgeCoach
            hint={coachCue}
            power={power}
            round={round}
            totalRounds={totalRounds}
            phase={phase}
          />
        )}

        {showRoyalCoach && (
          <RoyalObservatoryCoach
            hint={coachCue}
            safePct={crownSafePct}
            remainSec={crownRemainSec}
            round={round}
            totalRounds={totalRounds}
            phase={phase}
          />
        )}

        {phase === 'intro' && isThunderForge && (
          <ThunderForgeIntro
            errorText={cameraSupported && error ? friendlyPoseError(error) : undefined}
            cameraSupported={cameraSupported}
            permissionGranted={permissionGranted}
            hasCamera={hasCamera}
            onStart={handleStart}
            onRetry={() => setActive(true)}
            onGuided={() => {
              setForceFallback(true);
              beginCalibration();
            }}
          />
        )}

        {phase === 'intro' && isRoyalObservatory && (
          <RoyalObservatoryIntro
            errorText={cameraSupported && error ? friendlyPoseError(error) : undefined}
            cameraSupported={cameraSupported}
            permissionGranted={permissionGranted}
            hasCamera={hasCamera}
            onStart={handleStart}
            onRetry={() => setActive(true)}
            onGuided={() => {
              setForceFallback(true);
              beginCalibration();
            }}
          />
        )}

        {phase === 'intro' && !useCustomIntro && (
          <PostureIntroPanel
            theme={T}
            errorText={cameraSupported && error ? friendlyPoseError(error) : undefined}
            introText={!cameraSupported ? friendlyPoseError(error) : undefined}
            cameraSupported={cameraSupported}
            permissionGranted={permissionGranted}
            hasCamera={hasCamera}
            onStart={handleStart}
            onRetry={() => setActive(true)}
            onGuided={() => { setForceFallback(true); beginCalibration(); }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  stageWrap: { flex: 1, marginTop: 10, marginBottom: 8 },
  stillBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(14,116,144,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  stillLabel: { color: '#CFFAFE', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  stillValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '70%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(15,12,41,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
});

export default PostureControlGame;
