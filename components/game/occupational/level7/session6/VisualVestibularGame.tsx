/**
 * Visual-Vestibular Integration — OT Level 7 Session 6 shared engine.
 *
 * All five games are continuous "follow" tracking: a target moves along a path
 * and the child tracks it with eyes/head while staying balanced and upright.
 * Scoring blends tracking accuracy with dynamic balance, trunk stability and
 * smoothness (camera/APK + web), with a guided fallback.
 *
 * Modes: rocketFollow · butterflyChase · balloonDrift · ufoWatch · orbitTracker
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { CommandBanner } from '@/components/game/occupational/level6/session2/components/CommandBanner';
import { HeadCursor } from '@/components/game/occupational/level6/session3/components/HeadCursor';
import { MovingTarget } from '@/components/game/occupational/level6/session3/components/MovingTarget';
import { TrunkStabilityBar } from '@/components/game/occupational/level7/session2/components/TrunkStabilityBar';
import {
  averageBaseline,
  BALLOON_PATTERNS,
  BUTTERFLY_PATTERNS,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  headCursor,
  ORBIT_PATTERNS,
  ROCKET_PATTERNS,
  targetPath,
  trunkMotion,
  trunkStability,
  UFO_PATTERNS,
  visualVestibularQuality,
  type HeadTargetPattern,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level7/session6/poseUtils';
import { SESSION6_PACING } from '@/components/game/occupational/level7/session6/session6Pacing';
import {
  VISUAL_VESTIBULAR_SHELL,
  VISUAL_VESTIBULAR_THEMES,
  type VisualVestibularMode,
} from '@/components/game/occupational/level7/session6/visualVestibularTheme';
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

const P = SESSION6_PACING;
const VOICE_PRAISE = ['Great tracking!', 'Smooth move!', 'You caught it!', 'Awesome!', 'Nice and steady!'];

type Phase = 'intro' | 'calibrate' | 'play';

const roundsForMode = (mode: VisualVestibularMode): number => {
  switch (mode) {
    case 'rocketFollow':
      return P.rocketRounds;
    case 'butterflyChase':
      return P.butterflyRounds;
    case 'balloonDrift':
      return P.balloonRounds;
    case 'ufoWatch':
      return P.ufoRounds;
    case 'orbitTracker':
      return P.orbitRounds;
  }
};

const patternsForMode = (mode: VisualVestibularMode): HeadTargetPattern[] => {
  switch (mode) {
    case 'rocketFollow':
      return ROCKET_PATTERNS;
    case 'butterflyChase':
      return BUTTERFLY_PATTERNS;
    case 'balloonDrift':
      return BALLOON_PATTERNS;
    case 'ufoWatch':
      return UFO_PATTERNS;
    case 'orbitTracker':
      return ORBIT_PATTERNS;
  }
};

export const VisualVestibularGame: React.FC<{
  mode: VisualVestibularMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = VISUAL_VESTIBULAR_THEMES[mode];
  const totalRounds = roundsForMode(mode);

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
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [trunkScore, setTrunkScore] = useState(1);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [targetPos, setTargetPos] = useState<Point>({ x: 0.5, y: 0.45 });
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0.5, y: 0.5 });
  const [onTarget, setOnTarget] = useState(false);
  const [bannerPulse, setBannerPulse] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;

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

  const patternRef = useRef<HeadTargetPattern>('horizontal');
  const onTargetMsRef = useRef(0);
  const totalTrackMsRef = useRef(0);

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
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.8).catch(() => {});
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
        recordStar();
        celebrate();
        praise();
      }
    },
    [celebrate, praise, recordStar],
  );

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const finalScore = scoreRef.current;
    const accuracy = totalRounds > 0 ? Math.round((finalScore / totalRounds) * 100) : 0;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(finalScore * 24 + snap.avgPostureQuality * 0.45 + snap.uprightPct * 0.35);
    setFinalStats({ correct: finalScore, total: totalRounds, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `visual-vestibular-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: [
            'visual-vestibular-integration',
            'visual-tracking',
            'ocular-vestibular-coordination',
            'dynamic-balance',
            'postural-control',
            'spatial-orientation',
          ],
          meta: { ...analyticsMeta(accuracy), mode },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalRounds]);

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

  const finishFollow = useCallback(() => {
    if (doneRef.current) return;
    const acc = totalTrackMsRef.current > 0 ? onTargetMsRef.current / totalTrackMsRef.current : 0;
    recordHold(onTargetMsRef.current);
    const earned = acc >= P.followMinAcc;
    awardStar(earned);
    setCoachCue(earned ? 'Smooth tracking! 🎯' : 'Try to stay on the target longer!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  const startRound = useCallback(() => {
    roundStartRef.current = Date.now();
    prevMetricsRef.current = null;
    prevCursorRef.current = null;
    onTargetMsRef.current = 0;
    totalTrackMsRef.current = 0;

    const patterns = patternsForMode(mode);
    patternRef.current = patterns[(roundRef.current - 1) % patterns.length]!;
    setOnTarget(false);
    setBannerPulse((k) => k + 1);
    setCoachCue(T.commandCue);
    speakTTS(T.commandCue, 0.85).catch(() => {});
    schedule(() => finishFollow(), P.followRoundMs);
  }, [finishFollow, mode, schedule, T.commandCue]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    const prog = Math.min(1, (now - roundStartRef.current) / P.followRoundMs);
    const tgt = targetPath(patternRef.current, prog);
    setTargetPos(tgt);

    let cursor: Point;
    if (cam && m.present) {
      cursor = headCursor(m, base);
    } else {
      cursor = tgt;
    }
    setCursorPos(cursor);

    const compMotion = cam ? trunkMotion(prevMetricsRef.current, m) : 0;
    const trunkVal = trunkStability(compMotion);
    const trunkOk = trunkVal >= 0.48;
    setTrunkScore(trunkVal);
    prevMetricsRef.current = m;

    const jerk = prevCursorRef.current ? dist(cursor, prevCursorRef.current) : 0;
    prevCursorRef.current = cursor;

    const d = cam ? dist(cursor, tgt) : 0;
    const near = cam ? d <= P.trackTolerance : true;
    setOnTarget(near);
    totalTrackMsRef.current += dt;
    if (near) onTargetMsRef.current += dt;
    if (cam && !trunkOk) recordPostureBreak();

    const trackAcc = cam ? Math.max(0, 1 - d / P.trackTolerance) : 0.85;
    const q = visualVestibularQuality(trackAcc, compMotion, m, base, jerk);
    setQuality(q);
    recordTick(dt, { upright: trunkOk, still: near, quality: q });
  }, [recordPostureBreak, recordTick]);

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
    setCoachCue('Look straight at the screen — hold still for calibration!');
    speakTTS('Look straight ahead. Keep your head still!', 0.8).catch(() => {});
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
    <LinearGradient colors={VISUAL_VESTIBULAR_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: VISUAL_VESTIBULAR_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: VISUAL_VESTIBULAR_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌌 SPACE TRACKER</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: VISUAL_VESTIBULAR_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: VISUAL_VESTIBULAR_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: VISUAL_VESTIBULAR_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: VISUAL_VESTIBULAR_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: VISUAL_VESTIBULAR_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: VISUAL_VESTIBULAR_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={[styles.statValue, { color: VISUAL_VESTIBULAR_SHELL.statValue }]}>{coins}</Text>
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
              <>
                <CommandBanner label={T.commandLabel} cue={T.commandCue} tone="command" pulseKey={bannerPulse} />
                <MovingTarget pos={targetPos} emoji={T.targetEmoji} locked={onTarget} />
                {usingCamera && <HeadCursor pos={cursorPos} onTarget={onTarget} visible={present} accent={T.accent} />}
                <TrunkStabilityBar stability={trunkScore} accent={T.accent} />
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={VISUAL_VESTIBULAR_SHELL.sparkleColor} count={14} />

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
                      ? 'Stand back so the camera sees your head and body. Track the target and stay balanced!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the target with your head!'}
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
  academyLabel: { color: '#A5B4FC', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#C7D2FE', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '900' },
  starEmoji: { fontSize: 14 },
  coinEmoji: { fontSize: 14 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(11,16,38,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FACC15' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#C7D2FE', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#A5B4FC', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default VisualVestibularGame;
