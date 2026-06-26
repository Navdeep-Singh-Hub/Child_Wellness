/**
 * OT Level 9 · Session 2 · Game 4 — Inflate Carefully (Sky Puff Workshop)
 *
 * Camera tracks steady bilateral inflation pressure — fill balloon to target without popping.
 * MediaPipe pose on APK + web; guided fallback when no camera.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  EMPTY_METRICS,
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  averageForceBaseline,
  DEFAULT_FORCE_BASELINE,
  mirroredWrists,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import { InflateOverlay } from '@/components/game/occupational/level9/session2/components/InflateOverlay';
import { INFLATE_CAREFULLY_THEME, INFLATE_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import {
  inflateCarefulScore,
  inflateFillStatus,
  inflatePopRisk,
  type InflateFillStatus,
} from '@/components/game/occupational/level9/session2/pressureUtils';
import { SESSION9_2_PACING as P } from '@/components/game/occupational/level9/session2/session2Pacing';
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

const T = INFLATE_CAREFULLY_THEME;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Perfect size!', 'So careful!', 'Great control!', 'No pop!', 'Sky puff pro!'];
const START_FILL = 0.16;

type Phase = 'intro' | 'calibrate' | 'play';

const InflateCarefullyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [sealed, setSealed] = useState(0);
  const [force, setForce] = useState(0);
  const [fill, setFill] = useState(START_FILL);
  const [fillStatus, setFillStatus] = useState<InflateFillStatus>('empty');
  const [quality, setQuality] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [sealProgress, setSealProgress] = useState(0);
  const [sealing, setSealing] = useState(false);
  const [popped, setPopped] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [leftHand, setLeftHand] = useState<{ x: number; y: number } | null>(null);
  const [rightHand, setRightHand] = useState<{ x: number; y: number } | null>(null);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = cameraSupported && !forceFallback;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<ForceBaseline>(DEFAULT_FORCE_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const roundActiveRef = useRef(false);
  const sealingRef = useRef(false);
  const poppedRef = useRef(false);
  const popCooldownRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const sealStartRef = useRef(0);
  const roundStartRef = useRef(0);
  const fillRef = useRef(START_FILL);
  const forceSumRef = useRef(0);
  const forceCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const zoneTicksRef = useRef(0);
  const totalTicksRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);
  const peakForceRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);
  useEffect(() => { fillRef.current = fill; }, [fill]);

  const fillTargetForRound = useCallback(
    (r: number) => P.inflateFillTargets[Math.min(r, P.inflateFillTargets.length - 1)] ?? 0.6,
    [],
  );

  const forceTargetForRound = useCallback(
    (r: number) => P.inflateForceTargets[Math.min(r, P.inflateForceTargets.length - 1)] ?? 0.5,
    [],
  );

  const balloonForRound = useCallback(
    (r: number) => T.balloons[r % T.balloons.length] ?? '🎈',
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
    const avgForce = forceCountRef.current > 0 ? forceSumRef.current / forceCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const zoneAccuracy = totalTicksRef.current > 0 ? zoneTicksRef.current / totalTicksRef.current : 0;
    const headline = Math.round((completion * 0.5 + avgForce * 0.2 + moveQuality * 0.15 + zoneAccuracy * 0.15) * 100);
    const xp = Math.round(completed * 23 + avgForce * 90 + moveQuality * 70 + zoneAccuracy * 42);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: 'inflate-carefully',
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            avgInflatePressure: Math.round(avgForce * 100),
            zoneAccuracy: Math.round(zoneAccuracy * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, router, totalRounds]);

  const resetFill = useCallback(() => {
    fillRef.current = START_FILL;
    setFill(START_FILL);
    setFillStatus('empty');
    holdStartRef.current = 0;
    setHoldProgress(0);
  }, []);

  const triggerPop = useCallback(() => {
    if (popCooldownRef.current || sealingRef.current || doneRef.current) return;
    popCooldownRef.current = true;
    poppedRef.current = true;
    setPopped(true);
    setBanner(T.popCue);
    setCoachCue(T.popCue);
    speakTTS(T.voicePop, 0.85).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    resetFill();
    schedule(() => {
      poppedRef.current = false;
      setPopped(false);
      popCooldownRef.current = false;
      setBanner('');
      setCoachCue(T.hintText);
    }, P.inflatePopResetMs);
  }, [resetFill, schedule]);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      roundRef.current = r;
      setRound(r);
      holdStartRef.current = 0;
      lastInZoneRef.current = 0;
      sealStartRef.current = 0;
      peakForceRef.current = 0;
      sealingRef.current = false;
      poppedRef.current = false;
      popCooldownRef.current = false;
      setSealing(false);
      setSealProgress(0);
      setPopped(false);
      resetFill();
      setForce(0);
      roundActiveRef.current = false;
      setRoundActive(false);
      setBanner(T.inflateCue);
      setCoachCue(T.hintText);
      speakTTS(T.voiceInflate, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner('');
        Haptics.selectionAsync().catch(() => {});
      }, P.roundIntroMs);
    },
    [resetFill, schedule],
  );

  const finishRound = useCallback(() => {
    if (doneRef.current) return;
    sealingRef.current = false;
    setSealing(false);
    setSealProgress(0);
    setHoldProgress(0);
    setBanner('');

    forceSumRef.current += peakForceRef.current;
    forceCountRef.current += 1;
    completedRef.current += 1;
    recordHold(P.inflateHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setSealed((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, recordHold, recordStar, schedule, startRound, totalRounds]);

  const beginSeal = useCallback(() => {
    if (doneRef.current || sealingRef.current || poppedRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    sealingRef.current = true;
    setSealing(true);
    sealStartRef.current = Date.now();
    setHoldProgress(1);
    setBanner(T.sealCue);
    speakTTS(T.voiceSeal, 0.85).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    schedule(() => finishRound(), P.inflateSealMs);
  }, [finishRound, schedule]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const targetFill = fillTargetForRound(roundRef.current);
    const targetForce = forceTargetForRound(roundRef.current);

    if (sealingRef.current) {
      const sp = clamp01((now - sealStartRef.current) / P.inflateSealMs);
      setSealProgress(sp);
      recordTick(dt, { upright: true, still: false, quality: 0.92 });
      prevMetricsRef.current = m;
      return;
    }

    if (!camLiveRef.current) {
      if (roundActiveRef.current && !popCooldownRef.current) {
        const elapsed = now - roundStartRef.current;
        const t = clamp01(elapsed / P.fallbackInflateMs);
        const f = clamp01(targetForce * (0.35 + t * 0.7));
        let nextFill = fillRef.current;
        if (t < 0.82) nextFill = clamp01(START_FILL + t * (targetFill + 0.06));
        else nextFill = clamp01(targetFill - (t - 0.82) * 0.08);
        const status = inflateFillStatus(nextFill, targetFill, P.inflateFillBand, f, targetForce, P.inflatePopMargin);
        if (status === 'popped') {
          triggerPop();
        } else {
          fillRef.current = nextFill;
          setFill(nextFill);
          setForce(f);
          setFillStatus(status);
          setLeftHand({ x: 0.4, y: 0.52 });
          setRightHand({ x: 0.6, y: 0.52 });
          setQuality(0.86);
          if (f > peakForceRef.current) peakForceRef.current = f;
          if (status === 'zone') {
            const zoneElapsed = Math.max(0, elapsed - P.fallbackInflateMs * 0.78);
            const prog = clamp01(zoneElapsed / P.inflateHoldMs);
            setHoldProgress(prog);
            if (prog >= 1) beginSeal();
          } else {
            setHoldProgress(0);
          }
        }
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    const positioned = m.present && uprightScore(m, baselineRef.current) >= 0.22;
    const wrists = mirroredWrists(m);
    setLeftHand(wrists.left);
    setRightHand(wrists.right);

    if (!m.present || !m.leftWrist || !m.rightWrist) {
      setCoachCue(T.positionCue);
      setForce(0);
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, 0.14);
    const controlled = clamp01(1 - Math.max(0, intensity - 0.5) / 0.5);
    const f = inflateCarefulScore(m, baselineRef.current);
    const q = clamp01((positioned ? 0.4 : 0.18) + 0.36 * controlled + 0.24 * f);
    setForce(f);
    setQuality(q);
    if (f > peakForceRef.current) peakForceRef.current = f;

    if (roundActiveRef.current && !popCooldownRef.current) {
      let nextFill = fillRef.current;

      if (f > 0.12 && !inflatePopRisk(f, targetForce, P.inflatePopMargin)) {
        const rate = P.inflateFillRate * (1 + f * 1.4) * dt;
        nextFill = clamp01(nextFill + rate);
      }

      const status = inflateFillStatus(nextFill, targetFill, P.inflateFillBand, f, targetForce, P.inflatePopMargin);
      fillRef.current = nextFill;
      setFill(nextFill);
      setFillStatus(status);

      if (status === 'popped') {
        triggerPop();
      } else if (status === 'overfill') {
        setCoachCue(T.easeCue);
        setBanner(T.easeCue);
        holdStartRef.current = 0;
        setHoldProgress(0);
      } else if (status === 'zone') {
        setCoachCue(T.hintText);
        setBanner('');
        zoneTicksRef.current += 1;
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastInZoneRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / P.inflateHoldMs);
        setHoldProgress(prog);
        if (prog >= 1) beginSeal();
      } else if (f < targetForce - P.inflateForceBand) {
        setCoachCue(T.gentleCue);
        setBanner('');
        if (now - lastInZoneRef.current > P.holdGraceMs) {
          holdStartRef.current = 0;
          setHoldProgress(0);
        }
      } else {
        setCoachCue(T.hintText);
        setBanner('');
        if (now - lastInZoneRef.current > P.holdGraceMs) {
          holdStartRef.current = 0;
          setHoldProgress(0);
        }
      }
    }

    totalTicksRef.current += 1;
    qualSumRef.current += q;
    qualCountRef.current += 1;
    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: false, quality: q });
    prevMetricsRef.current = m;
  }, [
    beginSeal,
    fillTargetForRound,
    forceTargetForRound,
    recordPostureBreak,
    recordTick,
    triggerPop,
  ]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    forceSumRef.current = 0;
    forceCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    zoneTicksRef.current = 0;
    totalTicksRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setSealed(0);
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
    speakTTS('Stand tall and relax your arms. I will learn how you stand before we inflate balloons!', 0.8).catch(() => {});
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
        setCoachCue('Camera not allowed — playing guided inflate mode.');
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

  const targetFill = fillTargetForRound(round);
  const targetForce = forceTargetForRound(round);
  const balloon = balloonForRound(round);

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: INFLATE_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: INFLATE_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>☁️ {INFLATE_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: INFLATE_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: INFLATE_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: INFLATE_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: INFLATE_SHELL.statBorder }]}>
              <Text style={styles.sealEmoji}>🎈</Text>
              <Text style={[styles.statValue, { color: INFLATE_SHELL.statValue }]}>{sealed}</Text>
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
              <InflateOverlay
                theme={T}
                force={force}
                targetForce={targetForce}
                fill={fill}
                targetFill={targetFill}
                fillStatus={fillStatus}
                holdProgress={holdProgress}
                sealProgress={sealProgress}
                sealing={sealing}
                popped={popped}
                roundActive={roundActive}
                round={round}
                totalRounds={totalRounds}
                sealedCount={round}
                balloon={balloon}
                leftHand={leftHand}
                rightHand={rightHand}
                banner={banner}
                quality={quality}
              />
            )}
            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={INFLATE_SHELL.sparkleColor} count={24} />
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
                    ? 'Stand back so the camera sees your arms — inflate each cloud balloon to the gold line without popping!'
                    : 'Guided mode: follow the coach and practice careful balloon inflation!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accentDeep }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Workshop</Text>
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
  sealEmoji: { fontSize: 15 },
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
  linkText: { color: '#BAE6FD', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default InflateCarefullyGame;
