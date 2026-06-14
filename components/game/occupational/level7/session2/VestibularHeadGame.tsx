/**
 * Vestibular Head Academy — OT Level 7 Session 2 shared head-movement engine.
 *
 * Drives all five Head Movement & Vestibular Activation games from camera-derived
 * head direction (APK + web) or guided fallback.
 *
 * Modes: lookUpExplorer · skyGroundMission · helicopterWatch · starTracker · turnAndFind
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
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  headCursor,
  SKY_TREASURE_SPOTS,
  targetPath,
  trunkMotion,
  trunkStability,
  TURN_DIR_LABEL,
  TURN_SEARCH_SEQUENCE,
  vestibularHeadQuality,
  type HeadDir,
  type HeadTargetPattern,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
  type TurnDir,
} from '@/components/game/occupational/level7/session2/poseUtils';
import { SESSION2_PACING } from '@/components/game/occupational/level7/session2/session2Pacing';
import { VESTIBULAR_HEAD_SHELL, VESTIBULAR_HEAD_THEMES, type VestibularHeadMode } from '@/components/game/occupational/level7/session2/vestibularHeadTheme';
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

const P = SESSION2_PACING;
const VOICE_PRAISE = ['Great tracking!', 'Smooth move!', 'Found it!', 'Awesome!', 'Nice head control!'];

type Phase = 'intro' | 'calibrate' | 'play';
type Kind = 'follow' | 'hold';

const STAR_PATTERNS: HeadTargetPattern[] = ['horizontal', 'vertical', 'diagonal', 'circle'];

const ZONE_CENTER: Record<HeadDir, Point> = {
  left: { x: 0.13, y: 0.45 },
  right: { x: 0.87, y: 0.45 },
  up: { x: 0.5, y: 0.13 },
  down: { x: 0.5, y: 0.84 },
};

const roundsForMode = (mode: VestibularHeadMode): number => {
  switch (mode) {
    case 'lookUpExplorer':
      return P.lookUpRounds;
    case 'skyGroundMission':
      return P.skyGroundRounds;
    case 'helicopterWatch':
      return P.helicopterRounds;
    case 'starTracker':
      return P.starPatterns;
    case 'turnAndFind':
      return P.turnFindRounds;
  }
};

const modeKind = (mode: VestibularHeadMode): Kind =>
  mode === 'helicopterWatch' || mode === 'starTracker' ? 'follow' : 'hold';

const followDuration = (mode: VestibularHeadMode): number =>
  mode === 'helicopterWatch' ? P.helicopterRoundMs : P.starPatternMs;

export const VestibularHeadGame: React.FC<{
  mode: VestibularHeadMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = VESTIBULAR_HEAD_THEMES[mode];
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
  const [targetEmoji, setTargetEmoji] = useState('☁️');
  const [showTarget, setShowTarget] = useState(true);
  const [commandLabel, setCommandLabel] = useState('');
  const [commandCue, setCommandCue] = useState('');
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
  const targetCenterRef = useRef<Point>({ x: 0.5, y: 0.45 });
  const onTargetMsRef = useRef(0);
  const totalTrackMsRef = useRef(0);
  const inZoneMsRef = useRef(0);
  const reachedRef = useRef(false);
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
          type: `vestibular-head-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: [
            'vestibular-activation',
            'head-control',
            'visual-vestibular-integration',
            'neck-mobility',
            'postural-control',
            'spatial-awareness',
          ],
          meta: { ...analyticsMeta(accuracy), mode },
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

  const finishFollow = useCallback(() => {
    if (doneRef.current) return;
    const acc = totalTrackMsRef.current > 0 ? onTargetMsRef.current / totalTrackMsRef.current : 0;
    recordHold(onTargetMsRef.current);
    const earned = acc >= P.followMinAcc;
    awardStar(earned);
    setCoachCue(earned ? 'Smooth tracking! 🎯' : 'Try to stay on target longer!');
    advanceRound();
  }, [advanceRound, awardStar, recordHold]);

  const finishHoldWindow = useCallback(() => {
    if (doneRef.current) return;
    phaseGuardComplete(() => {
      const reached = reachedRef.current;
      recordFreeze(reached, reactedRef.current ? reactedRef.current - roundStartRef.current : undefined);
      awardStar(reached);
      setCoachCue(reached ? 'Target found! ✨' : 'Try to reach and hold the look!');
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

    if (mode === 'helicopterWatch') {
      patternRef.current = 'horizontal';
      setTargetEmoji('🚁');
      setShowTarget(true);
      setCommandLabel('🚁 FOLLOW');
      setCommandCue('Track the helicopter across the sky!');
      setBannerPulse((k) => k + 1);
      setCoachCue('Follow the helicopter with your head!');
      schedule(() => finishFollow(), P.helicopterRoundMs);
    } else if (mode === 'starTracker') {
      patternRef.current = STAR_PATTERNS[(roundRef.current - 1) % STAR_PATTERNS.length]!;
      setTargetEmoji('⭐');
      setShowTarget(true);
      setCommandLabel('⭐ TRACK STAR');
      setCommandCue('Follow the magical star!');
      setBannerPulse((k) => k + 1);
      setCoachCue('Follow the star in every direction!');
      schedule(() => finishFollow(), P.starPatternMs);
    } else if (mode === 'lookUpExplorer') {
      const spot = SKY_TREASURE_SPOTS[(roundRef.current - 1) % SKY_TREASURE_SPOTS.length]!;
      targetCenterRef.current = spot;
      setTargetPos(spot);
      setTargetEmoji('💎');
      setShowTarget(true);
      setCommandLabel('👆 LOOK UP');
      setCommandCue('Look up to find the sky treasure!');
      setBannerPulse((k) => k + 1);
      setCoachCue('Look up toward the treasure!');
      schedule(() => finishHoldWindow(), P.lookUpWindowMs);
    } else if (mode === 'skyGroundMission') {
      const dir: HeadDir = roundRef.current % 2 === 1 ? 'up' : 'down';
      targetCenterRef.current = ZONE_CENTER[dir];
      setTargetPos(ZONE_CENTER[dir]);
      setTargetEmoji(dir === 'up' ? '☁️' : '🔍');
      setShowTarget(true);
      setCommandLabel(dir === 'up' ? '☁️ SKY CLUE' : '🔍 GROUND CLUE');
      setCommandCue(dir === 'up' ? 'Look up at the sky for clues!' : 'Look down at the ground!');
      setBannerPulse((k) => k + 1);
      setCoachCue(dir === 'up' ? 'Search the sky!' : 'Search the ground!');
      schedule(() => finishHoldWindow(), P.skyGroundReachMs);
    } else if (mode === 'turnAndFind') {
      const dir = TURN_SEARCH_SEQUENCE[(roundRef.current - 1) % TURN_SEARCH_SEQUENCE.length]! as TurnDir;
      targetCenterRef.current = ZONE_CENTER[dir];
      setTargetPos(ZONE_CENTER[dir]);
      setTargetEmoji('🎯');
      setShowTarget(true);
      const lbl = TURN_DIR_LABEL[dir];
      setCommandLabel(`${lbl.emoji} ${lbl.label}`);
      setCommandCue(lbl.cue);
      setBannerPulse((k) => k + 1);
      setCoachCue(lbl.cue);
      schedule(() => finishHoldWindow(), P.turnFindWindowMs);
    }
  }, [finishFollow, finishHoldWindow, mode, schedule]);

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

    let cursor: Point;
    if (cam && m.present) {
      cursor = headCursor(m, base);
    } else {
      cursor = targetCenterRef.current;
    }
    setCursorPos(cursor);

    const compMotion = cam ? trunkMotion(prevMetricsRef.current, m) : 0;
    const trunkOk = trunkStability(compMotion) >= 0.48;
    const trunkVal = trunkStability(compMotion);
    setTrunkScore(trunkVal);
    prevMetricsRef.current = m;

    const jerk = prevCursorRef.current ? dist(cursor, prevCursorRef.current) : 0;
    prevCursorRef.current = cursor;

    if (kind === 'follow') {
      const prog = Math.min(1, (now - roundStartRef.current) / followDuration(mode));
      const tgt = targetPath(patternRef.current, prog);
      setTargetPos(tgt);
      const d = cam ? dist(cursor, tgt) : 0;
      const near = cam ? d <= P.trackTolerance : true;
      setOnTarget(near);
      totalTrackMsRef.current += dt;
      if (near) onTargetMsRef.current += dt;
      if (cam && !trunkOk) recordPostureBreak();
      const trackAcc = cam ? Math.max(0, 1 - d / P.trackTolerance) : 0.85;
      const q = vestibularHeadQuality(trackAcc, compMotion, m, base, jerk);
      setQuality(q);
      recordTick(dt, { upright: trunkOk, still: near, quality: q });
    } else {
      const tgt = targetCenterRef.current;
      const d = cam ? dist(cursor, tgt) : 0;
      const tol = mode === 'lookUpExplorer' ? P.holdTolerance * 0.95 : P.holdTolerance;
      const near = cam ? d <= tol : true;
      setOnTarget(near);
      const trackAcc = cam ? Math.max(0, 1 - d / tol) : 0.85;
      const q = vestibularHeadQuality(trackAcc, compMotion, m, base, jerk);
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
      if (cam && !trunkOk) recordPostureBreak();
      recordTick(dt, { upright: trunkOk, still: near, quality: q });
    }
  }, [finishHoldWindow, kind, mode, recordPostureBreak, recordTick]);

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
    <LinearGradient colors={VESTIBULAR_HEAD_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: VESTIBULAR_HEAD_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: VESTIBULAR_HEAD_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌅 VESTIBULAR HEAD</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: VESTIBULAR_HEAD_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: VESTIBULAR_HEAD_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: VESTIBULAR_HEAD_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: VESTIBULAR_HEAD_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: VESTIBULAR_HEAD_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: VESTIBULAR_HEAD_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={[styles.statValue, { color: VESTIBULAR_HEAD_SHELL.statValue }]}>{coins}</Text>
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
                {commandLabel.length > 0 && (
                  <CommandBanner label={commandLabel} cue={commandCue} tone="command" pulseKey={bannerPulse} />
                )}
                {showTarget && <MovingTarget pos={targetPos} emoji={targetEmoji} locked={onTarget} />}
                {usingCamera && <HeadCursor pos={cursorPos} onTarget={onTarget} visible={present} accent={T.accent} />}
                <TrunkStabilityBar stability={trunkScore} accent={T.accent} />
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={VESTIBULAR_HEAD_SHELL.sparkleColor} count={14} />

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
                      ? 'Sit where the camera sees your head and shoulders. Move your head smoothly!'
                      : 'Starting camera…'
                    : 'Guided mode: follow along with head movements!'}
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
  academyLabel: { color: '#FCD34D', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#FDE68A', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(30,16,51,0.75)', overflow: 'hidden' },
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

export default VestibularHeadGame;
