/**
 * Single-Step Motor Planning — OT Level 8 Session 1 shared engine.
 *
 * Each round: a short PLAN beat, then the child EXECUTES one planned movement to
 * a target detected from the camera (APK + web), with a guided fallback.
 *
 * Modes: touchTarget · reachStar · moveToSpot · launchRocket · placeBox
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
import { MotorTargetOverlay } from '@/components/game/occupational/level8/session1/components/MotorTargetOverlay';
import {
  MOTOR_GAME_THEMES,
  MOTOR_SHELL,
  type Anchor,
  type MotorMode,
} from '@/components/game/occupational/level8/session1/motorTheme';
import { SESSION1_PACING as P } from '@/components/game/occupational/level8/session1/session1Pacing';
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

const VOICE_PRAISE = ['Great move!', 'Perfect plan!', 'Nice reach!', 'You got it!', 'Brilliant!'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Phase = 'intro' | 'calibrate' | 'play';

/** Mirror a wrist x to match the selfie preview the child sees. */
const wristScreens = (m: PostureMetrics): Anchor[] => {
  const out: Anchor[] = [];
  if (m.leftWrist) out.push({ x: 1 - m.leftWrist.x, y: m.leftWrist.y });
  if (m.rightWrist) out.push({ x: 1 - m.rightWrist.x, y: m.rightWrist.y });
  return out;
};
const bodyScreen = (m: PostureMetrics): Anchor => ({ x: 1 - m.shoulderMid.x, y: (m.shoulderMid.y + m.hipMid.y) / 2 });
const dist = (a: Anchor, b: Anchor) => Math.hypot(a.x - b.x, a.y - b.y);

export const MotorPlanGame: React.FC<{
  mode: MotorMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = MOTOR_GAME_THEMES[mode];
  const totalRounds = T.rounds;

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
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [near, setNear] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [handPos, setHandPos] = useState<Anchor | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [stage, setStage] = useState<0 | 1>(0);
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
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);

  const roundRef = useRef(0);
  const stageRef = useRef<0 | 1>(0);
  const roundActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastNearRef = useRef(0);
  const roundStartRef = useRef(0);
  const minDistRef = useRef(1);
  const accSumRef = useRef(0);
  const accCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    camLiveRef.current = camLive;
  }, [camLive]);

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

  /** Resolve the current target anchor (+ source for twoStage). */
  const anchorsForRound = useCallback(
    (r: number, s: 0 | 1): { target: Anchor; source: Anchor | null } => {
      if (T.kind === 'twoStage' && T.pairs && T.pairs.length > 0) {
        const pair = T.pairs[r % T.pairs.length]!;
        return { target: s === 0 ? pair[0] : pair[1], source: pair[0] };
      }
      const a = T.anchors[r % Math.max(1, T.anchors.length)] ?? { x: 0.5, y: 0.3 };
      return { target: a, source: null };
    },
    [T.anchors, T.kind, T.pairs],
  );

  const radiusFor = useCallback(() => {
    if (T.kind === 'body') return P.reachRadius * P.bodyRadiusScale;
    if (T.kind === 'bothHands') return P.reachRadius * P.bothHandsRadiusScale;
    return P.reachRadius;
  }, [T.kind]);

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const completed = completedRef.current;
    const completion = totalRounds > 0 ? completed / totalRounds : 0;
    const reachAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + reachAcc * 0.5) * 100);
    const xp = Math.round(completed * 16 + reachAcc * 100 * 0.4 + moveQuality * 100 * 0.4);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `motor-plan-${mode}` as any,
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            mode,
            reachAccuracy: Math.round(reachAcc * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, mode, router, T.skillTags, T.voiceComplete, totalRounds]);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      roundRef.current = r;
      stageRef.current = 0;
      setStage(0);
      setRound(r);
      minDistRef.current = 1;
      holdStartRef.current = 0;
      lastNearRef.current = 0;
      setHoldProgress(0);
      setNear(false);
      roundActiveRef.current = false;
      setRoundActive(false);
      setBanner(T.planText);
      setCoachCue(T.hintText);
      if (r === 0 || r % 2 === 0) speakTTS(T.voicePlan, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner(T.goText);
        Haptics.selectionAsync().catch(() => {});
        schedule(() => setBanner(''), 950);
      }, P.planDelayMs);
    },
    [schedule, T.goText, T.hintText, T.planText, T.voicePlan],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    setHoldProgress(0);
    setBanner('');

    const acc = clamp01(1 - minDistRef.current / (radiusFor() * 1.6));
    accSumRef.current += acc;
    accCountRef.current += 1;
    completedRef.current += 1;
    recordHold(P.holdToConfirmMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setCoins((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, radiusFor, recordHold, recordStar, schedule, startRound, totalRounds]);

  const advanceToPlace = useCallback(() => {
    stageRef.current = 1;
    setStage(1);
    holdStartRef.current = 0;
    lastNearRef.current = 0;
    roundStartRef.current = Date.now();
    setHoldProgress(0);
    setNear(false);
    setBanner('Now place it! 📥');
    speakTTS('Got it! Now reach over and place the box.', 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    schedule(() => setBanner(''), 1100);
  }, [schedule]);

  const onReachConfirmed = useCallback(() => {
    if (T.kind === 'twoStage' && stageRef.current === 0) {
      advanceToPlace();
      return;
    }
    completeRound();
  }, [T.kind, advanceToPlace, completeRound]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const { target } = anchorsForRound(roundRef.current, stageRef.current);
    const radius = radiusFor();

    // Guided fallback — no live camera. Animate a cursor toward the target and
    // auto-confirm so the game is fully playable without pose tracking.
    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - roundStartRef.current;
        const t = clamp01(elapsed / P.fallbackReachMs);
        const start = { x: 0.5, y: 0.82 };
        setHandPos({ x: start.x + (target.x - start.x) * t, y: start.y + (target.y - start.y) * t });
        setNear(t > 0.8);
        setHoldProgress(t);
        setAccuracy(0.6 + 0.3 * t);
        setQuality(0.85);
        if (t >= 1) onReachConfirmed();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    // Live pose tracking.
    const positioned = m.present && uprightScore(m, baselineRef.current) >= 0.25;
    if (!m.present) {
      setCoachCue(T.positionCue);
      setHandPos(null);
      setNear(false);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }
    setCoachCue(T.hintText);

    // Movement quality: reward controlled motion, penalise frantic jerk.
    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.intensityCeiling);
    const controlled = clamp01(1 - Math.max(0, intensity - P.jerkHigh) / (1 - P.jerkHigh));
    const q = clamp01((positioned ? 0.45 : 0.25) + 0.55 * controlled);
    setQuality(q);

    // Locate the probe (hand / body) and its distance to the target.
    let probe: Anchor | null = null;
    let d = 1;
    let ok = false;
    if (T.kind === 'body') {
      probe = bodyScreen(m);
      d = dist(probe, target);
      ok = d <= radius;
    } else if (T.kind === 'bothHands') {
      const ws = wristScreens(m);
      if (m.leftWrist && m.rightWrist) {
        const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
        const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
        const dl = dist(lw, target);
        const dr = dist(rw, target);
        d = Math.max(dl, dr);
        probe = { x: (lw.x + rw.x) / 2, y: (lw.y + rw.y) / 2 };
        ok = dl <= radius && dr <= radius;
      } else if (ws.length > 0) {
        probe = ws[0]!;
        d = dist(probe, target);
      }
    } else {
      // hand · twoStage — nearest wrist.
      for (const w of wristScreens(m)) {
        const wd = dist(w, target);
        if (wd < d) {
          d = wd;
          probe = w;
        }
      }
      ok = probe !== null && d <= radius;
    }

    setHandPos(probe);
    setNear(ok);
    setAccuracy(clamp01(1 - d / (radius * 1.6)));

    if (roundActiveRef.current && probe) {
      if (d < minDistRef.current) minDistRef.current = d;

      if (ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastNearRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.holdToConfirmMs);
        setHoldProgress(prog);
        if (prog >= 1) onReachConfirmed();
      } else if (now - lastNearRef.current > P.holdGraceMs) {
        holdStartRef.current = 0;
        setHoldProgress(0);
      }
    }

    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: false, quality: q });
    prevMetricsRef.current = m;
  }, [anchorsForRound, onReachConfirmed, radiusFor, recordPostureBreak, recordTick, T.hintText, T.kind, T.positionCue]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    accSumRef.current = 0;
    accCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setCoins(0);
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
    setCoachCue('Stand tall facing the camera — let me see your arms!');
    speakTTS('Stand tall facing me, with room to reach all around!', 0.8).catch(() => {});
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
    }, 120);
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
        setCoachCue('Camera not allowed — playing guided mode. You can allow it in Settings.');
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

  const { target, source } = anchorsForRound(round, stage);

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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: MOTOR_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: MOTOR_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧠 MOTOR PLANNING LAB</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: MOTOR_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: MOTOR_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: MOTOR_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: MOTOR_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: MOTOR_SHELL.statValue }]}>{coins}</Text>
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
              <MotorTargetOverlay
                theme={T}
                kind={T.kind}
                target={target}
                source={source}
                stage={stage}
                roundActive={roundActive}
                handPos={handPos}
                holdProgress={holdProgress}
                near={near}
                accuracy={accuracy}
                quality={quality}
                round={round}
                totalRounds={totalRounds}
                banner={banner}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={MOTOR_SHELL.sparkleColor} count={16} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Getting ready… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
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
                    ? 'Stand back so the camera sees your whole body — clear space to reach and move!'
                    : 'Guided mode: follow the coach and plan each move step by step!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Mission</Text>
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
  academyLabel: { color: '#C4B5FD', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#DDD6FE', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  coinEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(12,25,41,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#A78BFA' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#DDD6FE', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#C4B5FD', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default MotorPlanGame;
