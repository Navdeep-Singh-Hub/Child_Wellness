/**
 * Sunset Adventure — OT Level 6 Session 5 shared weight-shifting engine.
 *
 * Drives all five Weight Shifting games from camera-derived center-of-mass
 * shift + lean (web), or a guided fallback (native / no camera).
 *
 * Modes: appleReach · sideStar · treasureLean · bridge · magicScale
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  averageBaseline,
  BRIDGE_PATTERN,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  shiftZone,
  weightBalanceScore,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { BalanceScale } from '@/components/game/occupational/level6/session5/components/BalanceScale';
import { BridgePath } from '@/components/game/occupational/level6/session5/components/BridgePath';
import { ShiftTarget } from '@/components/game/occupational/level6/session5/components/ShiftTarget';
import { WeightShiftBar } from '@/components/game/occupational/level6/session5/components/WeightShiftBar';
import { SHIFT_GAME_THEMES, type ShiftMode } from '@/components/game/occupational/level6/session5/adventureTheme';
import { ShiftHUD, ShiftIntroPanel } from '@/components/game/occupational/level6/session5/shared/ShiftUI';
import { ShiftBackdrop } from '@/components/game/occupational/level6/session5/shared/ShiftVisuals';
import { SESSION5_PACING } from '@/components/game/occupational/level6/session5/session5Pacing';
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

const P = SESSION5_PACING;
const VOICE_PRAISE = ['Nice shift!', 'Got it!', 'Awesome!', 'Great balance!', 'You did it!'];

type Phase = 'intro' | 'calibrate' | 'play';
type Kind = 'collect' | 'scale';

const roundsForMode = (mode: ShiftMode): number => {
  switch (mode) {
    case 'appleReach':
      return P.appleTargets;
    case 'sideStar':
      return P.starTargets;
    case 'treasureLean':
      return P.treasureTargets;
    case 'bridge':
      return BRIDGE_PATTERN.length;
    case 'magicScale':
      return P.scaleRounds;
  }
};

const modeKind = (mode: ShiftMode): Kind => (mode === 'magicScale' ? 'scale' : 'collect');

const dwellForMode = (mode: ShiftMode): number => {
  if (mode === 'treasureLean') return P.treasureHoldMs;
  if (mode === 'bridge') return P.bridgeStepDwellMs;
  return P.collectDwellMs;
};

const windowForMode = (mode: ShiftMode): number => {
  switch (mode) {
    case 'appleReach':
      return P.appleWindowMs;
    case 'sideStar':
      return P.starWindowMs;
    case 'treasureLean':
      return P.treasureWindowMs;
    case 'bridge':
      return P.bridgeStepWindowMs;
    case 'magicScale':
      return P.scaleWindowMs;
  }
};

export const WeightShiftGame: React.FC<{
  mode: ShiftMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = SHIFT_GAME_THEMES[mode];
  const S = T.shell;
  const totalRounds = roundsForMode(mode);
  const kind = modeKind(mode);
  const requiredDwell = dwellForMode(mode);
  const sideTol = mode === 'treasureLean' ? P.leanTolerance : P.shiftTolerance;

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
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [shiftXDisplay, setShiftXDisplay] = useState(0);
  const [targetSide, setTargetSide] = useState<ShiftDir | null>(null);
  const [inZone, setInZone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [scaleOffset, setScaleOffset] = useState(0);
  const [scaleLevel, setScaleLevel] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  const targetSideRef = useRef<ShiftDir>('left');
  const scaleTargetRef = useRef(0);
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
          skillTags: ['weight-shifting', 'dynamic-balance', 'trunk-control', 'postural-control', 'body-awareness'],
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
    if (roundRef.current >= totalRounds) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRoundRef.current(), P.nextRoundDelayMs);
  }, [endGame, schedule, totalRounds]);

  const finishRound = useCallback(
    (earned: boolean) => {
      if (doneRef.current) return;
      phaseGuardComplete(() => {
        const reaction = reactedRef.current ? reactedRef.current - roundStartRef.current : undefined;
        recordFreeze(earned, reaction);
        if (earned) recordHold(requiredDwell);
        awardStar(earned);
        setInZone(false);
        if (mode === 'bridge') {
          setCoachCue(earned ? 'Step taken! 🌉' : 'Careful — find the stone!');
        } else if (mode === 'treasureLean') {
          setCoachCue(earned ? 'Treasure grabbed! Back to center! 💎' : 'Lean a little further next time!');
        } else {
          setCoachCue(earned ? 'Collected! 🌟' : 'Missed — shift a bit more!');
        }
        advanceRound();
      });
    },
    [advanceRound, awardStar, mode, phaseGuardComplete, recordFreeze, recordHold, requiredDwell],
  );

  const finishScale = useCallback(
    (earned: boolean) => {
      if (doneRef.current) return;
      phaseGuardComplete(() => {
        const reaction = reactedRef.current ? reactedRef.current - roundStartRef.current : undefined;
        recordFreeze(earned, reaction);
        if (earned) recordHold(P.scaleHoldMs);
        awardStar(earned);
        setScaleLevel(false);
        setCoachCue(earned ? 'Perfectly level! ⚖️' : 'Keep shifting gently to balance it!');
        advanceRound();
      });
    },
    [advanceRound, awardStar, phaseGuardComplete, recordFreeze, recordHold],
  );

  const startRound = useCallback(() => {
    dwellRef.current = 0;
    roundStartRef.current = Date.now();
    reactedRef.current = null;
    setInZone(false);

    if (kind === 'scale') {
      // Target a non-zero shift so the child must redistribute weight.
      const mag = 0.16 + Math.random() * 0.16;
      scaleTargetRef.current = (Math.random() < 0.5 ? -1 : 1) * mag;
      setScaleLevel(false);
      setScaleOffset(scaleTargetRef.current);
      setCoachCue('Shift gently to make the scale level!');
      schedule(() => finishScale(false), windowForMode(mode));
      return;
    }

    let side: ShiftDir;
    if (mode === 'bridge') {
      side = BRIDGE_PATTERN[(roundRef.current - 1) % BRIDGE_PATTERN.length]!;
      setStepIndex(roundRef.current - 1);
    } else {
      side = Math.random() < 0.5 ? 'left' : 'right';
    }
    targetSideRef.current = side;
    setTargetSide(side);

    if (mode === 'bridge') setCoachCue(`Shift ${side === 'center' ? 'to the middle' : side} onto the stone!`);
    else if (mode === 'treasureLean') setCoachCue(`Lean ${side} for the treasure!`);
    else setCoachCue(`Shift ${side} to ${mode === 'appleReach' ? 'pick the apple' : 'catch the star'}!`);

    schedule(() => finishRound(false), windowForMode(mode));
  }, [kind, mode, schedule, finishRound, finishScale]);

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

    const ws = cam ? weightShift(m, base) : { x: 0, y: 0 };
    const balance = cam ? weightBalanceScore(m, base) : 0.85;
    totalMsRef.current += dt;
    if (balance >= P.balanceThreshold) balancedMsRef.current += dt;
    else if (cam) recordPostureBreak();

    if (kind === 'scale') {
      // In fallback, drift the displayed offset toward 0 so it auto-levels.
      const offset = cam ? ws.x - scaleTargetRef.current : scaleOffset * (1 - dt / P.fallbackStepMs);
      setShiftXDisplay(cam ? ws.x : scaleTargetRef.current + offset);
      setScaleOffset(offset);
      const level = cam ? Math.abs(offset) <= P.scaleLevelTol : Math.abs(offset) <= P.scaleLevelTol;
      setScaleLevel(level);
      if (level) {
        if (reactedRef.current === null) reactedRef.current = now;
        dwellRef.current += dt;
      } else {
        dwellRef.current = Math.max(0, dwellRef.current - dt * 0.5);
      }
      setQuality(cam ? balance : 0.85);
      recordTick(dt, { upright: balance >= P.balanceThreshold, still: level, quality: cam ? balance : 0.85 });
      if (dwellRef.current >= P.scaleHoldMs) finishScale(true);
      return;
    }

    // collect modes
    const shiftX = cam ? ws.x : signedFallbackShift(targetSideRef.current, now, roundStartRef.current);
    setShiftXDisplay(shiftX);
    const zone = shiftZone(shiftX, sideTol);
    const matched = cam ? zone === targetSideRef.current : true;
    setInZone(matched);
    if (matched) {
      if (reactedRef.current === null) reactedRef.current = now;
      dwellRef.current += dt;
    } else {
      dwellRef.current = 0;
    }
    setQuality(cam ? balance : 0.85);
    recordTick(dt, { upright: balance >= P.balanceThreshold, still: matched, quality: cam ? balance : 0.85 });
    if (dwellRef.current >= requiredDwell) finishRound(true);
  }, [finishRound, finishScale, kind, recordPostureBreak, recordTick, requiredDwell, scaleOffset, sideTol]);

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
    setCoachCue('Stand tall in the middle with your whole body in view!');
    speakTTS('Stand tall in the middle and hold still!', 0.8).catch(() => {});
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
      <ShiftBackdrop backdrop={T.backdrop} shell={S} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        <ShiftHUD
          theme={T}
          round={round}
          totalRounds={totalRounds}
          score={score}
          coins={coins}
          roundLabel={mode === 'bridge' ? 'STEP' : 'ROUND'}
        />

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
            {phase === 'play' && kind === 'collect' && mode !== 'bridge' && targetSide && (
              <ShiftTarget side={targetSide} emoji={T.collectible} active accent={T.accent} />
            )}
            {phase === 'play' && mode === 'bridge' && (
              <BridgePath pattern={BRIDGE_PATTERN} stepIndex={stepIndex} hero={T.hero} accent={T.accent} />
            )}
            {phase === 'play' && kind === 'scale' && (
              <BalanceScale offset={scaleOffset} level={scaleLevel} accent={T.accent} />
            )}
            {phase === 'play' && (
              <WeightShiftBar shiftX={shiftXDisplay} target={targetSide} inZone={inZone} accent={T.accent} />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={S.sparkleColor} count={14} />

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
          <ShiftIntroPanel
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

/** Fallback: animate a synthetic shift toward the target so guided play collects. */
function signedFallbackShift(target: ShiftDir, now: number, start: number): number {
  const t = Math.min(1, (now - start) / SESSION5_PACING.fallbackStepMs);
  const mag = 0.4 * t;
  if (target === 'left') return -mag;
  if (target === 'right') return mag;
  return 0;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  stageWrap: { flex: 1, marginTop: 10, marginBottom: 8 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(46,16,101,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
});

export default WeightShiftGame;
