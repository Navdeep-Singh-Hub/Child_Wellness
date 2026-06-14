/**
 * OT Champions — OT Level 6 Session 10 integrated core-challenge engine.
 *
 * Runs a scripted sequence of mixed tasks (posture, balance, reaching, shifting,
 * head tracking, animal movement, stillness) drawn from every earlier session.
 * Each task is detected from the camera (web) or auto-completed in a guided
 * fallback (native / no camera). Holding the condition for the task's dwell time
 * collects a treasure and advances; a per-task window keeps the course flowing.
 *
 * Modes: jungleAdventure · pirateMission · spaceExplorer · mountainRescue · otObstacleCourse
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import {
  averageBaseline,
  balanceQuality,
  bodyLowered,
  DEFAULT_BASELINE,
  dirZone,
  EMPTY_METRICS,
  frameMotionFull,
  handInZone,
  headCursor,
  isCrossBody,
  legLift,
  limbMotion,
  movementIntensity,
  reachInfo,
  shiftZone,
  swayStillness,
  uprightScore,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { TaskCue } from '@/components/game/occupational/level6/session10/components/TaskCue';
import { CHAMPION_GAME_THEMES, TASK_INFO, type ChampionMode, type TaskType } from '@/components/game/occupational/level6/session10/championTheme';
import { SESSION10_PACING } from '@/components/game/occupational/level6/session10/session10Pacing';
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

const P = SESSION10_PACING;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PRAISE = ['Great job!', 'Treasure found!', 'Awesome!', 'You did it!', 'Keep going, champion!'];

type Phase = 'intro' | 'calibrate' | 'play';

/** Detect whether a single integrated task's condition is currently met. */
function evaluateTask(
  task: TaskType,
  m: PostureMetrics,
  base: PostureBaseline,
  motion: number,
  prev: PostureMetrics | null,
): { met: boolean; quality: number } {
  switch (task) {
    case 'standTall': {
      const up = uprightScore(m, base);
      return { met: up >= P.uprightThreshold, quality: up };
    }
    case 'balanceOne': {
      const lift = legLift(m);
      const bq = balanceQuality(m, base, motion);
      const met = lift.legsVisible
        ? lift.lifted !== 'none' && lift.amount >= P.legLiftAmount
        : bq >= P.balanceFallbackQuality;
      return { met, quality: bq };
    }
    case 'reachLeft':
    case 'reachRight': {
      const info = reachInfo(m);
      const side = task === 'reachLeft' ? 'left' : 'right';
      const hand = handInZone(info, side, P.reachTolerance);
      return { met: hand != null, quality: hand != null ? 1 : 0.3 };
    }
    case 'crossLeft':
    case 'crossRight': {
      const info = reachInfo(m);
      const side = task === 'crossLeft' ? 'left' : 'right';
      const hand = handInZone(info, side, P.reachTolerance);
      let met = false;
      if (hand) {
        const hx = hand === 'left' ? info.leftX : info.rightX;
        met = hx != null && isCrossBody(hand, hx, P.crossMargin);
      }
      return { met, quality: met ? 1 : 0.3 };
    }
    case 'shiftLeft':
    case 'shiftRight': {
      const zone = shiftZone(weightShift(m, base).x);
      const side = task === 'shiftLeft' ? 'left' : 'right';
      return { met: zone === side, quality: zone === side ? 1 : 0.4 };
    }
    case 'statueStill': {
      const s = swayStillness(motion);
      return { met: s >= P.stillnessThreshold, quality: s };
    }
    case 'marchStep': {
      const it = movementIntensity(limbMotion(prev, m));
      return { met: it >= P.marchIntensity, quality: clamp01(it) };
    }
    case 'animalCrouch': {
      const low = bodyLowered(m);
      return { met: low >= P.loweredThreshold, quality: low };
    }
    case 'lookLeft':
    case 'lookRight':
    case 'lookUp':
    case 'lookDown': {
      const want = task.slice(4).toLowerCase();
      const dir = dirZone(headCursor(m, base));
      return { met: dir === want, quality: dir === want ? 1 : 0.4 };
    }
  }
}

export const IntegratedChallengeGame: React.FC<{
  mode: ChampionMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = CHAMPION_GAME_THEMES[mode];
  const sequence = T.sequence;
  const totalTasks = sequence.length;

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
  const [taskIndex, setTaskIndex] = useState(0);
  const [treasures, setTreasures] = useState(0);
  const [progress, setProgress] = useState(0);
  const [met, setMet] = useState(false);
  const [quality, setQuality] = useState(0);
  const [courseSec, setCourseSec] = useState(0);
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
  const taskRef = useRef(0);
  const doneRef = useRef(false);
  const usingCameraRef = useRef(usingCamera);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickRef = useRef(0);

  const dwellRef = useRef(0);
  const taskStartRef = useRef(0);
  const lastMetRef = useRef(0);
  const courseStartRef = useRef(0);
  const taskActiveRef = useRef(false);
  const treasuresRef = useRef(0);

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

    const collected = treasuresRef.current;
    const accuracy = totalTasks > 0 ? Math.round((collected / totalTasks) * 100) : 0;
    const courseMs = Date.now() - courseStartRef.current;
    const snap = analyticsSnapshot(accuracy);
    const xp = Math.round(collected * 22 + snap.avgPostureQuality * 0.6 + accuracy * 0.5);
    setFinalStats({ correct: collected, total: totalTasks, xp, accuracy });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `posture-${mode}` as any,
          correct: collected,
          total: totalTasks,
          accuracy,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: ['core-stability', 'dynamic-balance', 'motor-planning', 'postural-control', 'coordination', 'endurance', 'integrated-skills'],
          meta: { ...analyticsMeta(accuracy), courseMs },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsSnapshot, analyticsMeta, clearTimers, mode, router, T.voiceComplete, totalTasks]);

  const startTaskRef = useRef<() => void>(() => {});

  const completeTask = useCallback(
    (success: boolean) => {
      if (doneRef.current || !taskActiveRef.current) return;
      taskActiveRef.current = false;
      const task = sequence[taskRef.current]!;
      const reaction = Date.now() - taskStartRef.current;
      recordFreeze(success, success ? reaction : undefined);
      if (success) {
        recordStar();
        recordHold(TASK_INFO[task].dwellMs);
        treasuresRef.current += 1;
        setTreasures(treasuresRef.current);
        setSparkleKey((k) => k + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS(PRAISE[Math.floor(Math.random() * PRAISE.length)]!, 0.8).catch(() => {});
        setCoachCue('Treasure collected! 🌟');
      } else {
        setCoachCue("Let's try the next one!");
      }

      const next = taskRef.current + 1;
      taskRef.current = next;
      setTaskIndex(next);
      if (next >= totalTasks) {
        schedule(() => endGame(), P.nextTaskDelayMs);
      } else {
        schedule(() => startTaskRef.current(), P.nextTaskDelayMs);
      }
    },
    [endGame, recordFreeze, recordHold, recordStar, schedule, sequence, totalTasks],
  );

  const startTask = useCallback(() => {
    if (doneRef.current) return;
    dwellRef.current = 0;
    taskStartRef.current = Date.now();
    lastMetRef.current = Date.now();
    taskActiveRef.current = true;
    setProgress(0);
    setMet(false);
    const task = sequence[taskRef.current]!;
    setCoachCue(TASK_INFO[task].cue);
    speakTTS(TASK_INFO[task].cue, 0.85).catch(() => {});
  }, [sequence]);

  useEffect(() => {
    startTaskRef.current = startTask;
  }, [startTask]);

  // ── Main loop ──
  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play' || !taskActiveRef.current) return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;
    setCourseSec(Math.floor((now - courseStartRef.current) / 1000));

    const task = sequence[taskRef.current]!;
    const info = TASK_INFO[task];
    const m = metricsRef.current;
    const base = baselineRef.current;
    const cam = usingCameraRef.current;

    let isMet: boolean;
    let q: number;
    if (!cam) {
      isMet = true;
      q = 0.85;
      dwellRef.current += dt;
    } else {
      const motion = frameMotionFull(prevMetricsRef.current, m, true);
      const res = evaluateTask(task, m, base, motion, prevMetricsRef.current);
      prevMetricsRef.current = m;
      isMet = res.met;
      q = res.quality;
      if (isMet) {
        dwellRef.current += dt;
        lastMetRef.current = now;
      } else if (now - lastMetRef.current > P.dwellGraceMs) {
        dwellRef.current = 0;
        if (m.present) recordPostureBreak();
      }
    }

    setMet(isMet);
    setQuality(q);
    setProgress(clamp01(dwellRef.current / info.dwellMs));
    setCoachCue(isMet ? 'Hold it… 🌟' : info.cue);
    recordTick(dt, { upright: isMet, still: isMet, quality: q });

    if (dwellRef.current >= info.dwellMs) {
      completeTask(true);
    } else if (now - taskStartRef.current >= P.taskWindowMs) {
      completeTask(false);
    }
  }, [completeTask, recordPostureBreak, recordTick, sequence]);

  // ── Calibration ──
  const beginPlay = useCallback(() => {
    resetAnalytics();
    prevMetricsRef.current = null;
    courseStartRef.current = Date.now();
    setPhase('play');
    phaseRef.current = 'play';
    lastTickRef.current = 0;
    schedule(() => startTaskRef.current(), P.courseIntroDelayMs);
  }, [resetAnalytics, schedule]);

  const beginCalibration = useCallback(() => {
    if (!cameraSupported || forceFallback) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall facing the camera, looking straight ahead — hold still!');
    speakTTS('Stand tall facing me, looking straight ahead!', 0.8).catch(() => {});
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

  const taskLabel = Math.min(taskIndex + 1, totalTasks);
  const current = sequence[Math.min(taskIndex, totalTasks - 1)]!;
  const info = TASK_INFO[current];

  return (
    <LinearGradient colors={T.gradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={[styles.backText, { color: T.textLight }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.academyLabel, { color: T.textSoft }]}>{T.bannerLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={[styles.subtitle, { color: T.textSoft }]}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={[styles.statLabel, { color: T.textSoft }]}>Task</Text>
              <Text style={styles.statValue}>
                {taskLabel}/{totalTasks}
              </Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.coinEmoji}>{T.treasure}</Text>
              <Text style={styles.statValue}>{treasures}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.coinEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{courseSec}s</Text>
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
              <TaskCue
                emoji={info.emoji}
                label={info.label}
                cue={info.cue}
                progress={progress}
                active={met}
                accent={T.accent}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.accent} count={18} />

            {phase === 'calibrate' && (
              <View style={styles.calibWrap} pointerEvents="none">
                <Text style={styles.calibText}>Calibrating… {Math.round(calibProgress * 100)}%</Text>
                <View style={styles.calibTrack}>
                  <View style={[styles.calibFill, { width: `${calibProgress * 100}%`, backgroundColor: T.accent }]} />
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
                <Text style={[styles.introText, { color: T.textLight }]}>
                  {cameraSupported
                    ? hasCamera
                      ? 'Stand back so the camera sees your whole body — clear some space for the course!'
                      : 'Starting camera…'
                    : 'Guided mode: follow the coach through every task!'}
                </Text>
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: T.accent, opacity: cameraSupported && !hasCamera ? 0.6 : 1 }]}
                  disabled={cameraSupported && !hasCamera}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryBtnText}>{T.hero} Start Challenge</Text>
                </Pressable>
                {cameraSupported && (
                  <Pressable style={styles.linkBtn} onPress={() => { setForceFallback(true); handleStart(); }}>
                    <Text style={[styles.linkText, { color: T.textSoft }]}>No camera? Play guided mode</Text>
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
  backBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' },
  backText: { fontSize: 14, fontWeight: '800' },
  academyLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { color: '#FEF3C7', fontSize: 16, fontWeight: '900' },
  coinEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(15,23,42,0.7)', overflow: 'hidden' },
  calibFill: { height: '100%' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)' },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { paddingVertical: 6 },
  linkText: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default IntegratedChallengeGame;
