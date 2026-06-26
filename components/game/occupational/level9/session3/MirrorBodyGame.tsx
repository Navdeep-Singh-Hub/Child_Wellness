/**
 * OT Level 9 · Session 3 · Game 4 — Mirror Body (Crystal Reflection Hall)
 *
 * Camera tracks full-body joint positions for opposite-side mirroring —
 * when the reflection lifts its left arm, the child lifts their right.
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
import { MirrorBodyOverlay } from '@/components/game/occupational/level9/session3/components/MirrorBodyOverlay';
import { MIRROR_BODY_SHELL, MIRROR_BODY_THEME } from '@/components/game/occupational/level9/session3/jointTheme';
import {
  flipPoseSides,
  matchMirroredBodyPose,
  mirroredBodyMarkers,
  MIRROR_BODY_TARGETS,
  type FullBodyPoseTarget,
  type FullBodyReadout,
} from '@/components/game/occupational/level9/session3/jointUtils';
import { SESSION9_3_PACING as P } from '@/components/game/occupational/level9/session3/session3Pacing';
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

const T = MIRROR_BODY_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Reflected!', 'Opposite match!', 'Crystal clear!', 'Mirror pro!', 'Body synced!'];

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

const MirrorBodyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [reflected, setReflected] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [displayPose, setDisplayPose] = useState<FullBodyPoseTarget>(MIRROR_BODY_TARGETS[0]!);
  const [readout, setReadout] = useState<FullBodyReadout>({ arms: { left: null, right: null }, legs: { left: null, right: null } });
  const [matchScore, setMatchScore] = useState(0);
  const [armsScore, setArmsScore] = useState(0);
  const [legsScore, setLegsScore] = useState(0);
  const [matched, setMatched] = useState(false);
  const [quality, setQuality] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [reflectProgress, setReflectProgress] = useState(0);
  const [reflecting, setReflecting] = useState(false);
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
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const poseRef = useRef<FullBodyPoseTarget>(MIRROR_BODY_TARGETS[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const reflectingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastMatchedRef = useRef(0);
  const reflectStartRef = useRef(0);
  const roundStartRef = useRef(0);
  const accSumRef = useRef(0);
  const accCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);
  const peakAccRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const poseForRound = useCallback(
    (r: number) => MIRROR_BODY_TARGETS[Math.min(r, MIRROR_BODY_TARGETS.length - 1)] ?? MIRROR_BODY_TARGETS[0]!,
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
    const mirrorAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + mirrorAcc * 0.3 + moveQuality * 0.2) * 100);
    const xp = Math.round(completed * 25 + mirrorAcc * 102 + moveQuality * 74);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'mirror-body',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            mirrorMatchAccuracy: Math.round(mirrorAcc * 100),
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
      const pose = poseForRound(r);
      roundRef.current = r;
      poseRef.current = pose;
      setRound(r);
      setDisplayPose(pose);
      holdStartRef.current = 0;
      lastMatchedRef.current = 0;
      reflectStartRef.current = 0;
      peakAccRef.current = 0;
      previewingRef.current = true;
      reflectingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setReflecting(false);
      setReflectProgress(0);
      setHoldProgress(0);
      setMatchScore(0);
      setArmsScore(0);
      setLegsScore(0);
      setMatched(false);
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(`Mirror ${pose.name}!`, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        previewingRef.current = false;
        setPreviewing(false);
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.mirrorCue);
        setCoachCue(T.oppositeCue);
        speakTTS(T.voiceMirror, 0.85).catch(() => {});
        Haptics.selectionAsync().catch(() => {});
      }, P.mirrorPreviewMs);
    },
    [poseForRound, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    reflectingRef.current = false;
    setReflecting(false);
    setReflectProgress(0);
    setHoldProgress(0);
    setBanner('');

    accSumRef.current += peakAccRef.current;
    accCountRef.current += 1;
    completedRef.current += 1;
    setCompletedCount(completedRef.current);
    recordHold(P.mirrorHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setReflected((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginReflect = useCallback(() => {
    if (doneRef.current || reflectingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    reflectingRef.current = true;
    setReflecting(true);
    reflectStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('REFLECTED!');
    speakTTS(T.voiceReflect, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    schedule(() => finishRound(), P.mirrorReflectMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const display = poseRef.current;
    const tol = P.mirrorBodyTolerance;

    if (reflectingRef.current) {
      const rp = clamp01((now - reflectStartRef.current) / P.mirrorReflectMs);
      setReflectProgress(rp);
      recordTick(dt, { upright: true, still: false, quality: 0.92 });
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
        const t = clamp01(elapsed / P.fallbackMirrorMs);
        const expected = flipPoseSides(display);
        const axisSum =
          expected.leftRaise +
          expected.rightRaise +
          expected.leftElbow +
          expected.rightElbow +
          expected.leftLift +
          expected.rightLift +
          expected.leftKnee +
          expected.rightKnee;
        const fScore = clamp01(axisSum * 0.06 * (0.55 + t * 0.5));
        const fArms = clamp01(
          (expected.leftRaise + expected.rightRaise + expected.leftElbow + expected.rightElbow) * 0.1 * (0.55 + t * 0.5),
        );
        const fLegs = clamp01(
          (expected.leftLift + expected.rightLift + expected.leftKnee + expected.rightKnee) * 0.1 * (0.55 + t * 0.5),
        );
        const isMatch = t >= 0.54 && fScore >= 0.68;
        const blend = 0.58 + t * 0.42;
        setReadout({
          arms: {
            left: { raise: expected.leftRaise * blend, elbow: expected.leftElbow * blend },
            right: { raise: expected.rightRaise * blend, elbow: expected.rightElbow * blend },
          },
          legs: {
            left: { lift: expected.leftLift * blend, knee: expected.leftKnee * blend },
            right: { lift: expected.rightLift * blend, knee: expected.rightKnee * blend },
          },
        });
        setMatchScore(fScore);
        setArmsScore(fArms);
        setLegsScore(fLegs);
        setMatched(isMatch);
        setMarkers({
          leftElbow: { x: 0.35, y: 0.38 - t * 0.08 },
          rightElbow: { x: 0.65, y: 0.38 - t * 0.08 },
          leftWrist: { x: 0.3, y: 0.48 - t * 0.12 },
          rightWrist: { x: 0.7, y: 0.48 - t * 0.12 },
          leftKnee: { x: 0.42, y: 0.62 - t * 0.1 },
          rightKnee: { x: 0.58, y: 0.62 - t * 0.1 },
          leftAnkle: { x: 0.4, y: 0.78 - t * 0.06 },
          rightAnkle: { x: 0.6, y: 0.78 - t * 0.06 },
        });
        setQuality(0.86);
        if (fScore > peakAccRef.current) peakAccRef.current = fScore;
        accSumRef.current += fScore;
        accCountRef.current += 1;
        if (isMatch) {
          const prog = clamp01((elapsed - P.fallbackMirrorMs * 0.5) / P.mirrorHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginReflect();
        } else {
          setHoldProgress(0);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.86 });
      prevMetricsRef.current = m;
      return;
    }

    const fullBodyVisible =
      m.present &&
      m.leftElbow &&
      m.rightElbow &&
      m.leftWrist &&
      m.rightWrist &&
      m.leftHip &&
      m.rightHip &&
      m.leftKnee &&
      m.rightKnee &&
      m.leftAnkle &&
      m.rightAnkle;
    const positioned = fullBodyVisible && uprightScore(m, baselineRef.current) >= 0.18;
    const bodyMarkers = mirroredBodyMarkers(m);
    setMarkers(bodyMarkers);

    if (!positioned) {
      setCoachCue(T.positionCue);
      setMatchScore(0);
      setArmsScore(0);
      setLegsScore(0);
      setMatched(false);
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, 0.14);
    const controlled = clamp01(1 - Math.max(0, intensity - 0.52) / 0.48);
    const result = matchMirroredBodyPose(m, display, tol);
    const q = clamp01((positioned ? 0.38 : 0.18) + 0.34 * controlled + 0.28 * result.score);
    setReadout(result.readout);
    setMatchScore(result.score);
    setArmsScore(result.armsScore);
    setLegsScore(result.legsScore);
    setMatched(result.ok);
    setQuality(q);
    if (result.score > peakAccRef.current) peakAccRef.current = result.score;

    if (!result.ok) {
      setCoachCue(result.armsScore < result.legsScore ? T.armsCue : T.legsCue);
      setBanner('');
    } else {
      setCoachCue(T.hintText);
      setBanner('');
    }

    if (roundActiveRef.current) {
      accSumRef.current += result.score;
      accCountRef.current += 1;

      if (result.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastMatchedRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.mirrorHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginReflect();
      } else if (now - lastMatchedRef.current > P.holdGraceMs) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: false, quality: q });
    prevMetricsRef.current = m;
  }, [beginReflect, recordPostureBreak, recordTick]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    accSumRef.current = 0;
    accCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setReflected(0);
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
      'Stand tall with your full body visible. I will learn your pose before the Crystal Reflection Hall begins!',
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
        setCoachCue('Camera not allowed — playing guided reflection mode.');
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: MIRROR_BODY_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: MIRROR_BODY_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🪩 {MIRROR_BODY_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: MIRROR_BODY_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MIRROR_BODY_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: MIRROR_BODY_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: MIRROR_BODY_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🪩</Text>
              <Text style={[styles.statValue, { color: MIRROR_BODY_SHELL.statValue }]}>{reflected}</Text>
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
              <MirrorBodyOverlay
                theme={T}
                displayPose={displayPose}
                readout={readout}
                matchScore={matchScore}
                armsScore={armsScore}
                legsScore={legsScore}
                matched={matched}
                holdProgress={holdProgress}
                reflectProgress={reflectProgress}
                reflecting={reflecting}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                mirroredCount={completedCount}
                markers={markers}
                banner={banner}
                quality={quality}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={MIRROR_BODY_SHELL.sparkleColor} count={26} />
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
                    ? 'Step back so the camera sees your full body — mirror each pose with your OPPOSITE side!'
                    : 'Guided mode: follow the coach and practice opposite-side body mirroring!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Enter Hall</Text>
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

export default MirrorBodyGame;
