/**
 * Direction Compass — OT Level 7 Session 3 shared direction-change engine.
 *
 * Drives all five Direction Changes games from camera-derived weight shift,
 * body turn and balance (APK + web), or guided fallback.
 *
 * Modes: directionSwitch · goLeftGoRight · pirateTurnHunt · turnAroundQuest · followTheArrow
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { WeightShiftBar } from '@/components/game/occupational/level6/session5/components/WeightShiftBar';
import { ArrowDirectionCue } from '@/components/game/occupational/level7/session3/components/ArrowDirectionCue';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  dirCueMatched,
  DIR_CUE_INFO,
  directionChangeQuality,
  EMPTY_METRICS,
  FOLLOW_ARROW_SEQ,
  frameMotionFull,
  PIRATE_HUNT_SEQ,
  shiftTargetOf,
  TURN_QUEST_SEQ,
  turnProxy,
  weightBalanceScore,
  weightShift,
  type DirCue,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level7/session3/poseUtils';
import { SESSION3_PACING } from '@/components/game/occupational/level7/session3/session3Pacing';
import { DIRECTION_GAME_THEMES, DIRECTION_SHELL, type DirectionMode } from '@/components/game/occupational/level7/session3/directionTheme';
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

const P = SESSION3_PACING;
const VOICE_PRAISE = ['Great switch!', 'Nice turn!', 'Got it!', 'Perfect direction!', 'Awesome move!'];

type Phase = 'intro' | 'calibrate' | 'play';

const randDir = (): DirCue => {
  const r = Math.random();
  return r < 0.35 ? 'left' : r < 0.7 ? 'right' : 'center';
};

const buildSequence = (mode: DirectionMode): DirCue[] => {
  switch (mode) {
    case 'directionSwitch':
      return Array.from({ length: P.directionSwitchCount }, randDir);
    case 'goLeftGoRight':
      return Array.from({ length: P.goLeftRightCount }, (_, i) => (i % 2 === 0 ? 'left' : 'right'));
    case 'pirateTurnHunt':
      return [...PIRATE_HUNT_SEQ];
    case 'turnAroundQuest':
      return [...TURN_QUEST_SEQ];
    case 'followTheArrow':
      return [...FOLLOW_ARROW_SEQ];
  }
};

const dwellFor = (cue: DirCue): number => {
  switch (cue) {
    case 'turn180':
      return P.turn180DwellMs;
    case 'turn90':
      return P.turn90DwellMs;
    default:
      return P.shiftDwellMs;
  }
};

const windowFor = (mode: DirectionMode): number =>
  mode === 'directionSwitch' ? P.fastWindowMs : P.actionWindowMs;

export const DirectionChangeGame: React.FC<{
  mode: DirectionMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = DIRECTION_GAME_THEMES[mode];

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
  const [sequence, setSequence] = useState<DirCue[]>(() => buildSequence(mode));
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
  const currentCue = sequence[round - 1] ?? 'center';
  const cueInfo = DIR_CUE_INFO[currentCue];

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);
  const sequenceRef = useRef<DirCue[]>(sequence);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

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
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

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
    const xp = Math.round(finalScore * 22 + snap.avgPostureQuality * 0.42 + snap.uprightPct * 0.32);
    setFinalStats({ correct: finalScore, total: totalRounds, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `vestibular-dir-${mode}` as any,
          correct: finalScore,
          total: totalRounds,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: [
            'vestibular-adaptation',
            'dynamic-balance',
            'motor-planning',
            'direction-awareness',
            'spatial-orientation',
            'sequencing',
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
    if (roundRef.current >= sequenceRef.current.length) {
      endGame();
      return;
    }
    setRound((r) => r + 1);
    schedule(() => startRoundRef.current(), P.nextRoundDelayMs);
  }, [endGame, schedule]);

  const finishCue = useCallback(
    (earned: boolean) => {
      if (doneRef.current) return;
      phaseGuardComplete(() => {
        const reaction = reactedRef.current ? reactedRef.current - roundStartRef.current : undefined;
        recordFreeze(earned, reaction);
        if (earned) recordHold(dwellFor(sequenceRef.current[roundRef.current - 1] ?? 'center'));
        awardStar(earned);
        setMatchedNow(false);
        setActionProgress(0);
        setCoachCue(earned ? 'Great direction change! 🎯' : 'Follow the next arrow!');
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
    const cue = sequenceRef.current[roundRef.current - 1] ?? 'center';
    const info = DIR_CUE_INFO[cue];
    setCoachCue(info.cue);
    speakTTS(info.cue, 0.85).catch(() => {});
    schedule(() => finishCue(false), windowFor(mode));
  }, [finishCue, mode, schedule]);

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
    const cue = sequenceRef.current[roundRef.current - 1] ?? 'center';

    const ws = cam ? weightShift(m, base) : { x: 0, y: 0 };
    const balance = cam ? weightBalanceScore(m, base) : 0.85;
    const motion = cam ? frameMotionFull(prevMetricsRef.current, m) : 0;
    const turn = cam ? turnProxy(m, base) : 0.85;
    prevMetricsRef.current = m;

    const shiftDisplay =
      cue === 'left' ? -0.42 : cue === 'right' ? 0.42 : 0;
    setShiftXDisplay(cam ? ws.x : shiftDisplay);

    let matched: boolean;
    if (!cam) {
      matched = true;
    } else {
      matched = dirCueMatched(
        cue,
        ws,
        turn,
        balance,
        P.stepTolerance,
        P.balanceThreshold,
        P.turn90Min,
        P.turn180Min,
      );
      if (!matched && balance < P.balanceThreshold * 0.7) recordPostureBreak();
    }

    const req = dwellFor(cue);
    if (matched) {
      if (reactedRef.current === null) reactedRef.current = now;
      dwellRef.current += dt;
    } else {
      dwellRef.current = 0;
    }

    setMatchedNow(matched);
    setActionProgress(Math.min(1, dwellRef.current / req));
    const q = directionChangeQuality(matched, balance, m, base, motion);
    setQuality(q);
    recordTick(dt, { upright: balance >= P.balanceThreshold, still: matched, quality: q });

    if (dwellRef.current >= req) finishCue(true);
  }, [finishCue, recordPostureBreak, recordTick]);

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
    setCoachCue('Stand tall in the center — whole body visible, ready to move!');
    speakTTS('Stand tall in the middle, facing me. Get ready to change direction!', 0.8).catch(() => {});
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

  const shiftTarget = shiftTargetOf(currentCue);

  return (
    <LinearGradient colors={DIRECTION_SHELL.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: DIRECTION_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: DIRECTION_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧭 DIRECTION COMPASS</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: DIRECTION_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: DIRECTION_SHELL.statLabel }]}>Cue</Text>
              <Text style={[styles.statValue, { color: DIRECTION_SHELL.statValue }]}>
                {round}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: DIRECTION_SHELL.statBorder }]}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: DIRECTION_SHELL.statValue }]}>{score}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: DIRECTION_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: DIRECTION_SHELL.statValue }]}>{coins}</Text>
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
                <ArrowDirectionCue
                  emoji={cueInfo.emoji}
                  label={cueInfo.label}
                  progress={actionProgress}
                  active={matchedNow}
                  accent={T.accent}
                  trafficStyle={T.trafficStyle}
                />
                {shiftTarget && (
                  <WeightShiftBar
                    shiftX={shiftXDisplay}
                    target={shiftTarget}
                    inZone={matchedNow}
                    accent={T.accent}
                  />
                )}
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={DIRECTION_SHELL.sparkleColor} count={14} />

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
                      ? 'Stand back so the camera sees your whole body — room to step and turn!'
                      : 'Starting camera…'
                    : 'Guided mode: follow each direction arrow!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Quest</Text>
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
  academyLabel: { color: '#6EE7B7', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#A7F3D0', fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(4,47,46,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#FACC15' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#A7F3D0', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#6EE7B7', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default DirectionChangeGame;
