/**
 * OT Level 9 · Session 3 · Game 1 — Robot Arms (Neon Circuit Factory)
 *
 * Camera tracks shoulder raise and elbow bend to match demonstrated robot arm poses.
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
import { RobotArmsOverlay } from '@/components/game/occupational/level9/session3/components/RobotArmsOverlay';
import { ROBOT_ARMS_THEME, ROBOT_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import {
  matchRobotPose,
  mirroredJointMarkers,
  ROBOT_ARM_POSES,
  type RobotArmPose,
  type RobotJointReadout,
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

const T = ROBOT_ARMS_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Joints locked!', 'Robot match!', 'Perfect angles!', 'Calibrated!', 'Factory pro!'];

type Phase = 'intro' | 'calibrate' | 'play';

const RobotArmsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [calibrated, setCalibrated] = useState(0);
  const [targetPose, setTargetPose] = useState<RobotArmPose>(ROBOT_ARM_POSES[0]!);
  const [joints, setJoints] = useState<RobotJointReadout>({ left: null, right: null });
  const [matchScore, setMatchScore] = useState(0);
  const [matched, setMatched] = useState(false);
  const [quality, setQuality] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [calibrateProgress, setCalibrateProgress] = useState(0);
  const [calibrating, setCalibrating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [leftElbow, setLeftElbow] = useState<{ x: number; y: number } | null>(null);
  const [rightElbow, setRightElbow] = useState<{ x: number; y: number } | null>(null);
  const [leftWrist, setLeftWrist] = useState<{ x: number; y: number } | null>(null);
  const [rightWrist, setRightWrist] = useState<{ x: number; y: number } | null>(null);

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
  const poseRef = useRef<RobotArmPose>(ROBOT_ARM_POSES[0]!);
  const roundActiveRef = useRef(false);
  const previewingRef = useRef(false);
  const calibratingRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastMatchedRef = useRef(0);
  const calibrateStartRef = useRef(0);
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
    (r: number) => ROBOT_ARM_POSES[Math.min(r, ROBOT_ARM_POSES.length - 1)] ?? ROBOT_ARM_POSES[0]!,
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
    const jointAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + jointAcc * 0.3 + moveQuality * 0.2) * 100);
    const xp = Math.round(completed * 24 + jointAcc * 100 + moveQuality * 72);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'robot-arms',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            jointMatchAccuracy: Math.round(jointAcc * 100),
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
      setTargetPose(pose);
      holdStartRef.current = 0;
      lastMatchedRef.current = 0;
      calibrateStartRef.current = 0;
      peakAccRef.current = 0;
      previewingRef.current = true;
      calibratingRef.current = false;
      roundActiveRef.current = false;
      setPreviewing(true);
      setCalibrating(false);
      setCalibrateProgress(0);
      setHoldProgress(0);
      setMatchScore(0);
      setMatched(false);
      setRoundActive(false);
      setBanner(T.previewCue);
      setCoachCue(T.previewCue);
      speakTTS(`Copy ${pose.name}!`, 0.85).catch(() => {});

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
      }, P.robotPreviewMs);
    },
    [poseForRound, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    calibratingRef.current = false;
    setCalibrating(false);
    setCalibrateProgress(0);
    setHoldProgress(0);
    setBanner('');

    accSumRef.current += peakAccRef.current;
    accCountRef.current += 1;
    completedRef.current += 1;
    recordHold(P.robotHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setCalibrated((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginCalibrate = useCallback(() => {
    if (doneRef.current || calibratingRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    calibratingRef.current = true;
    setCalibrating(true);
    calibrateStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner('CALIBRATED!');
    speakTTS(T.voiceCalibrate, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    schedule(() => finishRound(), P.robotCalibrateMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const target = poseRef.current;
    const tol = P.robotJointTolerance;

    if (calibratingRef.current) {
      const cp = clamp01((now - calibrateStartRef.current) / P.robotCalibrateMs);
      setCalibrateProgress(cp);
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
        const t = clamp01(elapsed / P.fallbackRobotMs);
        const sim = matchRobotPose(m, target, tol);
        const fScore = clamp01(sim.score * (0.55 + t * 0.5));
        const isMatch = t >= 0.55 && fScore >= 0.78;
        setJoints({
          left: { raise: target.leftRaise * (0.6 + t * 0.4), elbow: target.leftElbow * (0.6 + t * 0.4) },
          right: { raise: target.rightRaise * (0.6 + t * 0.4), elbow: target.rightElbow * (0.6 + t * 0.4) },
        });
        setMatchScore(fScore);
        setMatched(isMatch);
        setLeftElbow({ x: 0.38, y: 0.48 - t * 0.08 });
        setRightElbow({ x: 0.62, y: 0.48 - t * 0.08 });
        setLeftWrist({ x: 0.36, y: 0.56 - t * 0.12 });
        setRightWrist({ x: 0.64, y: 0.56 - t * 0.12 });
        setQuality(0.86);
        if (fScore > peakAccRef.current) peakAccRef.current = fScore;
        accSumRef.current += fScore;
        accCountRef.current += 1;
        if (isMatch) {
          const prog = clamp01((elapsed - P.fallbackRobotMs * 0.5) / P.robotHoldMs);
          setHoldProgress(prog);
          if (prog >= 1) beginCalibrate();
        } else {
          setHoldProgress(0);
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.86 });
      prevMetricsRef.current = m;
      return;
    }

    const positioned =
      m.present &&
      m.leftElbow &&
      m.rightElbow &&
      m.leftWrist &&
      m.rightWrist &&
      uprightScore(m, baselineRef.current) >= 0.2;
    const markers = mirroredJointMarkers(m);
    setLeftElbow(markers.leftElbow);
    setRightElbow(markers.rightElbow);
    setLeftWrist(markers.leftWrist);
    setRightWrist(markers.rightWrist);

    if (!positioned) {
      setCoachCue(T.positionCue);
      setMatchScore(0);
      setMatched(false);
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, 0.14);
    const controlled = clamp01(1 - Math.max(0, intensity - 0.52) / 0.48);
    const result = matchRobotPose(m, target, tol);
    const q = clamp01((positioned ? 0.38 : 0.18) + 0.34 * controlled + 0.28 * result.score);
    setJoints(result.joints);
    setMatchScore(result.score);
    setMatched(result.ok);
    setQuality(q);
    if (result.score > peakAccRef.current) peakAccRef.current = result.score;

    if (!result.ok && result.joints.left && result.joints.right) {
      const lr = Math.abs(result.joints.left.raise - target.leftRaise);
      const rr = Math.abs(result.joints.right.raise - target.rightRaise);
      const le = Math.abs(result.joints.left.elbow - target.leftElbow);
      const re = Math.abs(result.joints.right.elbow - target.rightElbow);
      const worst = Math.max(lr, rr, le, re);
      setCoachCue(worst === lr || worst === rr ? T.raiseCue : T.elbowCue);
      setBanner('');
    } else if (result.ok) {
      setCoachCue(T.hintText);
      setBanner('');
    }

    if (roundActiveRef.current) {
      accSumRef.current += result.score;
      accCountRef.current += 1;

      if (result.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastMatchedRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.robotHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginCalibrate();
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
  }, [beginCalibrate, recordPostureBreak, recordTick]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    accSumRef.current = 0;
    accCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setCalibrated(0);
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
    setCoachCue('Stand with arms relaxed — I am learning your starting pose.');
    speakTTS('Stand tall and relax your arms. I will learn your joints before the robot factory begins!', 0.8).catch(
      () => {},
    );
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
        setCoachCue('Camera not allowed — playing guided robot mode.');
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: ROBOT_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: ROBOT_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🤖 {ROBOT_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: ROBOT_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: ROBOT_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: ROBOT_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: ROBOT_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>⚙️</Text>
              <Text style={[styles.statValue, { color: ROBOT_SHELL.statValue }]}>{calibrated}</Text>
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
              <RobotArmsOverlay
                theme={T}
                targetPose={targetPose}
                joints={joints}
                matchScore={matchScore}
                matched={matched}
                holdProgress={holdProgress}
                calibrateProgress={calibrateProgress}
                calibrating={calibrating}
                previewing={previewing}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                calibratedCount={round}
                leftElbow={leftElbow}
                rightElbow={rightElbow}
                leftWrist={leftWrist}
                rightWrist={rightWrist}
                banner={banner}
                quality={quality}
                tolerance={P.robotJointTolerance}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={ROBOT_SHELL.sparkleColor} count={26} />
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
                    ? 'Stand back so the camera sees your shoulders, elbows and wrists — copy each robot arm pose!'
                    : 'Guided mode: follow the coach and practice robot arm joint matching!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Factory</Text>
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
  academyLabel: { color: '#A5F3FC', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#A5F3FC', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
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
  introText: { color: '#A5F3FC', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#67E8F9', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default RobotArmsGame;
