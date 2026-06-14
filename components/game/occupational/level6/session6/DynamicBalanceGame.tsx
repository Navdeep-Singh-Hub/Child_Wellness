/**
 * Wild Trail — OT Level 6 Session 6 shared dynamic-balance engine.
 *
 * Drives all five Dynamic Balance games as an action sequence (step / turn /
 * stop / march / steady-step), detected from camera-derived weight shift, body
 * turn and motion (web), or a guided fallback (native / no camera).
 *
 * Modes: steppingStones · crossBridge · riverCrossing · adventureTrail · balanceJourney
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  ADVENTURE_TRAIL,
  averageBaseline,
  BALANCE_JOURNEY,
  DEFAULT_BASELINE,
  DYNAMIC_ACTION_INFO,
  EMPTY_METRICS,
  frameMotionFull,
  shiftZone,
  swayStillness,
  turnProxy,
  weightBalanceScore,
  weightShift,
  type DynamicAction,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { BridgePath } from '@/components/game/occupational/level6/session5/components/BridgePath';
import { WeightShiftBar } from '@/components/game/occupational/level6/session5/components/WeightShiftBar';
import { ActionCue } from '@/components/game/occupational/level6/session6/components/ActionCue';
import { DYNAMIC_GAME_THEMES, TRAIL_SHELL, type DynamicMode } from '@/components/game/occupational/level6/session6/trailTheme';
import { SESSION6_PACING } from '@/components/game/occupational/level6/session6/session6Pacing';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION6_PACING;
const VOICE_PRAISE = ['Great move!', 'Nice step!', 'Awesome!', 'You did it!', 'Keep going!'];

type Phase = 'intro' | 'calibrate' | 'play';

const randStep = (): DynamicAction => {
  const r = Math.random();
  return r < 0.4 ? 'left' : r < 0.8 ? 'right' : 'center';
};

const buildSequence = (mode: DynamicMode): DynamicAction[] => {
  switch (mode) {
    case 'steppingStones':
      return Array.from({ length: P.steppingStonesCount }, randStep);
    case 'riverCrossing':
      return Array.from({ length: P.riverCrossings }, randStep);
    case 'crossBridge':
      return Array.from({ length: P.crossBridgeSteps }, () => 'steady' as DynamicAction);
    case 'adventureTrail':
      return [...ADVENTURE_TRAIL];
    case 'balanceJourney':
      return [...BALANCE_JOURNEY];
  }
};

const laneOf = (a: DynamicAction): ShiftDir => (a === 'left' ? 'left' : a === 'right' ? 'right' : 'center');

const dwellFor = (a: DynamicAction): number => {
  switch (a) {
    case 'steady':
      return P.steadyHoldMs;
    case 'turn':
      return P.turnHoldMs;
    case 'stop':
      return P.stopHoldMs;
    case 'go':
      return P.goHoldMs;
    default:
      return P.stepLandMs;
  }
};

export const DynamicBalanceGame: React.FC<{
  mode: DynamicMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = DYNAMIC_GAME_THEMES[mode];
  const showTrail = mode === 'steppingStones' || mode === 'riverCrossing' || mode === 'crossBridge';

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, error, previewContainerId } = poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordFreeze,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  // ── UI state ──
  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [sequence, setSequence] = useState<DynamicAction[]>(() => buildSequence(mode));
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [shiftXDisplay, setShiftXDisplay] = useState(0);
  const [actionProgress, setActionProgress] = useState(0);
  const [matchedNow, setMatchedNow] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;
  const totalRounds = sequence.length;
  const currentAction = sequence[round - 1] ?? 'center';

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);
  const sequenceRef = useRef<DynamicAction[]>(sequence);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  const dwellRef = useRef(0);
  const roundStartRef = useRef(0);
  const reactedRef = useRef<number | null>(null);
  const balancedMsRef = useRef(0);
  const totalMsRef = useRef(0);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    usingCameraRef.current = usingCamera;
  }, [usingCamera]);
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

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

  const praise = useCallback(() => {
    const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
    speakTTS(msg, 0.8).catch(() => {});
  }, []);

  const celebrate = useCallback(() => {
    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const awardStar = useCallback(
    (earned: boolean) => {
      if (earned) {
        setScore((s) => s + 1);
        setCoins((c) => c + 1);
        celebrate();
        praise();
      }
    },
    [celebrate, praise],
  );

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const finalScore = scoreRef.current;
    const accuracy = totalRounds > 0 ? Math.round((finalScore / totalRounds) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(finalScore * 20 + snap.avgPostureQuality * 0.4 + snap.uprightPct * 0.3);
    setFinalStats({ correct: finalScore, total: totalRounds, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['dynamic-balance', 'motor-planning', 'coordination', 'sequencing', 'postural-control'],
          meta: analyticsMeta(accuracy),
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalRounds]);

  const completedRef = useRef(false);
  const phaseGuardComplete = useCallback((fn: () => void) => {
    if (completedRef.current) return;
    completedRef.current = true;
    fn();
    setTimeout(() => {
      completedRef.current = false;
    }, P.nextRoundDelayMs + 200);
  }, []);

  const startRoundRef = useRef<() => void>(() => {});
  const advanceRound = useCallback(() => {
    if (doneRef.current) return;
    if (roundRef.current >= sequenceRef.current.length) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRoundRef.current(), P.nextRoundDelayMs);
  }, [endGame, schedule]);

  const finishAction = useCallback(
    (earned: boolean) => {
      if (doneRef.current) return;
      phaseGuardComplete(() => {
        const reaction = reactedRef.current ? reactedRef.current - roundStartRef.current : undefined;
        recordFreeze(earned, reaction);
        if (earned) recordHold(dwellFor(sequenceRef.current[roundRef.current - 1] ?? 'center'));
        awardStar(earned);
        setMatchedNow(false);
        setActionProgress(0);
        setCoachCue(earned ? 'Great move! Keep going!' : 'Good try — follow the next cue!');
        advanceRound();
      });
    },
    [advanceRound, awardStar, phaseGuardComplete, recordFreeze, recordHold],
  );

  const startRound = useCallback(() => {
    dwellRef.current = 0;
    roundStartRef.current = Date.now();
    reactedRef.current = null;
    prevMetricsRef.current = null;
    setActionProgress(0);
    setMatchedNow(false);
    const action = sequenceRef.current[roundRef.current - 1] ?? 'center';
    setCoachCue(DYNAMIC_ACTION_INFO[action].cue);
    speakTTS(DYNAMIC_ACTION_INFO[action].cue, 0.85).catch(() => {});
    schedule(() => finishAction(false), P.actionWindowMs);
  }, [schedule, finishAction]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  // ── Main loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;
    const action = sequenceRef.current[roundRef.current - 1] ?? 'center';

    const ws = cam ? weightShift(m, base) : { x: 0, y: 0 };
    const balance = cam ? weightBalanceScore(m, base) : 0.85;
    const motion = cam ? frameMotionFull(prevMetricsRef.current, m) : 0;
    const still = cam ? swayStillness(motion) : 0.85;
    const turn = cam ? turnProxy(m, base) : 0.85;
    prevMetricsRef.current = m;

    totalMsRef.current += dt;
    if (balance >= P.balanceThreshold) balancedMsRef.current += dt;

    setShiftXDisplay(cam ? ws.x : laneOf(action) === 'left' ? -0.4 : laneOf(action) === 'right' ? 0.4 : 0);

    // Per-action detection.
    let matched: boolean;
    let allowReset = true;
    if (!cam) {
      matched = true;
    } else if (action === 'left' || action === 'right' || action === 'center') {
      matched = shiftZone(ws.x, P.stepTolerance) === action && balance >= P.balanceThreshold;
    } else if (action === 'steady') {
      matched = balance >= P.balanceThreshold && still >= 0.5;
    } else if (action === 'turn') {
      matched = turn >= P.turnThreshold;
    } else if (action === 'stop') {
      matched = still >= P.stopStillThreshold;
    } else {
      // 'go' — active marching; tolerate brief pauses (no reset).
      matched = motion >= P.marchMotionMin;
      allowReset = false;
    }

    const req = dwellFor(action);
    if (matched) {
      if (reactedRef.current === null) reactedRef.current = now;
      dwellRef.current += dt;
    } else if (allowReset) {
      dwellRef.current = 0;
      if (cam && (action === 'stop' || action === 'steady')) recordPostureBreak();
    }

    setMatchedNow(matched);
    setActionProgress(Math.min(1, dwellRef.current / req));
    const q = cam ? balance : 0.85;
    setQuality(q);
    recordTick(dt, { upright: balance >= P.balanceThreshold, still: matched, quality: q });

    if (dwellRef.current >= req) finishAction(true);
  }, [finishAction, recordPostureBreak, recordTick]);

  // ── Calibration ──
  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      resetAnalytics();
      setPhase('play');
      phaseRef.current = 'play';
      lastTickRef.current = 0;
      schedule(() => startRoundRef.current(), P.roundIntroDelayMs);
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall in the middle, facing the camera with your whole body in view!');
    speakTTS('Stand tall in the middle, facing me!', 0.8).catch(() => {});
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
        resetAnalytics();
        setPhase('play');
        phaseRef.current = 'play';
        lastTickRef.current = 0;
        schedule(() => startRoundRef.current(), P.roundIntroDelayMs);
      }
    }, 120);
    timeoutsRef.current.push(sampler as unknown as ReturnType<typeof setTimeout>);
  }, [resetAnalytics, cameraSupported, forceFallback, schedule]);

  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [phase, tick]);

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
    setSequence(buildSequence(mode));
    beginCalibration();
  }, [beginCalibration, mode]);

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

  const info = DYNAMIC_ACTION_INFO[currentAction];
  const directional = currentAction === 'left' || currentAction === 'right' || currentAction === 'center';

  return (
    <LinearGradient colors={TRAIL_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: TRAIL_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: TRAIL_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌲 WILD TRAIL</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: TRAIL_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TRAIL_SHELL.statLabel }]}>Step</Text>
              <Text style={[styles.statValue, { color: TRAIL_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: TRAIL_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: TRAIL_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: TRAIL_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={[styles.statValue, { color: TRAIL_SHELL.statValue }]}>{coins}</Text>
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
            {phase === 'play' && (
              <ActionCue emoji={info.emoji} label={info.label} progress={actionProgress} active={matchedNow} accent={T.accent} />
            )}
            {phase === 'play' && showTrail && (
              <BridgePath pattern={sequence.map(laneOf)} stepIndex={round - 1} hero={T.hero} accent={T.accent} />
            )}
            {phase === 'play' && (
              <WeightShiftBar shiftX={shiftXDisplay} target={directional ? laneOf(currentAction) : null} inZone={matchedNow} accent={T.accent} />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={TRAIL_SHELL.sparkleColor} count={14} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Stand in the middle… {Math.round(calibProgress * 100)}%</Text>
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
                      ? 'Stand back so the camera sees your whole body — give yourself room to step and turn!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the trail cues and move along!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Mission</Text>
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
  academyLabel: { color: '#D9F99D', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#D9F99D', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  starEmoji: { fontSize: 15 },
  coinEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '46%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(15,36,23,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#ECFCCB', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)' },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { paddingVertical: 6 },
  linkText: { color: '#BEF264', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default DynamicBalanceGame;
