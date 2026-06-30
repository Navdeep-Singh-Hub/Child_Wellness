/**
 * Jungle Expedition — OT Level 6 Session 8 shared animal-walk & core engine.
 *
 * Travels an animal trail driven by camera-detected movement cadence (web) or a
 * guided fallback (native / no camera). Quadruped games (bear, crab, seal,
 * turtle) gate reps on a lowered body position; gorilla march counts alternating
 * knee lifts. Each detected "stride" advances along the trail.
 *
 * Modes: bearWalk · crabWalk · sealPush · turtleCrawl · gorillaMarch
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  averageBaseline,
  bodyLowered,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  legLift,
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { TrailProgress } from '@/components/game/occupational/level6/session8/components/TrailProgress';
import { ANIMAL_GAME_THEMES, type AnimalMode } from '@/components/game/occupational/level6/session8/safariTheme';
import { SafariHUD, SafariIntroPanel } from '@/components/game/occupational/level6/session8/shared/SafariUI';
import { SafariBackdrop } from '@/components/game/occupational/level6/session8/shared/SafariVisuals';
import { SESSION8_PACING } from '@/components/game/occupational/level6/session8/session8Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION8_PACING;
const VOICE_PRAISE = ['Keep going!', 'Strong moves!', 'You can do it!', 'Great work!', 'Almost there!'];

type Phase = 'intro' | 'calibrate' | 'play';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const AnimalWalkGame: React.FC<{
  mode: AnimalMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = ANIMAL_GAME_THEMES[mode];
  const S = T.shell;
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

  // ── UI state ──
  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [inPosition, setInPosition] = useState(false);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  // ── Refs ──
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

  // Rep detection state.
  const armedRef = useRef(false);
  const lastRepRef = useRef(0);
  const lastLiftedRef = useRef<'left' | 'right' | 'none'>('none');
  const fallbackRepAtRef = useRef(0);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    usingCameraRef.current = usingCamera;
  }, [usingCamera]);

  // ── Helpers ──
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

    const traveled = stepRef.current;
    const accuracy = totalSteps > 0 ? Math.round((traveled / totalSteps) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(traveled * 14 + snap.avgPostureQuality * 0.5 + snap.uprightPct * 0.3);
    setFinalStats({ correct: traveled, total: totalSteps, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: traveled,
          total: totalSteps,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['core-activation', 'shoulder-stability', 'bilateral-coordination', 'proprioception', 'motor-planning', 'endurance'],
          meta: analyticsMeta(accuracy),
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

  // ── Main loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    if (!cam) {
      // Guided fallback: steady auto-cadence.
      setInPosition(true);
      const phaseT = ((now - fallbackRepAtRef.current) % P.fallbackRepMs) / P.fallbackRepMs;
      setEnergy(0.4 + 0.4 * Math.abs(Math.sin(phaseT * Math.PI)));
      if (now - fallbackRepAtRef.current >= P.fallbackRepMs) {
        fallbackRepAtRef.current = now;
        advanceStep();
      }
      setQuality(0.85);
      recordTick(dt, { upright: true, still: false, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    const motion = limbMotion(prevMetricsRef.current, m);
    prevMetricsRef.current = m;
    const intensity = movementIntensity(motion, P.intensityCeiling);
    setEnergy(intensity);

    // Position gate.
    let positioned: boolean;
    if (T.requireLowered) positioned = bodyLowered(m) >= P.loweredThreshold;
    else positioned = m.present; // gorilla marches standing
    setInPosition(positioned);

    if (!positioned) {
      setCoachCue(T.positionCue);
      armedRef.current = false;
      setQuality(0.25);
      recordTick(dt, { upright: false, still: false, quality: 0.25 });
      if (m.present) recordPostureBreak();
      return;
    }
    setCoachCue(T.hintText);

    // Rep detection.
    if (T.useLegMarch) {
      const lift = legLift(m);
      const refractory = P.marchRefractoryMs;
      if (
        lift.legsVisible &&
        lift.lifted !== 'none' &&
        lift.amount >= P.marchLiftAmount &&
        lift.lifted !== lastLiftedRef.current &&
        now - lastRepRef.current >= refractory
      ) {
        lastLiftedRef.current = lift.lifted;
        lastRepRef.current = now;
        advanceStep();
      } else if (!lift.legsVisible) {
        // Legs off-frame: fall back to motion bursts so the game still progresses.
        const refr = P.repRefractoryMs;
        if (!armedRef.current && motion >= P.motionRepHigh && now - lastRepRef.current >= refr) {
          armedRef.current = true;
          lastRepRef.current = now;
          advanceStep();
        } else if (motion < P.motionRepLow) {
          armedRef.current = false;
        }
      }
    } else {
      const refractory = T.slow ? P.slowRepRefractoryMs : P.repRefractoryMs;
      if (!armedRef.current && motion >= P.motionRepHigh && now - lastRepRef.current >= refractory) {
        armedRef.current = true;
        lastRepRef.current = now;
        advanceStep();
      } else if (motion < P.motionRepLow) {
        armedRef.current = false;
      }
    }

    // Quality.
    let q: number;
    if (T.useLegMarch) {
      q = clamp01(uprightScore(m, base) * 0.5 + intensity * 0.5);
    } else if (T.slow) {
      // reward steady, controlled crawl (intensity near a gentle target)
      q = clamp01(0.85 - Math.abs(intensity - 0.35));
    } else {
      q = clamp01(0.5 + intensity * 0.6);
    }
    setQuality(q);
    recordTick(dt, { upright: positioned, still: false, quality: q });
  }, [advanceStep, recordPostureBreak, recordTick, T.hintText, T.positionCue, T.requireLowered, T.slow, T.useLegMarch]);

  // ── Calibration ──
  const beginPlay = useCallback(() => {
    resetAnalytics();
    setPhase('play');
    phaseRef.current = 'play';
    lastTickRef.current = 0;
    fallbackRepAtRef.current = Date.now();
    lastRepRef.current = 0;
    armedRef.current = false;
    lastLiftedRef.current = 'none';
    prevMetricsRef.current = null;
  }, [resetAnalytics]);

  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall facing the camera so I can see you — hold still!');
    speakTTS('Stand tall facing me so I can see your whole body!', 0.8).catch(() => {});
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
    // Safety cap so a stalled session still resolves.
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

  // ── Render ──
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
    <View style={styles.root}>
      <SafariBackdrop backdrop={T.backdrop} shell={S} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        <SafariHUD theme={T} stepIndex={stepIndex} totalSteps={totalSteps} coins={coins} />

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            shell={S}
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
            {phase === 'play' && (
              <TrailProgress
                steps={totalSteps}
                index={stepIndex}
                hero={T.hero}
                collectible={T.collectible}
                accent={T.accent}
                energy={energy}
                inPosition={inPosition}
                positionCue={T.positionCue}
                starEvery={P.starEveryNSteps}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={S.sparkleColor} count={14} />

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
          <SafariIntroPanel
            theme={T}
            errorText={cameraSupported && error ? error : undefined}
            cameraSupported={cameraSupported}
            hasCamera={hasCamera}
            onStart={handleStart}
            onRetry={() => setActive(true)}
            onGuided={() => { setForceFallback(true); handleStart(); }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  stageWrap: { flex: 1, marginTop: 10, marginBottom: 8 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(2,44,34,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FACC15' },
});

export default AnimalWalkGame;
