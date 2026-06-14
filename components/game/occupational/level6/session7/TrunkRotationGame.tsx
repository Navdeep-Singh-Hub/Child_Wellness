/**
 * Aurora Twist — OT Level 6 Session 7 shared trunk-rotation & reaching engine.
 *
 * Drives all five games from camera-derived wrist reach + trunk rotation (web),
 * or a guided fallback (native / no camera).
 *
 * Modes: applePicker · pirateTreasure · turnTouch · crossBodyCatch · twistingStarHunt
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  handInZone,
  isCrossBody,
  reachInfo,
  turnProxy,
  weightBalanceScore,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ShiftTarget } from '@/components/game/occupational/level6/session5/components/ShiftTarget';
import { ReachGauge } from '@/components/game/occupational/level6/session7/components/ReachGauge';
import { AURORA_SHELL, ROTATE_GAME_THEMES, type RotateMode } from '@/components/game/occupational/level6/session7/auroraTheme';
import { SESSION7_PACING } from '@/components/game/occupational/level6/session7/session7Pacing';
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

const P = SESSION7_PACING;
const VOICE_PRAISE = ['Nice reach!', 'Got it!', 'Awesome twist!', 'You did it!', 'Great rotation!'];

type Phase = 'intro' | 'calibrate' | 'play';

const cfgForMode = (mode: RotateMode): { targets: number; windowMs: number } => {
  switch (mode) {
    case 'applePicker':
      return { targets: P.appleTargets, windowMs: P.appleWindowMs };
    case 'pirateTreasure':
      return { targets: P.treasureTargets, windowMs: P.treasureWindowMs };
    case 'turnTouch':
      return { targets: P.turnTargets, windowMs: P.turnWindowMs };
    case 'crossBodyCatch':
      return { targets: P.catchTargets, windowMs: P.catchWindowMs };
    case 'twistingStarHunt':
      return { targets: P.starTargets, windowMs: P.starWindowMs };
  }
};

export const TrunkRotationGame: React.FC<{
  mode: RotateMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = ROTATE_GAME_THEMES[mode];
  const { targets: totalRounds, windowMs } = cfgForMode(mode);

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

  const [targetSide, setTargetSide] = useState<ShiftDir>('left');
  const [reachX, setReachX] = useState(0);
  const [turnPct, setTurnPct] = useState(0);
  const [inZone, setInZone] = useState(false);

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
  const dwellRef = useRef(0);
  const roundStartRef = useRef(0);
  const reactedRef = useRef<number | null>(null);

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
          skillTags: ['trunk-rotation', 'cross-midline-reaching', 'core-stability', 'bilateral-coordination', 'motor-planning'],
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
        if (earned) {
          recordStar();
          recordHold(P.collectDwellMs);
        }
        awardStar(earned);
        setInZone(false);
        if (earned) setCoachCue(T.requireCross ? 'Cross-body reach! 💪' : 'Collected! 🌟');
        else setCoachCue('Reach a little further next time!');
        advanceRound();
      });
    },
    [advanceRound, awardStar, phaseGuardComplete, recordFreeze, recordHold, recordStar, T.requireCross],
  );

  const startRound = useCallback(() => {
    dwellRef.current = 0;
    roundStartRef.current = Date.now();
    reactedRef.current = null;
    setInZone(false);
    // Alternate-ish sides with randomness for variety.
    const side: ShiftDir = Math.random() < 0.5 ? 'left' : 'right';
    targetSideRef.current = side;
    setTargetSide(side);
    if (T.requireCross) setCoachCue(`Reach across to the ${side} ${mode === 'crossBodyCatch' ? 'energy ball' : 'treasure'}!`);
    else if (T.requireTurn) setCoachCue(`Turn and reach to the ${side} target!`);
    else setCoachCue(`Reach to the ${side} ${mode === 'applePicker' ? 'apple' : 'star'}!`);
    schedule(() => finishRound(false), windowMs);
  }, [T.requireCross, T.requireTurn, mode, schedule, finishRound, windowMs]);

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
    const side = targetSideRef.current;

    const info = cam ? reachInfo(m) : { leftX: null, rightX: null, domX: 0, domHand: null };
    const turn = cam ? turnProxy(m, base) : 0.85;
    const balance = cam ? weightBalanceScore(m, base) : 0.85;

    let matched: boolean;
    if (!cam) {
      const t = Math.min(1, (now - roundStartRef.current) / P.fallbackReachMs);
      setReachX((side === 'left' ? -1 : 1) * 0.9 * t);
      setTurnPct(0.7 * t);
      matched = true;
    } else {
      setReachX(info.domX);
      setTurnPct(turn);
      const hand = handInZone(info, side, P.reachTolerance);
      let ok = hand != null;
      if (ok && T.requireCross) {
        const hx = hand === 'left' ? info.leftX! : info.rightX!;
        ok = isCrossBody(hand!, hx, P.crossMargin);
      }
      if (ok && T.requireTurn) ok = turn >= P.turnThreshold;
      matched = ok;
    }

    setInZone(matched);
    if (matched) {
      if (reactedRef.current === null) reactedRef.current = now;
      dwellRef.current += dt;
    } else {
      dwellRef.current = 0;
      if (cam && balance < P.balanceThreshold) recordPostureBreak();
    }
    const q = cam ? balance : 0.85;
    setQuality(q);
    recordTick(dt, { upright: balance >= P.balanceThreshold, still: matched, quality: q });

    if (dwellRef.current >= P.collectDwellMs) finishRound(true);
  }, [finishRound, recordPostureBreak, recordTick, T.requireCross, T.requireTurn]);

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
    setCoachCue('Stand tall facing the camera with your arms down — hold still!');
    speakTTS('Stand tall facing me with your arms down!', 0.8).catch(() => {});
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
    <LinearGradient colors={AURORA_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: AURORA_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: AURORA_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌌 AURORA TWIST</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: AURORA_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: AURORA_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: AURORA_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: AURORA_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: AURORA_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: AURORA_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: AURORA_SHELL.statValue }]}>{coins}</Text>
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
              <ShiftTarget side={targetSide} emoji={T.collectible} active accent={T.accent} />
            )}
            {phase === 'play' && (
              <ReachGauge
                reachX={reachX}
                target={targetSide}
                inZone={inZone}
                turnPct={turnPct}
                showTurn={T.requireTurn}
                accent={T.accent}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={AURORA_SHELL.sparkleColor} count={14} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Stand tall… {Math.round(calibProgress * 100)}%</Text>
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
                      ? 'Stand back so the camera can see your body and arms — give yourself room to reach!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the coach and reach across!'}
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
  academyLabel: { color: '#A5F3FC', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#A5F3FC', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(8,51,68,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#CFFAFE', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)' },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { paddingVertical: 6 },
  linkText: { color: '#67E8F9', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default TrunkRotationGame;
