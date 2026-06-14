/**
 * Linear Vestibular Movement — OT Level 7 Session 1 shared engine.
 *
 * Drives all five forward-walking games from camera-detected stepping cadence,
 * path alignment and dynamic balance (APK + web), or a guided fallback.
 *
 * Modes: trainTracks · rocketLaunch · rainbowRun · waveWalker · adventurePath
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { LinearPathTrack } from '@/components/game/occupational/level7/session1/components/LinearPathTrack';
import { RocketPowerBar } from '@/components/game/occupational/level7/session1/components/RocketPowerBar';
import { WaveFloor } from '@/components/game/occupational/level7/session1/components/WaveFloor';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  detectWalkStep,
  EMPTY_METRICS,
  linearWalkQuality,
  limbMotion,
  movementIntensity,
  pathAlignment,
  uprightScore,
  walkBalance,
  walkForwardSignal,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level7/session1/poseUtils';
import { SESSION1_PACING } from '@/components/game/occupational/level7/session1/session1Pacing';
import { VESTIBULAR_GAME_THEMES, VESTIBULAR_SHELL, type VestibularMode } from '@/components/game/occupational/level7/session1/vestibularTheme';
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

const P = SESSION1_PACING;
const VOICE_PRAISE = ['Great step!', 'Keep walking!', 'Nice balance!', 'You got it!', 'Forward!'];

type Phase = 'intro' | 'calibrate' | 'play';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const LinearMovementGame: React.FC<{
  mode: VestibularMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = VESTIBULAR_GAME_THEMES[mode];
  const totalSteps = T.steps;

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, error, previewContainerId } = poseDetection;

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
  const [stepIndex, setStepIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [balancePct, setBalancePct] = useState(0);
  const [power, setPower] = useState(0);
  const [inPosition, setInPosition] = useState(false);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const stepRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);
  const gameStartRef = useRef(0);

  const armedRef = useRef(false);
  const lastRepRef = useRef(0);
  const lastLiftedRef = useRef<'left' | 'right' | 'none'>('none');
  const fallbackRepAtRef = useRef(0);
  const balanceSumRef = useRef(0);
  const balanceCountRef = useRef(0);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    usingCameraRef.current = usingCamera;
  }, [usingCamera]);

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

  const waveBalanceMin = useCallback(() => {
    if (!T.showWaves) return P.balanceMin;
    const swing = Math.sin(wavePhase * Math.PI * 2) * P.waveBalanceSwing;
    return clamp01(P.balanceMin + swing);
  }, [T.showWaves, wavePhase]);

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const traveled = stepRef.current;
    const accuracy = totalSteps > 0 ? Math.round((traveled / totalSteps) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const avgBal = balanceCountRef.current > 0 ? balanceSumRef.current / balanceCountRef.current : 0;
    const xp = Math.round(traveled * 15 + snap.avgPostureQuality * 0.45 + avgBal * 0.35 + snap.uprightPct * 0.25);
    setFinalStats({ correct: traveled, total: totalSteps, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `vestibular-${mode}` as any,
          correct: traveled,
          total: totalSteps,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: [
            'linear-vestibular',
            'dynamic-balance',
            'movement-awareness',
            'motor-planning',
            'postural-control',
            'spatial-awareness',
          ],
          meta: {
            ...analyticsMeta(accuracy),
            mode,
            avgBalance: Math.round(avgBal * 100),
            pathCompletion: accuracy,
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalSteps]);

  const advanceStep = useCallback(() => {
    if (doneRef.current) return;
    const next = stepRef.current + 1;
    stepRef.current = next;
    setStepIndex(next);
    setPower(next / totalSteps);
    setSparkleKey((k) => k + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    recordHold(P.tickMs);

    const earnedItem = next % P.starEveryNSteps === 0;
    if (earnedItem) {
      recordStar();
      setCoins((c) => c + 1);
      const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
      speakTTS(msg, 0.8).catch(() => {});
    }

    if (next >= totalSteps) {
      schedule(() => endGame(), P.nextStepDelayMs);
    }
  }, [endGame, recordHold, recordStar, schedule, totalSteps]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    if (T.showWaves && gameStartRef.current) {
      const elapsed = now - gameStartRef.current;
      setWavePhase((elapsed % P.waveCycleMs) / P.waveCycleMs);
    }

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    if (!cam) {
      setInPosition(true);
      const phaseT = ((now - fallbackRepAtRef.current) % P.fallbackStepMs) / P.fallbackStepMs;
      setEnergy(0.35 + 0.45 * Math.abs(Math.sin(phaseT * Math.PI)));
      setBalancePct(0.82);
      setQuality(0.85);
      if (now - fallbackRepAtRef.current >= P.fallbackStepMs) {
        fallbackRepAtRef.current = now;
        advanceStep();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    const prev = prevMetricsRef.current;
    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.intensityCeiling);
    setEnergy(intensity);

    const positioned = m.present && uprightScore(m, base) >= 0.35;
    setInPosition(positioned);

    if (!positioned) {
      setCoachCue(T.positionCue);
      armedRef.current = false;
      setQuality(0.22);
      setBalancePct(0.2);
      recordTick(dt, { upright: false, still: false, quality: 0.22 });
      if (m.present) recordPostureBreak();
      prevMetricsRef.current = m;
      return;
    }
    setCoachCue(T.hintText);

    const ws = weightShift(m, base);
    const bal = walkBalance(m, base, motion);
    const align = pathAlignment(ws.x);
    setBalancePct(bal);

    balanceSumRef.current += bal;
    balanceCountRef.current += 1;

    const stepOpts = {
      liftMin: P.marchLiftAmount,
      refractoryMs: P.marchRefractoryMs,
      motionHigh: P.motionRepHigh,
      motionLow: P.motionRepLow,
    };
    const stepResult = detectWalkStep(
      prev,
      m,
      lastLiftedRef.current,
      lastRepRef.current,
      now,
      armedRef.current,
      stepOpts,
    );

    if (stepResult.lifted !== lastLiftedRef.current && stepResult.lifted !== 'none') {
      lastLiftedRef.current = stepResult.lifted;
    }
    armedRef.current = stepResult.armed;

    const balMin = waveBalanceMin();
    if (
      stepResult.stepped &&
      bal >= balMin &&
      align >= P.alignmentMin
    ) {
      lastRepRef.current = now;
      advanceStep();
    }

    const q = linearWalkQuality(m, base, motion);
    const forward = walkForwardSignal(m, base);
    setQuality(clamp01(q * 0.7 + forward * 0.15 + intensity * 0.15));
    recordTick(dt, { upright: positioned, still: false, quality: q });
    prevMetricsRef.current = m;
  }, [advanceStep, recordPostureBreak, recordTick, T.hintText, T.positionCue, T.showWaves, waveBalanceMin]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    setPhase('play');
    phaseRef.current = 'play';
    lastTickRef.current = 0;
    gameStartRef.current = Date.now();
    fallbackRepAtRef.current = Date.now();
    lastRepRef.current = 0;
    armedRef.current = false;
    lastLiftedRef.current = 'none';
    prevMetricsRef.current = null;
    balanceSumRef.current = 0;
    balanceCountRef.current = 0;
  }, [resetAnalytics]);

  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall facing the camera — leave floor space to walk forward!');
    speakTTS('Stand tall facing me. Leave room to walk forward along the path!', 0.8).catch(() => {});
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
  }, [beginPlay, cameraSupported, forceFallback]);

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

  const handleStart = useCallback(() => {
    beginCalibration();
  }, [beginCalibration]);

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
    <LinearGradient colors={VESTIBULAR_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: VESTIBULAR_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: VESTIBULAR_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🛤️ VESTIBULAR PATH</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: VESTIBULAR_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: VESTIBULAR_SHELL.statLabel }]}>Path</Text>
              <Text style={[styles.statValue, { color: VESTIBULAR_SHELL.statValue }]}>
                {stepIndex}/{totalSteps}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: VESTIBULAR_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: VESTIBULAR_SHELL.statValue }]}>{coins}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            previewContainerId={previewContainerId}
            cameraSupported={usingCamera}
            hasCamera={hasCamera}
            present={present}
            isDetecting={isDetecting}
            calibrating={phase === 'calibrate'}
            quality={quality}
            glowColor={T.glow}
            hero={T.hero}
            coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
          >
            {phase === 'play' && T.showWaves && <WaveFloor phase={wavePhase} intensity={energy} />}

            {phase === 'play' && T.showRocket && <RocketPowerBar power={power} accent={T.accent} />}

            {phase === 'play' && (
              <LinearPathTrack
                steps={totalSteps}
                index={stepIndex}
                hero={T.hero}
                collectible={T.collectible}
                accent={T.accent}
                energy={energy}
                inPosition={inPosition}
                positionCue={T.positionCue}
                starEvery={P.starEveryNSteps}
                rainbow={T.rainbow}
                balancePct={balancePct}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={VESTIBULAR_SHELL.sparkleColor} count={14} />

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
            {cameraSupported && error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.btnRow}>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={() => setActive(true)}>
                    <Text style={styles.primaryBtnText}>Retry Camera</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} onPress={() => { setForceFallback(true); handleStart(); }}>
                    <Text style={styles.secondaryBtnText}>Play Guided</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.introText}>
                  {cameraSupported
                    ? hasCamera
                      ? 'Stand back so the camera sees your whole body — clear floor space to walk forward!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the coach and walk forward step by step!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Walking</Text>
                </Pressable>
                {cameraSupported && (
                  <Pressable style={styles.linkBtn} onPress={() => { setForceFallback(true); handleStart(); }}>
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
  academyLabel: { color: '#FCD34D', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#FDE68A', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibFill: { height: '100%', backgroundColor: '#FACC15' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#FDE68A', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#FCD34D', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default LinearMovementGame;
