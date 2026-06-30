/**
 * OT Level 9 · Session 7 · Game 5 — Rhythm Move (Rhythm Movement Stage)
 *
 * Camera tracks beat-synced movement pulses, pose path and groove effort regulation.
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
import { RhythmMoveOverlay } from '@/components/game/occupational/level9/session7/components/RhythmMoveOverlay';
import { RHYTHM_MOVE_THEME, MOVEMENT_CALIBRATION_SHELL } from '@/components/game/occupational/level9/session7/movementCalibrationTheme';
import {
  RHYTHM_MOVE_ROUNDS,
  calibrationZoneStatus,
  rhythmBeatScore,
  rhythmMovePowerScore,
  rhythmPathScore,
  type RhythmMoveRound,
  type CalibrationZoneStatus,
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

const T = RHYTHM_MOVE_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Grooved!', 'Beat master!', 'Rhythm star!', 'In sync!', 'Stage legend!'];

const EMPTY_READOUT: FullBodyReadout = { arms: { left: null, right: null }, legs: { left: null, right: null } };

type Phase = 'intro' | 'calibrate' | 'play';

const RhythmMoveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [grooves, setGrooves] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<RhythmMoveRound>(RHYTHM_MOVE_ROUNDS[0]!);
  const [readout, setReadout] = useState<FullBodyReadout>(EMPTY_READOUT);
  const [rhythmPower, setRhythmPower] = useState(0);
  const [pathScore, setPathScore] = useState(0);
  const [beatScore, setBeatScore] = useState(0);
  const [beatHits, setBeatHits] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatPhase, setBeatPhase] = useState(0);
  const [inBeatWindow, setInBeatWindow] = useState(false);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [pathProgress, setPathProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const [effortStatus, setEffortStatus] = useState<CalibrationZoneStatus>('light');
  const [holdProgress, setHoldProgress] = useState(0);
  const [grooveProgress, setGrooveProgress] = useState(0);
  const [grooving, setGrooving] = useState(false);
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
  const roundDefRef = useRef<RhythmMoveRound>(RHYTHM_MOVE_ROUNDS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const groovingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const grooveStartRef = useRef(0);
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
  const beatHitsRef = useRef(0);
  const hitBeatsRef = useRef<Set<number>>(new Set());
  const lastBeatIndexRef = useRef(-1);
  const lastHeavyRef = useRef(0);
  const lastMissBeatRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const effortForRound = useCallback(
    (r: number) => P.rhythmTargets[Math.min(r, P.rhythmTargets.length - 1)] ?? 0.58,
    [],
  );

  const beatsRequired = useCallback((def: RhythmMoveRound) => Math.ceil(def.beats * P.rhythmBeatsRequired), []);

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
    const avgRhythm = powerCountRef.current > 0 ? powerSumRef.current / powerCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgRhythm * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 22 + avgRhythm * 90 + moveQuality * 70 + zoneAccuracy * 42);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'rhythm-move',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgRhythmMove: Math.round(avgRhythm * 100),
            zoneAccuracy: Math.round(zoneAccuracy * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, router, totalRounds]);

  const resetBeatState = useCallback(() => {
    beatHitsRef.current = 0;
    hitBeatsRef.current = new Set();
    lastBeatIndexRef.current = -1;
    setBeatHits(0);
    setCurrentBeat(0);
    setBeatPhase(0);
    setInBeatWindow(false);
    setBeatScore(0);
    setStageProgress(0);
  }, []);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      const def = RHYTHM_MOVE_ROUNDS[Math.min(r, RHYTHM_MOVE_ROUNDS.length - 1)] ?? RHYTHM_MOVE_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      holdStartRef.current = 0;
      lastAtTargetRef.current = 0;
      grooveStartRef.current = 0;
      peakPowerRef.current = 0;
      peakPathRef.current = 0;
      previewingRef.current = true;
      groovingRef.current = false;
      roundActiveRef.current = false;
      resetBeatState();
      setPreviewing(true);
      setGrooving(false);
      setGrooveProgress(0);
      setHoldProgress(0);
      setRhythmPower(0);
      setPathScore(0);
      setPathProgress(0);
      setEffortStatus('light');
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(
        `${def.name}! ${def.beats} beats — move on each pulse and match the pose path.`,
        0.85,
      ).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.moveCue);
        setCoachCue(T.hintText);
        speakTTS(T.voiceMove, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.rhythmPreviewMs);
    },
    [resetBeatState, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    groovingRef.current = false;
    setGrooving(false);
    setGrooveProgress(0);
    setHoldProgress(0);
    setBanner('');

    powerSumRef.current += peakPowerRef.current;
    powerCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    recordHold(P.rhythmHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setGrooves((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginGroove = useCallback(() => {
    if (doneRef.current || groovingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    groovingRef.current = true;
    setGrooving(true);
    grooveStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('IN RHYTHM!');
    speakTTS(T.voiceGroove, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.rhythmGrooveMs);
  }, [finishRound, schedule]);

  const updateBeatClock = useCallback(
    (now: number, intensity: number, eStatus: CalibrationZoneStatus) => {
      const def = roundDefRef.current;
      const elapsed = now - roundStartRef.current;
      const beatIdx = Math.min(def.beats - 1, Math.floor(elapsed / def.beatIntervalMs));
      const phaseMs = elapsed % def.beatIntervalMs;
      const phase = def.beatIntervalMs > 0 ? phaseMs / def.beatIntervalMs : 0;
      const inWindow = phaseMs <= P.rhythmBeatWindowMs;

      if (beatIdx !== lastBeatIndexRef.current) {
        lastBeatIndexRef.current = beatIdx;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      const pulsed = intensity >= P.rhythmPulseMin;
      if (inWindow && pulsed && eStatus === 'zone' && !hitBeatsRef.current.has(beatIdx)) {
        hitBeatsRef.current.add(beatIdx);
        beatHitsRef.current = hitBeatsRef.current.size;
        setBeatHits(beatHitsRef.current);
        setBeatScore(rhythmBeatScore(beatHitsRef.current, def.beats));
        setStageProgress(clamp01(beatHitsRef.current / def.beats));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      setCurrentBeat(beatIdx);
      setBeatPhase(phase);
      setInBeatWindow(inWindow);
    },
    [],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const def = roundDefRef.current;
    const effortTarget = effortForRound(roundRef.current);
    const effortBand = P.rhythmBandHalf;

    if (groovingRef.current) {
      const up = clamp01((now - grooveStartRef.current) / P.rhythmGrooveMs);
      setGrooveProgress(up);
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
        const t = clamp01(elapsed / P.fallbackRhythmMs);
        const path = clamp01(0.42 + t * 0.48);
        const beats = Math.min(def.beats, Math.floor(t * def.beats * 1.1));
        const p = clamp01(effortTarget * (0.5 + t * 0.48));
        const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
        beatHitsRef.current = beats;
        setBeatHits(beats);
        setBeatScore(rhythmBeatScore(beats, def.beats));
        setStageProgress(clamp01(beats / def.beats));
        setRhythmPower(p);
        setPathScore(path);
        setArmsScore(path);
        setLegsScore(path);
        setPathProgress(path);
        setEffortStatus(eStatus);
        setReadout(EMPTY_READOUT);
        setQuality(0.85);
        updateBeatClock(now, P.rhythmPulseMin, eStatus);
        if (p > peakPowerRef.current) peakPowerRef.current = p;
        if (path > peakPathRef.current) peakPathRef.current = path;

        const enoughBeats = beats >= beatsRequired(def);
        if (eStatus === 'zone' && path >= P.rhythmReachMin && enoughBeats) {
          const zoneElapsed = Math.max(0, elapsed - P.fallbackRhythmMs * 0.42);
          const prog = clamp01(zoneElapsed / P.rhythmHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginGroove();
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
      setRhythmPower(0);
      setPathScore(0);
      setEffortStatus('light');
      setHoldProgress(0);
      setReadout(EMPTY_READOUT);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.rhythmMotionCeiling);
    const controlled = clamp01(intensity / P.rhythmPulseMin);
    const path = rhythmPathScore(m, def, P.rhythmTolerance);
    const p = rhythmMovePowerScore(
      m,
      def,
      postureBaseRef.current,
      forceBaseRef.current,
      P.rhythmTolerance,
      controlled,
      beatHitsRef.current,
    );
    const eStatus = calibrationZoneStatus(p, effortTarget, effortBand);
    const beatsNow = rhythmBeatScore(beatHitsRef.current, def.beats);
    const q = clamp01((positioned ? 0.36 : 0.14) + 0.3 * path.score + 0.22 * beatsNow + 0.12 * (eStatus === 'zone' ? 1 : p));

    setRhythmPower(p);
    setPathScore(path.score);
    setArmsScore(path.armsScore);
    setLegsScore(path.legsScore);
    setReadout(path.readout);
    setEffortStatus(eStatus);
    setQuality(q);
    if (p > peakPowerRef.current) peakPowerRef.current = p;
    if (path.score > peakPathRef.current) peakPathRef.current = path.score;
    setPathProgress(peakPathRef.current);

    updateBeatClock(now, intensity, eStatus);

    const elapsed = now - roundStartRef.current;
    const phaseMs = elapsed % def.beatIntervalMs;
    const windowOpen = phaseMs <= P.rhythmBeatWindowMs;

    if (!windowOpen && roundActiveRef.current && beatHitsRef.current < beatsRequired(def)) {
      if (now - lastMissBeatRef.current > 2000) {
        lastMissBeatRef.current = now;
        setCoachCue(T.missBeatCue);
      }
    } else if (path.score < P.rhythmReachMin) {
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
      const enoughBeats = beatHitsRef.current >= beatsRequired(def);
      const dual = eStatus === 'zone' && enoughBeats && path.score >= P.rhythmReachMin;
      if (dual) zoneTicksRef.current += 1;

      const canHold = dual;

      if (canHold) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.rhythmHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginGroove();
      } else if (
        eStatus === 'heavy' ||
        path.score < P.rhythmReachMin ||
        beatHitsRef.current < beatsRequired(def) ||
        now - lastAtTargetRef.current > P.holdGraceMs
      ) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: eStatus === 'zone', quality: q });
    prevMetricsRef.current = m;
  }, [beginGroove, beatsRequired, effortForRound, recordPostureBreak, recordTick, updateBeatClock]);

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
    setGrooves(0);
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
      'Stand tall with your full body visible. I will learn your pose before Rhythm Movement Stage begins!',
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
        setCoachCue('Camera not allowed — playing guided rhythm move mode.');
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: MOVEMENT_CALIBRATION_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: MOVEMENT_CALIBRATION_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🥁 {MOVEMENT_CALIBRATION_SHELL.academyLabel}</Text>
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
              <Text style={styles.statEmoji}>🎶</Text>
              <Text style={[styles.statValue, { color: MOVEMENT_CALIBRATION_SHELL.statValue }]}>{grooves}</Text>
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
              <RhythmMoveOverlay
                theme={T}
                roundDef={roundDef}
                readout={readout}
                rhythmPower={rhythmPower}
                pathScore={pathScore}
                beatScore={beatScore}
                beatHits={beatHits}
                currentBeat={currentBeat}
                beatPhase={beatPhase}
                inBeatWindow={inBeatWindow}
                armsScore={armsScore}
                legsScore={legsScore}
                targetEffort={effortForRound(round)}
                effortStatus={effortStatus}
                holdProgress={holdProgress}
                grooveProgress={grooveProgress}
                grooving={grooving}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                grooveCount={completedCount}
                stageProgress={stageProgress}
                pathProgress={pathProgress}
                banner={banner}
                quality={quality}
                effortBandHalf={P.rhythmBandHalf}
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
                    ? 'Step back so the camera sees your full body — pulse on each beat and match the pose path!'
                    : 'Guided mode: follow the beat and practice rhythm movement with controlled effort!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Stage</Text>
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
  academyLabel: { color: '#FBCFE8', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#FBCFE8', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
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
  introText: { color: '#FBCFE8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#F472B6', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default RhythmMoveGame;
