/**
 * Two-Step Motor Planning — OT Level 8 Session 2 shared engine.
 *
 * Each round: a PLAN beat showing both steps, then the child EXECUTES step 1,
 * then step 2, in the correct order. Steps are movement primitives detected from
 * the camera (APK + web): reach/touch/pick/place targets, or clap · jump · turn ·
 * freeze · launch · catch gestures. Includes a fully-playable guided fallback.
 *
 * Modes: clapThenJump · touchThenTurn · reachThenFreeze · launchThenCatch · pickAndPlace
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  averageBaseline,
  centerOfMass,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { TwoStepOverlay } from '@/components/game/occupational/level8/session2/components/TwoStepOverlay';
import {
  TWO_STEP_GAME_THEMES,
  TWO_STEP_SHELL,
  type Anchor,
  type Step,
  type TwoStepMode,
} from '@/components/game/occupational/level8/session2/twoStepTheme';
import { SESSION2_PACING as P } from '@/components/game/occupational/level8/session2/session2Pacing';
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

const VOICE_PRAISE = ['Perfect plan!', 'Great sequence!', 'You nailed it!', 'Brilliant order!', 'Awesome moves!'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const dist = (a: Anchor, b: Anchor) => Math.hypot(a.x - b.x, a.y - b.y);

type Phase = 'intro' | 'calibrate' | 'play';

const wristScreens = (m: PostureMetrics): Anchor[] => {
  const out: Anchor[] = [];
  if (m.leftWrist) out.push({ x: 1 - m.leftWrist.x, y: m.leftWrist.y });
  if (m.rightWrist) out.push({ x: 1 - m.rightWrist.x, y: m.rightWrist.y });
  return out;
};

/** Per-tick evaluation of one gesture/target step. */
type StepEval = { ok: boolean; approach: number; transient: boolean; holdMs: number; probe: Anchor | null; dist: number };

export const TwoStepPlanGame: React.FC<{
  mode: TwoStepMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = TWO_STEP_GAME_THEMES[mode];
  const totalRounds = T.rounds;

  const [active, setActive] = useState(true);
  const poseDetection = usePoseDetection(active);
  const { metrics, present, isDetecting, hasCamera, cameraSupported, permissionGranted, error, previewContainerId } =
    poseDetection;

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
  const [round, setRound] = useState(0);
  const [stepIndex, setStepIndex] = useState<0 | 1>(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [near, setNear] = useState(false);
  const [progress, setProgress] = useState(0);
  const [handPos, setHandPos] = useState<Anchor | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = cameraSupported && !forceFallback;

  const metricsRef = useRef<PostureMetrics>(EMPTY_METRICS);
  const prevMetricsRef = useRef<PostureMetrics | null>(null);
  const baselineRef = useRef<PostureBaseline>(DEFAULT_BASELINE);
  const calibSamplesRef = useRef<PostureMetrics[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);

  const roundRef = useRef(0);
  const stepRef = useRef<0 | 1>(0);
  const roundActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastOkRef = useRef(0);
  const stepStartRef = useRef(0);
  const minDistRef = useRef(1);
  const stepAccRef = useRef<number[]>([]);
  const accSumRef = useRef(0);
  const accCountRef = useRef(0);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    camLiveRef.current = camLive;
  }, [camLive]);

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

  const stepDef = useCallback((s: 0 | 1): Step => (s === 0 ? T.step1 : T.step2), [T.step1, T.step2]);

  const anchorFor = useCallback(
    (r: number, s: 0 | 1): Anchor | null => {
      const step = s === 0 ? T.step1 : T.step2;
      if (!step.targeted) return null;
      if (T.pairs && T.pairs.length > 0) {
        const pair = T.pairs[r % T.pairs.length]!;
        return pair[s];
      }
      if (T.anchors && T.anchors.length > 0) return T.anchors[r % T.anchors.length]!;
      return null;
    },
    [T.anchors, T.pairs, T.step1, T.step2],
  );

  /** Evaluate the current step's detection condition for this frame. */
  const evalStep = useCallback(
    (step: Step, m: PostureMetrics, prev: PostureMetrics | null, base: PostureBaseline, anchor: Anchor | null): StepEval => {
      const ws = wristScreens(m);
      switch (step.kind) {
        case 'reach':
        case 'touch':
        case 'pick':
        case 'place': {
          let probe: Anchor | null = null;
          let d = 1;
          if (anchor) {
            for (const w of ws) {
              const wd = dist(w, anchor);
              if (wd < d) {
                d = wd;
                probe = w;
              }
            }
          }
          return { ok: probe !== null && d <= P.reachRadius, approach: clamp01(1 - d / (P.reachRadius * 1.6)), transient: false, holdMs: P.reachHoldMs, probe, dist: d };
        }
        case 'clap': {
          if (!m.leftWrist || !m.rightWrist) return { ok: false, approach: 0, transient: false, holdMs: P.clapHoldMs, probe: null, dist: 1 };
          const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
          const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
          const wd = dist(lw, rw);
          const cy = (lw.y + rw.y) / 2;
          const ok = wd <= P.clapDist && cy >= P.clapMinY && cy <= P.clapMaxY;
          return { ok, approach: clamp01(1 - (wd - P.clapDist) / 0.25), transient: false, holdMs: P.clapHoldMs, probe: null, dist: wd };
        }
        case 'jump': {
          const com = centerOfMass(m);
          const rise = base.comY - com.y;
          return { ok: rise >= P.jumpRise, approach: clamp01(rise / P.jumpRise), transient: true, holdMs: 0, probe: null, dist: 1 };
        }
        case 'turn': {
          const ratio = m.shoulderWidth / Math.max(0.08, base.shoulderWidthBase);
          const ok = ratio <= P.turnShrinkRatio;
          return { ok, approach: clamp01((1 - ratio) / (1 - P.turnShrinkRatio)), transient: false, holdMs: P.turnHoldMs, probe: null, dist: 1 };
        }
        case 'freeze': {
          const motion = frameMotionFull(prev, m, true);
          const ok = m.present && motion <= P.freezeMotionMax;
          return { ok, approach: clamp01(1 - motion / (P.freezeMotionMax * 2)), transient: false, holdMs: P.freezeHoldMs, probe: null, dist: 1 };
        }
        case 'launch': {
          if (!m.leftWrist || !m.rightWrist) return { ok: false, approach: 0, transient: false, holdMs: P.launchHoldMs, probe: null, dist: 1 };
          const ly = m.leftWrist.y;
          const ry = m.rightWrist.y;
          const ok = ly <= P.launchY && ry <= P.launchY;
          const app = clamp01(1 - (Math.max(ly, ry) - P.launchY) / 0.4);
          return { ok, approach: app, transient: false, holdMs: P.launchHoldMs, probe: null, dist: 1 };
        }
        case 'catch': {
          if (!m.leftWrist || !m.rightWrist) return { ok: false, approach: 0, transient: false, holdMs: P.catchHoldMs, probe: null, dist: 1 };
          const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
          const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
          const wd = dist(lw, rw);
          const cy = (lw.y + rw.y) / 2;
          const ok = wd <= P.catchDist && cy >= P.catchMinY && cy <= P.catchMaxY;
          return { ok, approach: clamp01(1 - (wd - P.catchDist) / 0.25), transient: false, holdMs: P.catchHoldMs, probe: null, dist: wd };
        }
        default:
          return { ok: false, approach: 0, transient: false, holdMs: P.reachHoldMs, probe: null, dist: 1 };
      }
    },
    [],
  );

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const completed = completedRef.current;
    const completion = totalRounds > 0 ? completed / totalRounds : 0;
    const reachAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + reachAcc * 0.5) * 100);
    const xp = Math.round(completed * 18 + reachAcc * 100 * 0.4 + moveQuality * 100 * 0.4);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `motor-plan2-${mode}` as any,
          correct: completed,
          total: totalRounds,
          accuracy: headline,
          xpAwarded: xp,
          durationMs: snap.durationMs,
          responseTimeMs: snap.avgReactionMs,
          skillTags: T.skillTags,
          meta: {
            ...analyticsMeta(headline),
            mode,
            sequenceAccuracy: Math.round(reachAcc * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, mode, router, T.skillTags, T.voiceComplete, totalRounds]);

  const beginStep = useCallback(
    (s: 0 | 1) => {
      stepRef.current = s;
      setStepIndex(s);
      holdStartRef.current = 0;
      lastOkRef.current = 0;
      minDistRef.current = 1;
      stepStartRef.current = Date.now();
      setProgress(0);
      setNear(false);
      setHandPos(null);
      roundActiveRef.current = true;
      setRoundActive(true);
      const def = s === 0 ? T.step1 : T.step2;
      setBanner(`${def.icon} ${def.label}!`);
      schedule(() => setBanner(''), 900);
    },
    [schedule, T.step1, T.step2],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    setProgress(0);
    setBanner('');

    const accs = stepAccRef.current;
    const roundAcc = accs.length > 0 ? accs.reduce((a, b) => a + b, 0) / accs.length : 0.85;
    accSumRef.current += roundAcc;
    accCountRef.current += 1;
    completedRef.current += 1;
    recordHold(P.reachHoldMs);

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      setCoins((c) => c + 1);
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endGame, recordHold, recordStar, schedule, totalRounds]);

  const onStepDone = useCallback(
    (stepAccuracy: number) => {
      stepAccRef.current.push(stepAccuracy);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (stepRef.current === 0) {
        roundActiveRef.current = false;
        setRoundActive(false);
        const next = T.step2;
        setBanner(`Nice! Now ${next.label} ${next.icon}`);
        speakTTS(`Now ${next.label}`, 0.9).catch(() => {});
        schedule(() => beginStep(1), P.betweenStepsMs);
      } else {
        completeRound();
      }
    },
    [beginStep, completeRound, schedule, T.step2],
  );

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      roundRef.current = r;
      setRound(r);
      stepAccRef.current = [];
      roundActiveRef.current = false;
      setRoundActive(false);
      stepRef.current = 0;
      setStepIndex(0);
      setProgress(0);
      setNear(false);
      setHandPos(null);
      setBanner(`Plan: ${T.step1.icon} ${T.step1.label} → ${T.step2.icon} ${T.step2.label}`);
      setCoachCue(T.hintText);
      if (r === 0 || r % 2 === 0) speakTTS(T.voicePlan, 0.85).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        Haptics.selectionAsync().catch(() => {});
        beginStep(0);
      }, P.planDelayMs);
    },
    [beginStep, schedule, T.hintText, T.step1, T.step2, T.voicePlan],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const s = stepRef.current;
    const step = stepDef(s);
    const anchor = anchorFor(roundRef.current, s);

    // Guided fallback — auto-complete each step on a timer.
    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - stepStartRef.current;
        const t = clamp01(elapsed / P.fallbackStepMs);
        setProgress(t);
        if (step.targeted && anchor) {
          const start = { x: 0.5, y: 0.82 };
          setHandPos({ x: start.x + (anchor.x - start.x) * t, y: start.y + (anchor.y - start.y) * t });
          setNear(t > 0.8);
          setAccuracy(0.6 + 0.3 * t);
        } else {
          setAccuracy(0.6 + 0.3 * t);
        }
        if (t >= 1) onStepDone(0.85);
      }
      recordTick(dt, { upright: true, still: step.kind === 'freeze', quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    if (!m.present) {
      setCoachCue(T.positionCue);
      setHandPos(null);
      setNear(false);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }
    setCoachCue(T.hintText);

    const base = baselineRef.current;
    const positioned = uprightScore(m, base) >= 0.25;
    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.intensityCeiling);
    const controlled = clamp01(1 - Math.max(0, intensity - P.jerkHigh) / (1 - P.jerkHigh));
    const q = clamp01((positioned ? 0.5 : 0.3) + 0.5 * controlled);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    const ev = evalStep(step, m, prev, base, anchor);

    if (step.targeted) {
      setHandPos(ev.probe);
      setNear(ev.ok);
      setAccuracy(ev.approach);
      if (roundActiveRef.current && ev.probe && ev.dist < minDistRef.current) minDistRef.current = ev.dist;
    } else {
      setHandPos(null);
      setNear(ev.ok);
      setAccuracy(ev.approach);
    }

    if (roundActiveRef.current) {
      if (ev.transient) {
        setProgress(ev.ok ? 1 : ev.approach);
        if (ev.ok) onStepDone(0.85);
      } else if (ev.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastOkRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / ev.holdMs);
        setProgress(prog);
        if (prog >= 1) {
          const acc = step.targeted ? clamp01(1 - minDistRef.current / (P.reachRadius * 1.6)) : 0.9;
          onStepDone(acc);
        }
      } else {
        setProgress(ev.approach * 0.85);
        if (now - lastOkRef.current > P.holdGraceMs) holdStartRef.current = 0;
      }
    }

    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: step.kind === 'freeze' && ev.ok, quality: q });
    prevMetricsRef.current = m;
  }, [anchorFor, evalStep, onStepDone, recordPostureBreak, recordTick, stepDef, T.hintText, T.positionCue]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    accSumRef.current = 0;
    accCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    setCoins(0);
    setPhase('play');
    phaseRef.current = 'play';
    startRound(0);
  }, [resetAnalytics, startRound]);

  const beginCalibration = useCallback(() => {
    if (!camLive) {
      beginPlay();
      return;
    }
    setPhase('calibrate');
    phaseRef.current = 'calibrate';
    setCoachCue('Stand tall facing the camera — let me see your whole body!');
    speakTTS('Stand tall facing me, with room to move all around!', 0.8).catch(() => {});
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
  }, [beginPlay, camLive]);

  useEffect(() => {
    if (phase !== 'play') return;
    tickTimerRef.current = setInterval(tick, P.tickMs);
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

  const handleStart = useCallback(async () => {
    if (cameraSupported && !forceFallback && !permissionGranted) {
      const granted = await poseDetection.requestCameraAccess();
      if (!granted) setCoachCue('Camera not allowed — playing guided mode. You can allow it in Settings.');
    }
    beginCalibration();
  }, [beginCalibration, cameraSupported, forceFallback, permissionGranted, poseDetection]);

  const handleBack = useCallback(() => {
    setActive(false);
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

  const curStep = stepDef(stepIndex);
  const curAnchor = anchorFor(round, stepIndex);

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
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: TWO_STEP_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: TWO_STEP_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🧠 MOTOR PLANNING LAB II</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: TWO_STEP_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: TWO_STEP_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: TWO_STEP_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: TWO_STEP_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: TWO_STEP_SHELL.statValue }]}>{coins}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <CameraStage
            {...poseStageNativeProps(poseDetection)}
            previewContainerId={previewContainerId}
            cameraSupported={camLive}
            permissionGranted={permissionGranted}
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
              <TwoStepOverlay
                theme={T}
                step1={T.step1}
                step2={T.step2}
                stepIndex={stepIndex}
                targeted={curStep.targeted}
                target={curAnchor}
                roundActive={roundActive}
                handPos={handPos}
                progress={progress}
                near={near}
                accuracy={accuracy}
                quality={quality}
                round={round}
                totalRounds={totalRounds}
                banner={banner}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={TWO_STEP_SHELL.sparkleColor} count={16} />

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
            {camLive && error && permissionGranted ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.btnRow}>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={() => setActive(true)}>
                    <Text style={styles.primaryBtnText}>Retry Camera</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Play Guided</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.introText}>
                  {camLive
                    ? 'Stand back so the camera sees your whole body — clear space to move and turn!'
                    : 'Guided mode: follow the coach and do both steps in order!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Mission</Text>
                </Pressable>
                {camLive && (
                  <Pressable
                    style={styles.linkBtn}
                    onPress={() => {
                      setForceFallback(true);
                      beginCalibration();
                    }}
                  >
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
  academyLabel: { color: '#FBCFE8', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#FBCFE8', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  coinEmoji: { fontSize: 15 },
  stageWrap: { flex: 1, marginTop: 14, marginBottom: 12 },
  calibWrap: { position: 'absolute', top: '44%', alignSelf: 'center', alignItems: 'center', width: '74%' },
  calibText: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  calibTrack: { width: '100%', height: 12, borderRadius: 6, backgroundColor: 'rgba(12,25,41,0.75)', overflow: 'hidden' },
  calibFill: { height: '100%', backgroundColor: '#F472B6' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#FBCFE8', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#FBCFE8', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default TwoStepPlanGame;
