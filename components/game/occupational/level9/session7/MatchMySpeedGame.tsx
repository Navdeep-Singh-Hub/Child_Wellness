/**
 * OT Level 9 · Session 7 · Game 3 — Match My Speed (Pace Match Studio)
 *
 * Camera tracks target pace matching, pose path progress and controlled sync effort.
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
import { MatchMySpeedOverlay } from '@/components/game/occupational/level9/session7/components/MatchMySpeedOverlay';
import { MATCH_MY_SPEED_THEME, MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import {
  MATCH_SPEED_ROUNDS,
  calibrationZoneStatus,
  matchPathScore,
  matchSpeedPowerScore,
  speedMatchAccuracy,
  speedZoneStatus,
  type MatchSpeedRound,
  type CalibrationZoneStatus,
  type SpeedZoneStatus,
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

const T = MATCH_MY_SPEED_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Synced!', 'Pace match!', 'Rhythm pro!', 'Perfect beat!', 'Studio star!'];

const EMPTY_READOUT: FullBodyReadout = { arms: { left: null, right: null }, legs: { left: null, right: null } };

type Phase = 'intro' | 'calibrate' | 'play';

const MatchMySpeedGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [syncs, setSyncs] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<MatchSpeedRound>(MATCH_SPEED_ROUNDS[0]!);
  const [readout, setReadout] = useState<FullBodyReadout>(EMPTY_READOUT);
  const [matchPower, setMatchPower] = useState(0);
  const [pathScore, setPathScore] = useState(0);
  const [speedAccuracy, setSpeedAccuracy] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const [effortStatus, setEffortStatus] = useState<CalibrationZoneStatus>('light');
  const [speedStatus, setSpeedStatus] = useState<SpeedZoneStatus>('slow');
  const [holdProgress, setHoldProgress] = useState(0);
  const [syncedProgress, setSyncedProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
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
  const roundDefRef = useRef<MatchSpeedRound>(MATCH_SPEED_ROUNDS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const syncingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const syncStartRef = useRef(0);
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
  const speedAvgRef = useRef(0);
  const lastHeavyRef = useRef(0);
  const lastSlowRef = useRef(0);
  const lastFastRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const effortForRound = useCallback(
    (r: number) => P.matchTargets[Math.min(r, P.matchTargets.length - 1)] ?? 0.63,
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
    const avgMatch = powerCountRef.current > 0 ? powerSumRef.current / powerCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgMatch * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 22 + avgMatch * 90 + moveQuality * 70 + zoneAccuracy * 42);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'match-my-speed',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgSpeedMatch: Math.round(avgMatch * 100),
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
      const def = MATCH_SPEED_ROUNDS[Math.min(r, MATCH_SPEED_ROUNDS.length - 1)] ?? MATCH_SPEED_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      holdStartRef.current = 0;
      lastAtTargetRef.current = 0;
      syncStartRef.current = 0;
      peakPowerRef.current = 0;
      peakPathRef.current = 0;
      speedAvgRef.current = 0;
      previewingRef.current = true;
      syncingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setSyncing(false);
      setSyncedProgress(0);
      setHoldProgress(0);
      setMatchPower(0);
      setPathScore(0);
      setSpeedAccuracy(0);
      setCurrentSpeed(0);
      setPathProgress(0);
      setEffortStatus('light');
      setSpeedStatus('slow');
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(`${def.name}! Target pace ${Math.round(def.targetSpeed * 100)} percent.`, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.matchCue);
        setCoachCue(T.hintText);
        speakTTS(T.voiceMatch, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.matchPreviewMs);
    },
    [schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    syncingRef.current = false;
    setSyncing(false);
    setSyncedProgress(0);
    setHoldProgress(0);
    setBanner('');

    powerSumRef.current += peakPowerRef.current;
    powerCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    recordHold(P.matchHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setSyncs((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSynced = useCallback(() => {
    if (doneRef.current || syncingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    syncingRef.current = true;
    setSyncing(true);
    syncStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('SYNCED!');
    speakTTS(T.voiceSynced, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.matchSyncedMs);
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
    const effortBand = P.matchBandHalf;
    const speedBand = P.matchSpeedBandHalf;

    if (syncingRef.current) {
      const up = clamp01((now - syncStartRef.current) / P.matchSyncedMs);
      setSyncedProgress(up);
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
        const t = clamp01(elapsed / P.fallbackMatchMs);
        const path = clamp01(0.44 + t * 0.46);
        const speed = clamp01(0.72 + t * 0.2);
        const p = clamp01(effortTarget * (0.52 + t * 0.48));
        const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
        const sStatus: SpeedZoneStatus = 'zone';
        setMatchPower(p);
        setPathScore(path);
        setSpeedAccuracy(speed);
        setCurrentSpeed(def.targetSpeed);
        setArmsScore(path);
        setLegsScore(path);
        setPathProgress(path);
        setEffortStatus(eStatus);
        setSpeedStatus(sStatus);
        setReadout(EMPTY_READOUT);
        setQuality(0.85);
        if (p > peakPowerRef.current) peakPowerRef.current = p;
        if (path > peakPathRef.current) peakPathRef.current = path;
        if (eStatus === 'zone' && path >= P.matchReachMin && speed >= P.matchSpeedMin) {
          const zoneElapsed = Math.max(0, elapsed - P.fallbackMatchMs * 0.45);
          const prog = clamp01(zoneElapsed / P.matchHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginSynced();
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
      setMatchPower(0);
      setPathScore(0);
      setEffortStatus('light');
      setSpeedStatus('slow');
      setHoldProgress(0);
      setReadout(EMPTY_READOUT);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.matchMotionCeiling);
    const speedAcc = speedMatchAccuracy(intensity, def.targetSpeed, speedBand);
    speedAvgRef.current = speedAvgRef.current * 0.88 + speedAcc * 0.12;
    const sStatus = speedZoneStatus(intensity, def.targetSpeed, speedBand);
    const controlled = clamp01(1 - Math.max(0, Math.abs(intensity - def.targetSpeed) - speedBand) / 0.4);
    const path = matchPathScore(m, def, P.matchTolerance);
    const p = matchSpeedPowerScore(
      m,
      def,
      postureBaseRef.current,
      forceBaseRef.current,
      P.matchTolerance,
      controlled,
      intensity,
      speedBand,
    );
    const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
    const dual = eStatus === 'zone' && sStatus === 'zone';
    const q = clamp01(
      (positioned ? 0.38 : 0.16) + 0.3 * controlled + 0.18 * speedAcc + 0.14 * (dual ? 1 : p),
    );
    setMatchPower(p);
    setPathScore(path.score);
    setSpeedAccuracy(speedAcc);
    setCurrentSpeed(intensity);
    setArmsScore(path.armsScore);
    setLegsScore(path.legsScore);
    setReadout(path.readout);
    setEffortStatus(eStatus);
    setSpeedStatus(sStatus);
    setQuality(q);
    if (p > peakPowerRef.current) peakPowerRef.current = p;
    if (path.score > peakPathRef.current) peakPathRef.current = path.score;
    setPathProgress(peakPathRef.current);

    if (sStatus === 'slow') {
      setCoachCue(T.slowCue);
      if (now - lastSlowRef.current > 1800) {
        lastSlowRef.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } else if (sStatus === 'fast') {
      setCoachCue(T.fastCue);
      if (now - lastFastRef.current > 1800) {
        lastFastRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (path.score < P.matchReachMin) {
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
      if (dual && path.score >= P.matchReachMin) zoneTicksRef.current += 1;

      const canHold =
        eStatus === 'zone' &&
        sStatus === 'zone' &&
        path.score >= P.matchReachMin &&
        speedAvgRef.current >= P.matchSpeedMin;

      if (canHold) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.matchHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginSynced();
      } else if (
        eStatus === 'heavy' ||
        sStatus !== 'zone' ||
        path.score < P.matchReachMin ||
        speedAvgRef.current < P.matchSpeedMin ||
        now - lastAtTargetRef.current > P.holdGraceMs
      ) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: sStatus === 'zone', quality: q });
    prevMetricsRef.current = m;
  }, [beginSynced, effortForRound, recordPostureBreak, recordTick]);

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
    setSyncs(0);
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
      'Stand tall with your full body visible. I will learn your pose before Pace Match Studio begins!',
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
        setCoachCue('Camera not allowed — playing guided pace match mode.');
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

  const studioProgress = completedCount / totalRounds;

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
          <Text style={styles.academyLabel}>🎯 {MOVEMENT_CALIBRATION_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: MOVEMENT_CALIBRATION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MOVEMENT_CALIBRATION_SHELL.statLabel }]}>Beat</Text>
              <Text style={[styles.statValue, { color: MOVEMENT_CALIBRATION_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: MOVEMENT_CALIBRATION_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🎵</Text>
              <Text style={[styles.statValue, { color: MOVEMENT_CALIBRATION_SHELL.statValue }]}>{syncs}</Text>
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
              <MatchMySpeedOverlay
                theme={T}
                roundDef={roundDef}
                readout={readout}
                matchPower={matchPower}
                pathScore={pathScore}
                speedAccuracy={speedAccuracy}
                currentSpeed={currentSpeed}
                armsScore={armsScore}
                legsScore={legsScore}
                targetEffort={effortForRound(round)}
                effortStatus={effortStatus}
                speedStatus={speedStatus}
                holdProgress={holdProgress}
                syncedProgress={syncedProgress}
                syncing={syncing}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                beatCount={completedCount}
                studioProgress={studioProgress}
                pathProgress={pathProgress}
                banner={banner}
                quality={quality}
                effortBandHalf={P.matchBandHalf}
                speedBandHalf={P.matchSpeedBandHalf}
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
                    ? 'Step back so the camera sees your full body — match each target pace and pose path!'
                    : 'Guided mode: follow the coach and practice pace matching with controlled effort!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Studio</Text>
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
  academyLabel: { color: '#99F6E4', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#99F6E4', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
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
  introText: { color: '#99F6E4', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#2DD4BF', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default MatchMySpeedGame;
