/**
 * OT Level 9 · Session 6 · Game 1 — Build The Body (Body Blueprint Workshop)
 *
 * Camera tracks progressive body segment assembly and controlled placement effort.
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
import { BuildBodyOverlay } from '@/components/game/occupational/level9/session6/components/BuildBodyOverlay';
import { BUILD_THE_BODY_THEME, BODY_AWARENESS_SHELL } from '@/components/game/occupational/level9/session6/bodyAwarenessTheme';
import {
  BUILD_BODY_ROUNDS,
  bodyZoneStatus,
  buildBodyMatchScore,
  buildBodyPowerScore,
  mirroredBodyMarkers,
  type BodyBuildRound,
  type ResistanceZoneStatus,
} from '@/components/game/occupational/level9/session6/bodyAwarenessUtils';
import type { FullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { readFullBodyReadout } from '@/components/game/occupational/level9/session3/jointUtils';
import { SESSION9_6_PACING as P } from '@/components/game/occupational/level9/session6/session6Pacing';
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

const T = BUILD_THE_BODY_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Snapped!', 'Perfect segment!', 'Body built!', 'Placement pro!', 'Blueprint master!'];

const EMPTY_READOUT: FullBodyReadout = { arms: { left: null, right: null }, legs: { left: null, right: null } };

type Phase = 'intro' | 'calibrate' | 'play';

type BodyMarkers = {
  leftElbow: { x: number; y: number } | null;
  rightElbow: { x: number; y: number } | null;
  leftWrist: { x: number; y: number } | null;
  rightWrist: { x: number; y: number } | null;
  leftKnee: { x: number; y: number } | null;
  rightKnee: { x: number; y: number } | null;
  leftAnkle: { x: number; y: number } | null;
  rightAnkle: { x: number; y: number } | null;
};

const EMPTY_MARKERS: BodyMarkers = {
  leftElbow: null,
  rightElbow: null,
  leftWrist: null,
  rightWrist: null,
  leftKnee: null,
  rightKnee: null,
  leftAnkle: null,
  rightAnkle: null,
};

const BuildTheBodyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [snaps, setSnaps] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [roundDef, setRoundDef] = useState<BodyBuildRound>(BUILD_BODY_ROUNDS[0]!);
  const [readout, setReadout] = useState<FullBodyReadout>(EMPTY_READOUT);
  const [buildPower, setBuildPower] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [trunkScore, setTrunkScore] = useState(0);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [quality, setQuality] = useState(0);
  const [zoneStatus, setZoneStatus] = useState<ResistanceZoneStatus>('light');
  const [holdProgress, setHoldProgress] = useState(0);
  const [snapProgress, setSnapProgress] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [markers, setMarkers] = useState<BodyMarkers>(EMPTY_MARKERS);

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
  const roundDefRef = useRef<BodyBuildRound>(BUILD_BODY_ROUNDS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const snappingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastAtTargetRef = useRef(0);
  const snapStartRef = useRef(0);
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
  const lastHeavyRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const targetForRound = useCallback(
    (r: number) => P.buildTargets[Math.min(r, P.buildTargets.length - 1)] ?? 0.62,
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
    const avgBuild = powerCountRef.current > 0 ? powerSumRef.current / powerCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgBuild * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 20 + avgBuild * 86 + moveQuality * 66 + zoneAccuracy * 38);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'build-the-body',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgBodyBuild: Math.round(avgBuild * 100),
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
      const def = BUILD_BODY_ROUNDS[Math.min(r, BUILD_BODY_ROUNDS.length - 1)] ?? BUILD_BODY_ROUNDS[0]!;
      roundRef.current = r;
      roundDefRef.current = def;
      setRound(r);
      setRoundDef(def);
      holdStartRef.current = 0;
      lastAtTargetRef.current = 0;
      snapStartRef.current = 0;
      peakPowerRef.current = 0;
      previewingRef.current = true;
      snappingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setSnapping(false);
      setSnapProgress(0);
      setHoldProgress(0);
      setBuildPower(0);
      setMatchScore(0);
      setZoneStatus('light');
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(`${def.name}! Build the ${def.segmentLabel} segment.`, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.buildCue);
        setCoachCue(T.hintText);
        speakTTS(T.voiceBuild, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.buildPreviewMs);
    },
    [schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    snappingRef.current = false;
    setSnapping(false);
    setSnapProgress(0);
    setHoldProgress(0);
    setBanner('');

    powerSumRef.current += peakPowerRef.current;
    powerCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    recordHold(P.buildHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setSnaps((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSnap = useCallback(() => {
    if (doneRef.current || snappingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    snappingRef.current = true;
    setSnapping(true);
    snapStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('SNAPPED!');
    speakTTS(T.voiceSnap, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    schedule(() => finishRound(), P.buildSnapMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const def = roundDefRef.current;
    const target = targetForRound(roundRef.current);
    const band = P.buildBandHalf;

    if (snappingRef.current) {
      const sp = clamp01((now - snapStartRef.current) / P.buildSnapMs);
      setSnapProgress(sp);
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
        const t = clamp01(elapsed / P.fallbackBuildMs);
        const p = clamp01(target * (0.5 + t * 0.55));
        const match = clamp01(0.48 + t * 0.46);
        const status = bodyZoneStatus(p, target, band);
        setBuildPower(p);
        setMatchScore(match);
        setTrunkScore(match);
        setArmsScore(match);
        setLegsScore(match);
        setReadout(readFullBodyReadout(m));
        setZoneStatus(status);
        setQuality(0.84);
        if (p > peakPowerRef.current) peakPowerRef.current = p;
        if (status === 'zone' && match >= P.buildMatchMin) {
          const zoneElapsed = Math.max(0, elapsed - P.fallbackBuildMs * 0.48);
          const prog = clamp01(zoneElapsed / P.buildHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginSnap();
        } else {
          setHoldProgress(0);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.84 });
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
    const bodyMarkers = mirroredBodyMarkers(m);
    setMarkers(bodyMarkers);

    if (!fullBodyVisible) {
      setCoachCue(T.positionCue);
      setBuildPower(0);
      setMatchScore(0);
      setZoneStatus('light');
      setHoldProgress(0);
      setReadout(EMPTY_READOUT);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, 0.14);
    const controlled = clamp01(1 - Math.max(0, intensity - 0.5) / 0.5);
    const match = buildBodyMatchScore(m, def, postureBaseRef.current, P.buildTolerance);
    const p = buildBodyPowerScore(m, def, postureBaseRef.current, forceBaseRef.current, P.buildTolerance, controlled);
    const status = bodyZoneStatus(p, target, band);
    const q = clamp01((positioned ? 0.42 : 0.2) + 0.38 * controlled + 0.2 * (status === 'zone' ? 1 : p));
    setBuildPower(p);
    setMatchScore(match.score);
    setTrunkScore(match.trunkScore);
    setArmsScore(match.armsScore);
    setLegsScore(match.legsScore);
    setReadout(match.readout);
    setZoneStatus(status);
    setQuality(q);
    if (p > peakPowerRef.current) peakPowerRef.current = p;

    if (match.score < P.buildMatchMin) {
      if (def.highlight === 'trunk') setCoachCue(T.trunkCue);
      else if (def.highlight === 'arms') setCoachCue(T.armsCue);
      else setCoachCue(T.legsCue);
    } else if (status === 'heavy') {
      setCoachCue(T.heavyCue);
      if (now - lastHeavyRef.current > 2200) {
        lastHeavyRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } else if (status === 'light') {
      setCoachCue(T.lightCue);
    } else {
      setCoachCue(T.hintText);
    }

    if (roundActiveRef.current) {
      totalTicksRef.current += 1;
      if (status === 'zone' && match.score >= P.buildMatchMin) zoneTicksRef.current += 1;

      if (status === 'zone' && match.score >= P.buildMatchMin) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastAtTargetRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.buildHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginSnap();
      } else if (status === 'heavy' || match.score < P.buildMatchMin || now - lastAtTargetRef.current > P.holdGraceMs) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: false, quality: q });
    prevMetricsRef.current = m;
  }, [beginSnap, recordPostureBreak, recordTick, targetForRound]);

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
    setSnaps(0);
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
      'Stand tall with your full body visible. I will learn your pose before Body Blueprint Workshop begins!',
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
        setCoachCue('Camera not allowed — playing guided body build mode.');
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

  const workshopProgress = completedCount / totalRounds;

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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: BODY_AWARENESS_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: BODY_AWARENESS_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧩 {BODY_AWARENESS_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: BODY_AWARENESS_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: BODY_AWARENESS_SHELL.statLabel }]}>Part</Text>
              <Text style={[styles.statValue, { color: BODY_AWARENESS_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: BODY_AWARENESS_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🧩</Text>
              <Text style={[styles.statValue, { color: BODY_AWARENESS_SHELL.statValue }]}>{snaps}</Text>
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
              <BuildBodyOverlay
                theme={T}
                roundDef={roundDef}
                readout={readout}
                buildPower={buildPower}
                matchScore={matchScore}
                trunkScore={trunkScore}
                armsScore={armsScore}
                legsScore={legsScore}
                targetPower={targetForRound(round)}
                zoneStatus={zoneStatus}
                holdProgress={holdProgress}
                snapProgress={snapProgress}
                snapping={snapping}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                builtCount={completedCount}
                workshopProgress={workshopProgress}
                markers={markers}
                banner={banner}
                quality={quality}
                bandHalf={P.buildBandHalf}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={BODY_AWARENESS_SHELL.sparkleColor} count={26} />
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
                    ? 'Step back so the camera sees your full body — build each body segment to match the blueprint!'
                    : 'Guided mode: follow the coach and practice controlled body segment placement!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Workshop</Text>
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

export default BuildTheBodyGame;
