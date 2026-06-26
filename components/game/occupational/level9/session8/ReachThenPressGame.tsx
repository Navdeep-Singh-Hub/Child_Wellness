/**
 * OT Level 9 · Session 8 · Game 2 — Reach Then Press (Reach Force Observatory)
 *
 * Camera tracks two-step proprioceptive sequence: reach target pose, then press
 * with steady force. MediaPipe pose on APK + web; guided fallback when no camera.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  averageForceBaseline,
  DEFAULT_FORCE_BASELINE,
  mirroredPushPalms,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import type { FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { ReachThenPressOverlay } from '@/components/game/occupational/level9/session8/components/ReachThenPressOverlay';
import { REACH_THEN_PRESS_THEME, PROPRIO_SEQUENCING_SHELL } from '@/components/game/occupational/level9/session8/proprioceptiveSequencingTheme';
import {
  REACH_THEN_PRESS_ROUNDS,
  pressStepScore,
  reachPressPowerScore,
  reachStepQuality,
  reachStepScore,
  sequenceStepQuality,
  type ReachThenPressRound,
  type SequenceZoneStatus,
} from '@/components/game/occupational/level9/session8/proprioceptiveSequencingUtils';
import { SESSION9_8_PACING as P } from '@/components/game/occupational/level9/session8/session8Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const T = REACH_THEN_PRESS_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Sequence done!', 'Reach-press pro!', 'Perfect sequence!', 'Observatory star!', 'Force master!'];

const EMPTY_READOUT: FullBodyReadout = { arms: { left: null, right: null }, legs: { left: null, right: null } };

type Phase = 'intro' | 'calibrate' | 'play';

const ReachThenPressGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalRounds = P.rounds;

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, permissionGranted, error, previewContainerId } =
    poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [sequences, setSequences] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<ReachThenPressRound>(REACH_THEN_PRESS_ROUNDS[0]!);
  const [stepIndex, setStepIndex] = useState<0 | 1>(0);
  const [effort, setEffort] = useState(0);
  const [form, setForm] = useState(0);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [readout, setReadout] = useState<FullBodyReadout>(EMPTY_READOUT);
  const [quality, setQuality] = useState(0);
  const [zoneStatus, setZoneStatus] = useState<SequenceZoneStatus>('light');
  const [holdProgress, setHoldProgress] = useState(0);
  const [completeProgress, setCompleteProgress] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [leftHand, setLeftHand] = useState<{ x: number; y: number } | null>(null);
  const [rightHand, setRightHand] = useState<{ x: number; y: number } | null>(null);
  const [sequenceProgress, setSequenceProgress] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = cameraSupported && !forceFallback;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const postureBaseRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const forceBaseRef = useRef<ForceBaseline>(DEFAULT_FORCE_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const roundDefRef = useRef<ReachThenPressRound>(REACH_THEN_PRESS_ROUNDS[0]!);
  const stepRef = useRef<0 | 1>(0);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const completingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const completeStartRef = useRef(0);
  const stepStartRef = useRef(0);
  const powerSumRef = useRef(0);
  const powerCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const zoneTicksRef = useRef(0);
  const totalTicksRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);
  const peakReachRef = useRef(0);
  const peakPressRef = useRef(0);
  const lastHeavyRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const pressTargetForRound = useCallback(
    (r: number) => P.pressTargets[Math.min(r, P.pressTargets.length - 1)] ?? 0.58,
    [],
  );

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

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const completed = completedRef.current;
    const completion = totalRounds > 0 ? completed / totalRounds : 0;
    const avgSequence = powerCountRef.current > 0 ? powerSumRef.current / powerCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgSequence * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 22 + avgSequence * 90 + moveQuality * 70 + zoneAccuracy * 42);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'reach-then-press',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgReachThenPress: Math.round(avgSequence * 100),
            zoneAccuracy: Math.round(zoneAccuracy * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, router, totalRounds]);

  const beginStep = useCallback((s: 0 | 1) => {
    stepRef.current = s;
    setStepIndex(s);
    holdStartRef.current = 0;
    lastAtTargetRef.current = 0;
    stepStartRef.current = Date.now();
    setHoldProgress(0);
    roundActiveRef.current = true;
    setRoundActive(true);
    setBanner(s === 0 ? T.reachCue : T.pressCue);
    setCoachCue(s === 0 ? T.reachFormCue : T.pressFormCue);
    speakTTS(s === 0 ? T.voiceReach : T.voicePress, 0.85).catch(() => {});
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      const def = REACH_THEN_PRESS_ROUNDS[Math.min(r, REACH_THEN_PRESS_ROUNDS.length - 1)] ?? REACH_THEN_PRESS_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      stepRef.current = 0;
      setStepIndex(0);
      peakReachRef.current = 0;
      peakPressRef.current = 0;
      previewingRef.current = true;
      completingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setCompleting(false);
      setCompleteProgress(0);
      setHoldProgress(0);
      setEffort(0);
      setForm(0);
      setArmsScore(0);
      setLegsScore(0);
      setReadout(EMPTY_READOUT);
      setZoneStatus('light');
      setRoundActive(false);
      setBanner(T.planCue);
      setCoachCue(T.hintText);
      speakTTS(`${def.name}! Reach first, then press the force pad.`, 0.85).catch(() => {});
      if (r === 0) speakTTS(T.voicePlan, 0.8).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        beginStep(0);
      }, P.reachPlanPreviewMs);
    },
    [beginStep, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    completingRef.current = false;
    setCompleting(false);
    setCompleteProgress(0);
    setHoldProgress(0);
    setBanner('');
    roundActiveRef.current = false;
    setRoundActive(false);

    const seqPower = reachPressPowerScore(peakReachRef.current, peakPressRef.current);
    powerSumRef.current += seqPower;
    powerCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    setSequenceProgress(completedRef.current / totalRounds);
    recordHold(P.reachHoldMs + P.pressHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setSequences((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSequenceComplete = useCallback(() => {
    if (doneRef.current || completingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    completingRef.current = true;
    setCompleting(true);
    completeStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('SEQUENCE COMPLETE!');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.reachPressCompleteMs);
  }, [finishRound, schedule]);

  const onStepDone = useCallback(
    (stepPower: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (stepRef.current === 0) {
        if (stepPower > peakReachRef.current) peakReachRef.current = stepPower;
        roundActiveRef.current = false;
        setRoundActive(false);
        setHoldProgress(0);
        setBanner('REACHED! Now press!');
        speakTTS(T.voicePress, 0.9).catch(() => {});
        schedule(() => beginStep(1), P.betweenStepsMs);
      } else {
        if (stepPower > peakPressRef.current) peakPressRef.current = stepPower;
        beginSequenceComplete();
      }
    },
    [beginSequenceComplete, beginStep, schedule],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const s = stepRef.current;
    const r = roundRef.current;
    const def = roundDefRef.current;
    const pressTarget = pressTargetForRound(r);
    const holdMs = s === 0 ? P.reachHoldMs : P.pressHoldMs;
    const fallbackMs = s === 0 ? P.fallbackReachMs : P.fallbackPressMs;

    if (completingRef.current) {
      const up = clamp01((now - completeStartRef.current) / P.reachPressCompleteMs);
      setCompleteProgress(up);
      recordTick(dt, { upright: true, still: false, quality: 0.9 });
      prevMetricsRef.current = m;
      return;
    }

    if (previewingRef.current) {
      recordTick(dt, { upright: true, still: true, quality: 0.7 });
      prevMetricsRef.current = m;
      return;
    }

    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - stepStartRef.current;
        const t = clamp01(elapsed / fallbackMs);
        const f = clamp01(0.44 + t * 0.46);
        const e = s === 0 ? f : clamp01(pressTarget * (0.5 + t * 0.46));
        const status: SequenceZoneStatus =
          s === 0
            ? f >= P.reachReachMin
              ? 'zone'
              : 'light'
            : e >= pressTarget - P.bandHalf && e <= pressTarget + P.bandHalf
              ? 'zone'
              : e < pressTarget - P.bandHalf
                ? 'light'
                : 'heavy';
        setEffort(e);
        setForm(f);
        setZoneStatus(status);
        setArmsScore(f);
        setLegsScore(f);
        setReadout(EMPTY_READOUT);
        setQuality(0.85);
        setLeftHand(null);
        setRightHand(null);
        const power = s === 0 ? f : clamp01(f * 0.45 + e * 0.55);
        if (power > (s === 0 ? peakReachRef.current : peakPressRef.current)) {
          if (s === 0) peakReachRef.current = power;
          else peakPressRef.current = power;
        }
        const canHold = s === 0 ? status === 'zone' : status === 'zone' && f >= P.pressFormMin;
        if (canHold) {
          const zoneElapsed = Math.max(0, elapsed - fallbackMs * 0.44);
          const prog = clamp01(zoneElapsed / holdMs);
          setHoldProgress(prog);
          if (prog >= 1) onStepDone(power);
        } else {
          setHoldProgress(0);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    const fullBodyVisible =
      m.present &&
      m.leftWrist &&
      m.rightWrist &&
      m.leftElbow &&
      m.rightElbow &&
      m.leftHip &&
      m.rightHip &&
      m.leftKnee &&
      m.rightKnee;
    const positioned = fullBodyVisible && uprightScore(m, postureBaseRef.current) >= 0.12;

    if (!fullBodyVisible) {
      setCoachCue(T.positionCue);
      setEffort(0);
      setForm(0);
      setZoneStatus('light');
      setHoldProgress(0);
      setReadout(EMPTY_READOUT);
      setLeftHand(null);
      setRightHand(null);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    if (s === 0) {
      const reach = reachStepScore(m, def, P.reachTolerance, P.reachReachMin);
      const q = reachStepQuality(m, postureBaseRef.current, reach, P.reachReachMin);
      setEffort(reach.effort);
      setForm(reach.form);
      setZoneStatus(reach.status);
      setArmsScore(reach.armsScore);
      setLegsScore(reach.legsScore);
      setReadout(reach.readout);
      setQuality(q);
      setLeftHand(null);
      setRightHand(null);
      if (reach.power > peakReachRef.current) peakReachRef.current = reach.power;

      if (reach.form < P.reachReachMin) {
        setCoachCue(T.reachFormCue);
      } else {
        setCoachCue(T.hintText);
      }

      if (roundActiveRef.current) {
        totalTicksRef.current += 1;
        const canHold = reach.status === 'zone';
        if (canHold) zoneTicksRef.current += 1;
        if (canHold) {
          if (holdStartRef.current === 0) holdStartRef.current = now;
          lastAtTargetRef.current = now;
          const prog = clamp01((now - holdStartRef.current) / holdMs);
          setHoldProgress(prog);
          if (prog >= 1) onStepDone(reach.power);
        } else if (reach.form < P.reachReachMin || now - lastAtTargetRef.current > P.holdGraceMs) {
          holdStartRef.current = 0;
          setHoldProgress(0);
        }
      }

      qualSumRef.current += q;
      qualCountRef.current += 1;
      if (!positioned) recordPostureBreak();
      recordTick(dt, { upright: positioned, still: reach.status === 'zone', quality: q });
      prevMetricsRef.current = m;
      return;
    }

    const press = pressStepScore(m, forceBaseRef.current, pressTarget, P.bandHalf);
    const q = sequenceStepQuality(m, postureBaseRef.current, press, P.pressFormMin);
    const hands = mirroredPushPalms(m);

    setEffort(press.effort);
    setForm(press.form);
    setZoneStatus(press.status);
    setQuality(q);
    setLeftHand(hands.left);
    setRightHand(hands.right);

    if (press.power > peakPressRef.current) peakPressRef.current = press.power;

    if (press.form < P.pressFormMin) {
      setCoachCue(T.pressFormCue);
    } else if (press.status === 'heavy') {
      setCoachCue(T.heavyCue);
      if (now - lastHeavyRef.current > 2200) {
        lastHeavyRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (press.status === 'light') {
      setCoachCue(T.lightCue);
    } else {
      setCoachCue(T.hintText);
    }

    if (roundActiveRef.current) {
      totalTicksRef.current += 1;
      const canHold = press.status === 'zone' && press.form >= P.pressFormMin;
      if (canHold) zoneTicksRef.current += 1;
      if (canHold) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / holdMs);
        setHoldProgress(prog);
        if (prog >= 1) onStepDone(press.power);
      } else if (press.status === 'heavy' || press.form < P.pressFormMin || now - lastAtTargetRef.current > P.holdGraceMs) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: press.status === 'zone', quality: q });
    prevMetricsRef.current = m;
  }, [onStepDone, pressTargetForRound, recordPostureBreak, recordTick]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    powerSumRef.current = 0;
    powerCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    zoneTicksRef.current = 0;
    totalTicksRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setSequences(0);
    setCompletedCount(0);
    setSequenceProgress(0);
    setPhase('play');
    phaseRef.current = 'play';
    startRound(0);
  }, [resetAnalytics, startRound]);

  const beginCalibration = useCallback(() => {
    if (!camLive) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand naturally — I am learning your starting pose.');
    speakTTS(
      'Stand tall with your full body visible. I will learn your pose before Reach Force Observatory begins!',
      0.8,
    ).catch(() => {});
    calibSamplesRef.current = [];
    const start = Date.now();
    const sampler = setInterval(() => {
      const met = metricsRef.current;
      if (met.present) calibSamplesRef.current.push(met);
      const prog = Math.min(1, (Date.now() - start) / P.calibrationMs);
      setCalibProgress(prog);
      if (prog >= 1) {
        clearInterval(sampler);
        postureBaseRef.current =
          calibSamplesRef.current.length >= 4 ? averageBaseline(calibSamplesRef.current) : DEFAULT_BASELINE;
        forceBaseRef.current =
          calibSamplesRef.current.length >= 4
            ? averageForceBaseline(calibSamplesRef.current)
            : DEFAULT_FORCE_BASELINE;
        beginPlay();
      }
    }, 100);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [beginPlay, camLive]);

  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
    const cap = schedule(() => endGame(), P.maxGameMs);
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      clearTimeout(cap);
    };
  }, [phase, tick, schedule, endGame]);

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
    if (cameraSupported && !forceFallback && !permissionGranted) {
      const granted = await poseDetection.requestCameraAccess();
      if (!granted) {
        setCoachCue('Camera not allowed — playing guided reach-then-press mode.');
      }
    }
    beginCalibration();
  }, [beginCalibration, cameraSupported, forceFallback, permissionGranted, poseDetection]);

  const handleBack = useCallback(() => {
    setActive(false);
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

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

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: PROPRIO_SEQUENCING_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: PROPRIO_SEQUENCING_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🎯 {PROPRIO_SEQUENCING_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: PROPRIO_SEQUENCING_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PROPRIO_SEQUENCING_SHELL.statLabel }]}>Seq</Text>
              <Text style={[styles.statValue, { color: PROPRIO_SEQUENCING_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: PROPRIO_SEQUENCING_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🛰️</Text>
              <Text style={[styles.statValue, { color: PROPRIO_SEQUENCING_SHELL.statValue }]}>{sequences}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            previewContainerId={previewContainerId}
            cameraSupported={camLive}
            permissionGranted={permissionGranted}
            hasCamera={hasCamera}
            present={present}
            isDetecting={isDetecting}
            calibrating={phase === 'calibrate'}
            quality={quality}
            glowColor={T.glow}
            hero={T.hero}
            coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
          >
            {phase === 'play' && (
              <ReachThenPressOverlay
                theme={T}
                roundDef={roundDef}
                stepIndex={stepIndex}
                effort={effort}
                form={form}
                armsScore={armsScore}
                legsScore={legsScore}
                readout={readout}
                targetEffort={stepIndex === 1 ? pressTargetForRound(round) : P.reachReachMin}
                zoneStatus={zoneStatus}
                holdProgress={holdProgress}
                completeProgress={completeProgress}
                completing={completing}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                sequenceCount={completedCount}
                sequenceProgress={sequenceProgress}
                leftHand={leftHand}
                rightHand={rightHand}
                banner={banner}
                quality={quality}
                bandHalf={P.bandHalf}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={PROPRIO_SEQUENCING_SHELL.sparkleColor} count={26} />
            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Calibrating… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%`, backgroundColor: T.accent }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {camLive && error && permissionGranted ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.btnRow}>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={() => setActive(true)}>
                    <Text style={styles.primaryBtnText}>Retry Camera</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Play Guided</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.introText}>
                  {camLive
                    ? 'Step back so the camera sees your full body — reach each target pose, then press with steady controlled force!'
                    : 'Guided mode: follow the coach and practice reach-then-press sequences with controlled effort!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Observatory</Text>
                </Pressable>
                {camLive && (
                  <Pressable
                    style={styles.linkBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
                    <Text style={styles.linkText}>No camera? Play guided mode</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  academyLabel: { color: '#93C5FD', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#93C5FD', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '900' },
  statEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(15,23,42,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#93C5FD', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#38BDF8', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default ReachThenPressGame;
