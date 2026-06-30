/**
 * OT Level 9 · Session 7 · Game 4 — Speed Control (Speed Governor Arena)
 *
 * Camera tracks speed-corridor bracket regulation, pose path and governor effort.
 * MediaPipe pose on APK + web; guided fallback when no camera.
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
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  averageForceBaseline,
  DEFAULT_FORCE_BASELINE,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import { SpeedControlOverlay } from '@/components/game/occupational/level9/session7/components/SpeedControlOverlay';
import { SPEED_CONTROL_THEME, MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import {
  SPEED_CONTROL_ROUNDS,
  calibrationZoneStatus,
  controlPathScore,
  speedBracketScore,
  speedBracketStatus,
  speedControlPowerScore,
  speedStabilityScore,
  type SpeedControlRound,
  type CalibrationZoneStatus,
  type BracketZoneStatus,
} from '@/components/game/occupational/level9/session7/movementCalibrationUtils';
import type { FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { SESSION9_7_PACING as P } from '@/components/game/occupational/level9/session7/session7Pacing';
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

const T = SPEED_CONTROL_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Sealed!', 'Governor pro!', 'Lane master!', 'Controlled!', 'Arena star!'];

const EMPTY_READOUT: FullBodyReadout = { arms: { left: null, right: null }, legs: { left: null, right: null } };

type Phase = 'intro' | 'calibrate' | 'play';

const SpeedControlGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [seals, setSeals] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<SpeedControlRound>(SPEED_CONTROL_ROUNDS[0]!);
  const [readout, setReadout] = useState<FullBodyReadout>(EMPTY_READOUT);
  const [controlPower, setControlPower] = useState(0);
  const [pathScore, setPathScore] = useState(0);
  const [bracketScore, setBracketScore] = useState(0);
  const [stability, setStability] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const [effortStatus, setEffortStatus] = useState<CalibrationZoneStatus>('light');
  const [bracketStatus, setBracketStatus] = useState<BracketZoneStatus>('below');
  const [holdProgress, setHoldProgress] = useState(0);
  const [sealProgress, setSealProgress] = useState(0);
  const [sealing, setSealing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

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
  const roundDefRef = useRef<SpeedControlRound>(SPEED_CONTROL_ROUNDS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const sealingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const sealStartRef = useRef(0);
  const roundStartRef = useRef(0);
  const powerSumRef = useRef(0);
  const powerCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const zoneTicksRef = useRef(0);
  const totalTicksRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);
  const peakPowerRef = useRef(0);
  const peakPathRef = useRef(0);
  const bracketAvgRef = useRef(0);
  const lastHeavyRef = useRef(0);
  const lastBelowRef = useRef(0);
  const lastAboveRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const effortForRound = useCallback(
    (r: number) => P.controlTargets[Math.min(r, P.controlTargets.length - 1)] ?? 0.65,
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
    const avgControl = powerCountRef.current > 0 ? powerSumRef.current / powerCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgControl * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 22 + avgControl * 90 + moveQuality * 70 + zoneAccuracy * 42);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'speed-control',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgSpeedControl: Math.round(avgControl * 100),
            zoneAccuracy: Math.round(zoneAccuracy * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, router, totalRounds]);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      const def = SPEED_CONTROL_ROUNDS[Math.min(r, SPEED_CONTROL_ROUNDS.length - 1)] ?? SPEED_CONTROL_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      holdStartRef.current = 0;
      lastAtTargetRef.current = 0;
      sealStartRef.current = 0;
      peakPowerRef.current = 0;
      peakPathRef.current = 0;
      bracketAvgRef.current = 0;
      previewingRef.current = true;
      sealingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setSealing(false);
      setSealProgress(0);
      setHoldProgress(0);
      setControlPower(0);
      setPathScore(0);
      setBracketScore(0);
      setStability(0);
      setCurrentSpeed(0);
      setPathProgress(0);
      setEffortStatus('light');
      setBracketStatus('below');
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(
        `${def.name}! Corridor ${Math.round(def.speedMin * 100)} to ${Math.round(def.speedMax * 100)} percent.`,
        0.85,
      ).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.controlCue);
        setCoachCue(T.hintText);
        speakTTS(T.voiceControl, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.controlPreviewMs);
    },
    [schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    sealingRef.current = false;
    setSealing(false);
    setSealProgress(0);
    setHoldProgress(0);
    setBanner('');

    powerSumRef.current += peakPowerRef.current;
    powerCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    recordHold(P.controlHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setSeals((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSealed = useCallback(() => {
    if (doneRef.current || sealingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    sealingRef.current = true;
    setSealing(true);
    sealStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('SEALED!');
    speakTTS(T.voiceSealed, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.controlSealMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const def = roundDefRef.current;
    const effortTarget = effortForRound(roundRef.current);
    const effortBand = P.controlBandHalf;

    if (sealingRef.current) {
      const up = clamp01((now - sealStartRef.current) / P.controlSealMs);
      setSealProgress(up);
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
        const elapsed = now - roundStartRef.current;
        const t = clamp01(elapsed / P.fallbackControlMs);
        const path = clamp01(0.45 + t * 0.45);
        const bracket = clamp01(0.7 + t * 0.22);
        const p = clamp01(effortTarget * (0.52 + t * 0.48));
        const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
        setControlPower(p);
        setPathScore(path);
        setBracketScore(bracket);
        setStability(bracket);
        setCurrentSpeed((def.speedMin + def.speedMax) / 2);
        setArmsScore(path);
        setLegsScore(path);
        setPathProgress(path);
        setEffortStatus(eStatus);
        setBracketStatus('in');
        setReadout(EMPTY_READOUT);
        setQuality(0.85);
        if (p > peakPowerRef.current) peakPowerRef.current = p;
        if (path > peakPathRef.current) peakPathRef.current = path;
        if (eStatus === 'zone' && path >= P.controlReachMin && bracket >= P.controlBracketMin) {
          const zoneElapsed = Math.max(0, elapsed - P.fallbackControlMs * 0.44);
          const prog = clamp01(zoneElapsed / P.controlHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginSealed();
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
    const positioned = fullBodyVisible && uprightScore(m, postureBaseRef.current) >= 0.14;

    if (!fullBodyVisible) {
      setCoachCue(T.positionCue);
      setControlPower(0);
      setPathScore(0);
      setEffortStatus('light');
      setBracketStatus('below');
      setHoldProgress(0);
      setReadout(EMPTY_READOUT);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.controlMotionCeiling);
    const bracket = speedBracketScore(intensity, def.speedMin, def.speedMax);
    const stab = speedStabilityScore(intensity, def.speedMin, def.speedMax, bracket);
    bracketAvgRef.current = bracketAvgRef.current * 0.88 + bracket * 0.12;
    const bStatus = speedBracketStatus(intensity, def.speedMin, def.speedMax);
    const controlled = clamp01(
      1 - Math.max(0, intensity < def.speedMin ? def.speedMin - intensity : intensity > def.speedMax ? intensity - def.speedMax : 0) / 0.35,
    );
    const path = controlPathScore(m, def, P.controlTolerance);
    const p = speedControlPowerScore(m, def, postureBaseRef.current, forceBaseRef.current, P.controlTolerance, controlled, intensity);
    const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
    const dual = eStatus === 'zone' && bStatus === 'in';
    const q = clamp01((positioned ? 0.38 : 0.16) + 0.28 * controlled + 0.2 * bracket + 0.14 * (dual ? 1 : p));
    setControlPower(p);
    setPathScore(path.score);
    setBracketScore(bracket);
    setStability(stab);
    setCurrentSpeed(intensity);
    setArmsScore(path.armsScore);
    setLegsScore(path.legsScore);
    setReadout(path.readout);
    setEffortStatus(eStatus);
    setBracketStatus(bStatus);
    setQuality(q);
    if (p > peakPowerRef.current) peakPowerRef.current = p;
    if (path.score > peakPathRef.current) peakPathRef.current = path.score;
    setPathProgress(peakPathRef.current);

    if (bStatus === 'below') {
      setCoachCue(T.belowCue);
      if (now - lastBelowRef.current > 1800) {
        lastBelowRef.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } else if (bStatus === 'above') {
      setCoachCue(T.aboveCue);
      if (now - lastAboveRef.current > 1800) {
        lastAboveRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (path.score < P.controlReachMin) {
      setCoachCue(T.formCue);
    } else if (eStatus === 'heavy') {
      setCoachCue(T.heavyCue);
      if (now - lastHeavyRef.current > 2200) {
        lastHeavyRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (eStatus === 'light') {
      setCoachCue(T.lightCue);
    } else {
      setCoachCue(T.hintText);
    }

    if (roundActiveRef.current) {
      totalTicksRef.current += 1;
      if (dual && path.score >= P.controlReachMin) zoneTicksRef.current += 1;

      const canHold =
        eStatus === 'zone' &&
        bStatus === 'in' &&
        path.score >= P.controlReachMin &&
        bracketAvgRef.current >= P.controlBracketMin;

      if (canHold) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.controlHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginSealed();
      } else if (
        eStatus === 'heavy' ||
        bStatus !== 'in' ||
        path.score < P.controlReachMin ||
        bracketAvgRef.current < P.controlBracketMin ||
        now - lastAtTargetRef.current > P.holdGraceMs
      ) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: bStatus === 'in', quality: q });
    prevMetricsRef.current = m;
  }, [beginSealed, effortForRound, recordPostureBreak, recordTick]);

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
    setSeals(0);
    setCompletedCount(0);
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
      'Stand tall with your full body visible. I will learn your pose before Speed Governor Arena begins!',
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
        setCoachCue('Camera not allowed — playing guided speed control mode.');
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

  const arenaProgress = completedCount / totalRounds;

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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: MOVEMENT_CALIBRATION_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: MOVEMENT_CALIBRATION_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🎚️ {MOVEMENT_CALIBRATION_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: MOVEMENT_CALIBRATION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MOVEMENT_CALIBRATION_SHELL.statLabel }]}>Lane</Text>
              <Text style={[styles.statValue, { color: MOVEMENT_CALIBRATION_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: MOVEMENT_CALIBRATION_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🛞</Text>
              <Text style={[styles.statValue, { color: MOVEMENT_CALIBRATION_SHELL.statValue }]}>{seals}</Text>
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
              <SpeedControlOverlay
                theme={T}
                roundDef={roundDef}
                readout={readout}
                controlPower={controlPower}
                pathScore={pathScore}
                bracketScore={bracketScore}
                stability={stability}
                currentSpeed={currentSpeed}
                armsScore={armsScore}
                legsScore={legsScore}
                targetEffort={effortForRound(round)}
                effortStatus={effortStatus}
                bracketStatus={bracketStatus}
                holdProgress={holdProgress}
                sealProgress={sealProgress}
                sealing={sealing}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                laneCount={completedCount}
                arenaProgress={arenaProgress}
                pathProgress={pathProgress}
                banner={banner}
                quality={quality}
                effortBandHalf={P.controlBandHalf}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={MOVEMENT_CALIBRATION_SHELL.sparkleColor} count={26} />
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
                    ? 'Step back so the camera sees your full body — stay inside each speed corridor and match the pose!'
                    : 'Guided mode: follow the coach and practice speed corridor control with steady effort!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Arena</Text>
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
  academyLabel: { color: '#BAE6FD', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#BAE6FD', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
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
  introText: { color: '#BAE6FD', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#38BDF8', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default SpeedControlGame;
