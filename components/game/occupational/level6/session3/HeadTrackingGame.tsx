/**
 * Cosmic Voyager — OT Level 6 Session 3 shared head & neck stability engine.
 *
 * Drives all five Head & Neck Stability games from camera-derived head
 * direction (web) or a guided fallback (native / no camera).
 *
 * Modes: rocketWatch · lookHold · skyGround · keepCrown · starTracker
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { CrownOverlay } from '@/components/game/occupational/level6/session1/components/CrownOverlay';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  HEAD_DIR_LABEL,
  HEAD_DIR_SEQUENCE,
  headCursor,
  targetPath,
  trunkMotion,
  trunkStability,
  type HeadDir,
  type HeadTargetPattern,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { CommandBanner } from '@/components/game/occupational/level6/session2/components/CommandBanner';
import { HeadCursor } from '@/components/game/occupational/level6/session3/components/HeadCursor';
import { MovingTarget } from '@/components/game/occupational/level6/session3/components/MovingTarget';
import { HeadIntroPanel, HeadHUD } from '@/components/game/occupational/level6/session3/shared/HeadUI';
import { HeadBackdrop } from '@/components/game/occupational/level6/session3/shared/HeadVisuals';
import { HEAD_GAME_THEMES, type HeadMode } from '@/components/game/occupational/level6/session3/spaceTheme';
import { SESSION3_PACING } from '@/components/game/occupational/level6/session3/session3Pacing';
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

const P = SESSION3_PACING;
const VOICE_PRAISE = ['Great tracking!', 'Awesome!', 'Smooth!', 'You did it!', 'Eyes on it!'];

type Phase = 'intro' | 'calibrate' | 'play';
type Kind = 'follow' | 'hold' | 'crown';

const STAR_PATTERNS: HeadTargetPattern[] = ['horizontal', 'vertical', 'diagonal', 'circle'];

const ZONE_CENTER: Record<HeadDir, Point> = {
  left: { x: 0.13, y: 0.45 },
  right: { x: 0.87, y: 0.45 },
  up: { x: 0.5, y: 0.13 },
  down: { x: 0.5, y: 0.84 },
};

const roundsForMode = (mode: HeadMode): number => {
  switch (mode) {
    case 'rocketWatch':
      return P.rocketRounds;
    case 'lookHold':
      return P.lookHoldRounds;
    case 'skyGround':
      return P.skyGroundRounds;
    case 'keepCrown':
      return P.crownRounds;
    case 'starTracker':
      return STAR_PATTERNS.length;
  }
};

const modeKind = (mode: HeadMode): Kind => {
  if (mode === 'rocketWatch' || mode === 'starTracker') return 'follow';
  if (mode === 'keepCrown') return 'crown';
  return 'hold';
};

export const HeadTrackingGame: React.FC<{
  mode: HeadMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = HEAD_GAME_THEMES[mode];
  const S = T.shell;
  const totalRounds = roundsForMode(mode);
  const kind = modeKind(mode);

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, error, previewContainerId } = poseDetection;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
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

  const [targetPos, setTargetPos] = useState<Point>({ x: 0.5, y: 0.45 });
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0.5, y: 0.5 });
  const [onTarget, setOnTarget] = useState(false);
  const [targetEmoji, setTargetEmoji] = useState('🚀');
  const [showTarget, setShowTarget] = useState(true);
  const [commandLabel, setCommandLabel] = useState('');
  const [commandCue, setCommandCue] = useState('');
  const [bannerPulse, setBannerPulse] = useState(0);
  const [crownStability, setCrownStability] = useState(1);
  const [crownSafePct, setCrownSafePct] = useState(100);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

  // ── Refs ──
  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const prevCursorRef = useRef<Point | null>(null);
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
  const roundStartRef = useRef(0);

  const patternRef = useRef<HeadTargetPattern>('wander');
  const dirRef = useRef<HeadDir>('left');
  const targetCenterRef = useRef<Point>({ x: 0.5, y: 0.45 });
  const onTargetMsRef = useRef(0);
  const totalTrackMsRef = useRef(0);
  const inZoneMsRef = useRef(0);
  const reachedRef = useRef(false);
  const reactedRef = useRef<number | null>(null);
  const safeMsRef = useRef(0);
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
    const xp = Math.round(finalScore * 22 + snap.avgPostureQuality * 0.4 + snap.uprightPct * 0.3);
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
          skillTags: ['head-control', 'neck-stability', 'visual-tracking', 'oculomotor-integration', 'postural-control'],
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

  // Follow-mode round end.
  const finishFollow = useCallback(() => {
    if (doneRef.current) return;
    const acc = totalTrackMsRef.current > 0 ? onTargetMsRef.current / totalTrackMsRef.current : 0;
    recordHold(onTargetMsRef.current);
    const earned = acc >= 0.45;
    if (earned) recordStar();
    awardStar(earned);
    setCoachCue(earned ? 'Great tracking! 🚀' : 'Keep your eyes on it next time!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold, recordStar]);

  // Crown-mode round end.
  const finishCrown = useCallback(() => {
    if (doneRef.current) return;
    const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 0;
    recordHold(safeMsRef.current);
    const earned = pct >= 55 && reachedRef.current;
    awardStar(earned);
    setCoachCue(earned ? 'The crown stayed on! 👑' : 'Move slowly and smoothly!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  // Hold-mode window end (fail path; success advances early).
  const finishHoldWindow = useCallback(() => {
    if (doneRef.current) return;
    phaseGuardComplete(() => {
      const reached = reachedRef.current;
      recordFreeze(reached, reactedRef.current ? reactedRef.current - roundStartRef.current : undefined);
      awardStar(reached);
      setCoachCue(reached ? 'Nice hold!' : 'Try to hold the look steady!');
      advanceRound();
    });
  }, [advanceRound, awardStar, phaseGuardComplete, recordFreeze]);

  const startRound = useCallback(() => {
    roundStartRef.current = Date.now();
    prevMetricsRef.current = null;
    prevCursorRef.current = null;
    onTargetMsRef.current = 0;
    totalTrackMsRef.current = 0;
    inZoneMsRef.current = 0;
    reachedRef.current = false;
    reactedRef.current = null;
    safeMsRef.current = 0;
    totalMsRef.current = 0;

    if (mode === 'rocketWatch') {
      patternRef.current = 'wander';
      setTargetEmoji('🚀');
      setShowTarget(true);
      setCommandLabel('');
      setCoachCue('Follow the rocket with your head!');
      schedule(() => finishFollow(), P.rocketRoundMs);
    } else if (mode === 'starTracker') {
      patternRef.current = STAR_PATTERNS[(roundRef.current - 1) % STAR_PATTERNS.length]!;
      setTargetEmoji('🌟');
      setShowTarget(true);
      setCommandLabel('');
      setCoachCue('Follow the star smoothly!');
      schedule(() => finishFollow(), P.starPatternMs);
    } else if (mode === 'lookHold') {
      const dir = HEAD_DIR_SEQUENCE[(roundRef.current - 1) % HEAD_DIR_SEQUENCE.length]!;
      dirRef.current = dir;
      targetCenterRef.current = ZONE_CENTER[dir];
      setTargetPos(ZONE_CENTER[dir]);
      setTargetEmoji('⭐');
      setShowTarget(true);
      setCommandLabel(`${HEAD_DIR_LABEL[dir].emoji} ${HEAD_DIR_LABEL[dir].label}`);
      setCommandCue(HEAD_DIR_LABEL[dir].cue);
      setBannerPulse((k) => k + 1);
      setCoachCue(HEAD_DIR_LABEL[dir].cue);
      schedule(() => finishHoldWindow(), P.lookHoldWindowMs);
    } else if (mode === 'skyGround') {
      const dir: HeadDir = roundRef.current % 2 === 1 ? 'up' : 'down';
      dirRef.current = dir;
      targetCenterRef.current = ZONE_CENTER[dir];
      setTargetPos(ZONE_CENTER[dir]);
      setTargetEmoji(dir === 'up' ? '☁️' : '🌸');
      setShowTarget(true);
      setCommandLabel(dir === 'up' ? '☁️ LOOK UP' : '🌸 LOOK DOWN');
      setCommandCue(dir === 'up' ? 'Look up at the clouds!' : 'Look down at the flowers!');
      setBannerPulse((k) => k + 1);
      setCoachCue(commandCue);
      schedule(() => finishHoldWindow(), P.skyGroundReachMs);
    } else if (mode === 'keepCrown') {
      const dir = HEAD_DIR_SEQUENCE[(roundRef.current - 1) % HEAD_DIR_SEQUENCE.length]!;
      dirRef.current = dir;
      targetCenterRef.current = ZONE_CENTER[dir];
      setTargetPos(ZONE_CENTER[dir]);
      setTargetEmoji(HEAD_DIR_LABEL[dir].emoji);
      setShowTarget(true);
      setCrownSafePct(100);
      setCommandLabel(`${HEAD_DIR_LABEL[dir].emoji} TURN ${dir.toUpperCase()}`);
      setCommandCue('Turn slowly — keep the crown balanced!');
      setBannerPulse((k) => k + 1);
      setCoachCue('Turn slowly and smoothly!');
      schedule(() => finishCrown(), P.crownTurnMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, schedule, finishFollow, finishHoldWindow, finishCrown]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

  // ── Main loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    // Head cursor (camera) or auto-follow (fallback).
    let cursor: Point;
    if (cam && m.present) {
      cursor = headCursor(m, base);
    } else {
      // Fallback: cursor gently tracks the target so play still feels responsive.
      cursor = targetCenterRef.current;
    }
    setCursorPos(cursor);

    // Trunk compensation (body should stay still).
    const compMotion = cam ? trunkMotion(prevMetricsRef.current, m) : 0;
    const trunkOk = trunkStability(compMotion) >= 0.5;
    prevMetricsRef.current = m;

    // Head smoothness (jerk).
    const jerk = prevCursorRef.current ? dist(cursor, prevCursorRef.current) : 0;
    prevCursorRef.current = cursor;

    if (kind === 'follow') {
      const prog = Math.min(1, (now - roundStartRef.current) / (mode === 'starTracker' ? P.starPatternMs : P.rocketRoundMs));
      const tgt = targetPath(patternRef.current, prog);
      setTargetPos(tgt);
      const d = cam ? dist(cursor, tgt) : 0;
      const near = cam ? d <= P.trackTolerance : true;
      setOnTarget(near);
      totalTrackMsRef.current += dt;
      if (near) onTargetMsRef.current += dt;
      if (cam && !trunkOk) recordPostureBreak();
      const q = cam ? Math.max(0, 1 - d / P.trackTolerance) : 0.85;
      setQuality(q);
      recordTick(dt, { upright: trunkOk, still: near, quality: q });
    } else if (kind === 'hold') {
      const tgt = targetCenterRef.current;
      const d = cam ? dist(cursor, tgt) : 0;
      const near = cam ? d <= P.holdTolerance : true;
      setOnTarget(near);
      const q = cam ? Math.max(0, 1 - d / P.holdTolerance) : 0.85;
      setQuality(q);
      if (near) {
        inZoneMsRef.current += dt;
        if (reactedRef.current === null) reactedRef.current = now;
        if (!reachedRef.current && inZoneMsRef.current >= P.lookHoldTargetMs) {
          reachedRef.current = true;
          if (cam && !trunkOk) recordPostureBreak();
          finishHoldWindow();
        }
      } else {
        inZoneMsRef.current = 0;
      }
      recordTick(dt, { upright: trunkOk, still: near, quality: q });
    } else {
      // crown: turn head to dir while keeping crown stable (smooth + body still).
      const tgt = targetCenterRef.current;
      const d = cam ? dist(cursor, tgt) : 0;
      if (cam && d <= P.holdTolerance * 1.3) reachedRef.current = true;
      if (!cam) reachedRef.current = true;
      const smooth = cam ? jerk <= P.crownSmoothTol : true;
      const stable = cam ? trunkOk && smooth : true;
      totalMsRef.current += dt;
      if (stable) safeMsRef.current += dt;
      else recordPostureBreak();
      const pct = totalMsRef.current > 0 ? (safeMsRef.current / totalMsRef.current) * 100 : 100;
      setCrownSafePct(pct);
      const stabScore = cam ? Math.max(0, 1 - jerk / P.crownSmoothTol) * (trunkOk ? 1 : 0.5) : 0.85;
      setCrownStability(stabScore);
      setQuality(stabScore);
      setOnTarget(reachedRef.current);
      recordTick(dt, { upright: trunkOk, still: smooth, quality: stabScore });
    }
  }, [finishHoldWindow, kind, mode, recordPostureBreak, recordTick]);

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
    setCoachCue('Look straight at the screen and hold still!');
    speakTTS('Look straight ahead and keep your head still!', 0.8).catch(() => {});
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
    }, 100);
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
      <HeadBackdrop backdrop={T.backdrop} shell={S} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: S.backBorder }]}>
            <Text style={[styles.backText, { color: S.backText }]}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 64 }} />
        </View>

        <HeadHUD theme={T} round={round} totalRounds={totalRounds} score={score} coins={coins} />

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
              <>
                {(commandLabel.length > 0) && (
                  <CommandBanner label={commandLabel} cue={commandCue} tone="command" pulseKey={bannerPulse} />
                )}
                {showTarget && <MovingTarget pos={targetPos} emoji={targetEmoji} locked={onTarget} />}
                {mode === 'keepCrown' && <CrownOverlay stability={crownStability} safePct={crownSafePct} />}
                {usingCamera && <HeadCursor pos={cursorPos} onTarget={onTarget} visible={present} accent={T.accent} />}
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={S.sparkleColor} count={14} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Look straight… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
                </View>
              </View>
            )}
          </CameraStage>
        </View>

        {phase === 'intro' && (
          <HeadIntroPanel
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
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '70%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(6,10,31,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
});

export default HeadTrackingGame;
