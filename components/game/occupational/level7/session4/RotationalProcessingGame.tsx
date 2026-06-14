/**
 * Rotational Vortex — OT Level 7 Session 4 shared rotational-processing engine.
 *
 * Modes: tornadoTurn · spinAndStop · helicopterPilot · orbitHunt · turnAndPoint
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { HeadCursor } from '@/components/game/occupational/level6/session3/components/HeadCursor';
import { MovingTarget } from '@/components/game/occupational/level6/session3/components/MovingTarget';
import { TrunkStabilityBar } from '@/components/game/occupational/level7/session2/components/TrunkStabilityBar';
import { RotationCue } from '@/components/game/occupational/level7/session4/components/RotationCue';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  headCursor,
  HELICOPTER_SEQ,
  ORBIT_HUNT_SEQ,
  orbitStarPos,
  pointMatched,
  rotCueMatched,
  ROT_CUE_INFO,
  rotationalQuality,
  TORNADO_SEQ,
  TURN_POINT_ROUNDS,
  trunkMotion,
  trunkStability,
  turnProxy,
  weightBalanceScore,
  type Point,
  type PostureBaseline,
  type PostureMetrics,
  type RotCue,
  type RotRound,
} from '@/components/game/occupational/level7/session4/poseUtils';
import { SESSION4_PACING } from '@/components/game/occupational/level7/session4/session4Pacing';
import { ROTATIONAL_GAME_THEMES, ROTATIONAL_SHELL, type RotationalMode } from '@/components/game/occupational/level7/session4/rotationalTheme';
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

const P = SESSION4_PACING;
const VOICE_PRAISE = ['Great stop!', 'Smooth turn!', 'Caught it!', 'Perfect spin!', 'Awesome control!'];

type Phase = 'intro' | 'calibrate' | 'play';
type SubPhase = 'main' | 'spin' | 'stop' | 'turn' | 'point';

const buildRounds = (mode: RotationalMode): RotRound[] => {
  switch (mode) {
    case 'tornadoTurn':
      return TORNADO_SEQ.map((cue) => ({ type: 'cue' as const, cue }));
    case 'spinAndStop':
      return Array.from({ length: P.spinStopCount }, () => ({ type: 'spinStop' as const }));
    case 'helicopterPilot':
      return HELICOPTER_SEQ.map((cue) => ({ type: 'cue' as const, cue }));
    case 'orbitHunt':
      return ORBIT_HUNT_SEQ.map((cue) => ({ type: 'cue' as const, cue }));
    case 'turnAndPoint':
      return [...TURN_POINT_ROUNDS];
  }
};

const dwellForCue = (cue: RotCue): number => {
  if (cue === 'stop') return P.stopDwellMs;
  if (cue === 'spin') return P.spinDwellMs;
  if (cue.startsWith('orbit')) return P.orbitDwellMs;
  return P.turnDwellMs;
};

export const RotationalProcessingGame: React.FC<{
  mode: RotationalMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = ROTATIONAL_GAME_THEMES[mode];

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
  const [rounds, setRounds] = useState<RotRound[]>(() => buildRounds(mode));
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [trunkScore, setTrunkScore] = useState(1);
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [displayEmoji, setDisplayEmoji] = useState('🌀');
  const [displayLabel, setDisplayLabel] = useState('READY');
  const [actionProgress, setActionProgress] = useState(0);
  const [matchedNow, setMatchedNow] = useState(false);
  const [urgentCue, setUrgentCue] = useState(false);
  const [starPos, setStarPos] = useState<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0.5, y: 0.5 });
  const [pointTarget, setPointTarget] = useState<Point | null>(null);
  const [showHeadCursor, setShowHeadCursor] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(null);

  const usingCamera = cameraSupported && !forceFallback;
  const totalRounds = rounds.length;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);
  const roundsRef = useRef<RotRound[]>(rounds);

  const subPhaseRef = useRef<SubPhase>('main');
  const activeCueRef = useRef<RotCue>('turn90');
  const pointTargetRef = useRef<Point>({ x: 0.5, y: 0.5 });

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);
  const roundStartRef = useRef(0);
  const dwellRef = useRef(0);
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
  useEffect(() => {
    roundsRef.current = rounds;
  }, [rounds]);

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
          type: `vestibular-rot-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: [
            'rotational-processing',
            'vestibular-tolerance',
            'balance-recovery',
            'motor-planning',
            'spatial-orientation',
            'visual-vestibular-integration',
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
    if (roundRef.current >= roundsRef.current.length) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRoundRef.current(), P.nextRoundDelayMs);
  }, [endGame, schedule]);

  const finishRound = useCallback(
    (earned: boolean) => {
      if (doneRef.current) return;
      phaseGuardComplete(() => {
        const reaction = reactedRef.current ? reactedRef.current - roundStartRef.current : undefined;
        recordFreeze(earned, reaction);
        if (earned) recordHold(dwellRef.current);
        awardStar(earned);
        setMatchedNow(false);
        setActionProgress(0);
        setUrgentCue(false);
        setShowHeadCursor(false);
        setStarPos(null);
        setPointTarget(null);
        setCoachCue(earned ? 'Great rotational control! 🌀' : 'Try the next one!');
        advanceRound();
      });
    },
    [advanceRound, awardStar, phaseGuardComplete, recordFreeze, recordHold],
  );

  const applyCueDisplay = useCallback((cue: RotCue, urgent = false) => {
    const info = ROT_CUE_INFO[cue];
    activeCueRef.current = cue;
    setDisplayEmoji(info.emoji);
    setDisplayLabel(info.label);
    setCoachCue(info.cue);
    setUrgentCue(urgent);
    const star = orbitStarPos(cue);
    setStarPos(star);
    setShowHeadCursor(cue === 'stop' || mode === 'turnAndPoint');
  }, [mode]);

  const beginStopPhase = useCallback(() => {
    subPhaseRef.current = 'stop';
    applyCueDisplay('stop', true);
    speakTTS('Stop! Freeze and balance!', 0.9).catch(() => {});
    dwellRef.current = 0;
    reactedRef.current = null;
  }, [applyCueDisplay]);

  const beginPointPhase = useCallback((target: Point) => {
    subPhaseRef.current = 'point';
    pointTargetRef.current = target;
    setPointTarget(target);
    setDisplayEmoji('👆');
    setDisplayLabel('POINT!');
    setCoachCue('Point your head at the target!');
    setShowHeadCursor(true);
    setStarPos(target);
    setUrgentCue(false);
    dwellRef.current = 0;
    reactedRef.current = null;
    speakTTS('Now point at the target!', 0.85).catch(() => {});
  }, []);

  const startRound = useCallback(() => {
    dwellRef.current = 0;
    roundStartRef.current = Date.now();
    reactedRef.current = null;
    prevMetricsRef.current = null;
    setActionProgress(0);
    setMatchedNow(false);

    const r = roundsRef.current[roundRef.current - 1];
    if (!r) return;

    if (r.type === 'spinStop') {
      subPhaseRef.current = 'spin';
      applyCueDisplay('spin');
      speakTTS('Spin slowly!', 0.85).catch(() => {});
      schedule(() => beginStopPhase(), P.spinPhaseMs);
      schedule(() => finishRound(false), P.spinStopWindowMs);
    } else if (r.type === 'turnPoint') {
      subPhaseRef.current = 'turn';
      applyCueDisplay(r.turn);
      pointTargetRef.current = r.point;
      speakTTS(ROT_CUE_INFO[r.turn].cue, 0.85).catch(() => {});
      schedule(() => finishRound(false), P.actionWindowMs);
    } else {
      subPhaseRef.current = 'main';
      applyCueDisplay(r.cue);
      speakTTS(ROT_CUE_INFO[r.cue].cue, 0.85).catch(() => {});
      schedule(() => finishRound(false), P.actionWindowMs);
    }
  }, [applyCueDisplay, beginStopPhase, finishRound, schedule]);

  useEffect(() => {
    startRoundRef.current = startRound;
  }, [startRound]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;
    const r = roundsRef.current[roundRef.current - 1];

    const balance = cam ? weightBalanceScore(m, base) : 0.85;
    const motion = cam ? frameMotionFull(prevMetricsRef.current, m) : 0;
    const turn = cam ? turnProxy(m, base) : 0.85;
    const trunkM = cam ? trunkMotion(prevMetricsRef.current, m) : 0;
    const trunkOk = trunkStability(trunkM);
    setTrunkScore(trunkOk);
    prevMetricsRef.current = m;

    const cursor = cam && m.present ? headCursor(m, base) : { x: 0.5, y: 0.5 };
    setCursorPos(cursor);

    let matched = false;
    let req = P.turnDwellMs;

    if (!cam) {
      matched = true;
    } else if (r?.type === 'turnPoint' && subPhaseRef.current === 'turn') {
      const cue = r.turn;
      matched = rotCueMatched(
        cue,
        turn,
        motion,
        balance,
        P.turn90Min,
        P.turn180Min,
        P.spinMotionMin,
        P.stopStillMin,
        P.balanceThreshold,
      );
      req = P.turnPhaseDwellMs;
      if (matched && dwellRef.current === 0 && reactedRef.current === null) reactedRef.current = now;
      if (matched) {
        dwellRef.current += dt;
        if (dwellRef.current >= req) {
          beginPointPhase(r.point);
        }
      } else {
        dwellRef.current = 0;
      }
    } else if (r?.type === 'turnPoint' && subPhaseRef.current === 'point') {
      matched = pointMatched(cursor, pointTargetRef.current, P.pointTol);
      req = P.pointDwellMs;
      if (matched) {
        if (reactedRef.current === null) reactedRef.current = now;
        dwellRef.current += dt;
      } else {
        dwellRef.current = 0;
      }
      if (!trunkOk) recordPostureBreak();
    } else if (r?.type === 'spinStop') {
      const cue = subPhaseRef.current === 'spin' ? 'spin' : 'stop';
      matched = rotCueMatched(
        cue,
        turn,
        motion,
        balance,
        P.turn90Min,
        P.turn180Min,
        P.spinMotionMin,
        P.stopStillMin,
        P.balanceThreshold,
      );
      req = cue === 'stop' ? P.stopDwellMs : P.spinDwellMs;
      if (matched) {
        if (reactedRef.current === null) reactedRef.current = now;
        dwellRef.current += dt;
      } else if (cue === 'stop') {
        dwellRef.current = 0;
      }
    } else if (r?.type === 'cue') {
      matched = rotCueMatched(
        r.cue,
        turn,
        motion,
        balance,
        P.turn90Min,
        P.turn180Min,
        P.spinMotionMin,
        P.stopStillMin,
        P.balanceThreshold,
      );
      req = dwellForCue(r.cue);
      if (matched) {
        if (reactedRef.current === null) reactedRef.current = now;
        dwellRef.current += dt;
      } else if (r.cue === 'stop') {
        dwellRef.current = 0;
      } else {
        dwellRef.current = 0;
      }
      if (!matched && balance < P.balanceThreshold * 0.65) recordPostureBreak();
    }

    setMatchedNow(matched);
    setActionProgress(Math.min(1, dwellRef.current / req));
    const q = rotationalQuality(matched, balance, m, base, motion, trunkOk);
    setQuality(q);
    recordTick(dt, { upright: trunkOk >= 0.45, still: matched, quality: q });

    if (matched && dwellRef.current >= req && subPhaseRef.current !== 'turn') {
      finishRound(true);
    }
  }, [beginPointPhase, finishRound, recordPostureBreak, recordTick]);

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
    setCoachCue('Stand tall facing the camera — room to turn slowly!');
    speakTTS('Stand tall facing me. Get ready to turn!', 0.8).catch(() => {});
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
    setRounds(buildRounds(mode));
    beginCalibration();
  }, [beginCalibration, mode]);

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
    <LinearGradient colors={ROTATIONAL_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: ROTATIONAL_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: ROTATIONAL_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌀 ROTATIONAL VORTEX</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: ROTATIONAL_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: ROTATIONAL_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: ROTATIONAL_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: ROTATIONAL_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: ROTATIONAL_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: ROTATIONAL_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: ROTATIONAL_SHELL.statValue }]}>{coins}</Text>
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
                <RotationCue
                  emoji={displayEmoji}
                  label={displayLabel}
                  progress={actionProgress}
                  active={matchedNow}
                  accent={T.accent}
                  urgent={urgentCue}
                />
                {starPos && <MovingTarget pos={starPos} emoji="⭐" locked={matchedNow} />}
                {showHeadCursor && usingCamera && (
                  <HeadCursor pos={cursorPos} onTarget={matchedNow} visible={present} accent={T.accent} />
                )}
                <TrunkStabilityBar stability={trunkScore} accent={T.accent} />
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={ROTATIONAL_SHELL.sparkleColor} count={14} />

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
                      ? 'Stand back with room to turn slowly — whole body visible!'
                      : 'Starting camera…'
                    : 'Guided mode: follow each spin and stop cue!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Spinning</Text>
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
  academyLabel: { color: '#E9D5FF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#F0ABFC', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibWrap: { position: 'absolute', top: '46%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(26,5,51,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FACC15' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#E9D5FF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#E9D5FF', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default RotationalProcessingGame;
