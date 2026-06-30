/**
 * OT Level 10 · Session 8 · Game 5 — Problem Solver
 *
 * Capstone problem-solving adventure: try each challenge, adapt with calm
 * stillness, then solve the finale with steady attention.
 * Camera tracks movement quality, posture, attention and task completion.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { movementSmoothness } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import { AttentionMeter } from '@/components/game/occupational/level10/session6/components/AttentionMeter';
import { ProblemSolverOverlay } from '@/components/game/occupational/level10/session8/components/ProblemSolverOverlay';
import { ProblemSolverVisuals } from '@/components/game/occupational/level10/session8/components/ProblemSolverVisuals';
import { problemSolverQuality } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
import { PROBLEM_SOLVER_PACING as P } from '@/components/game/occupational/level10/session8/problemSolverPacing';
import {
  PROBLEM_SOLVER_ROUNDS,
  PROBLEM_SOLVER_THEME as T,
  SOLVER_SHELL,
  type ProblemSolverRound,
  type SolverPhaseKind,
} from '@/components/game/occupational/level10/session8/problemSolverTheme';
import { inSolverZone } from '@/components/game/occupational/level10/session8/problemSolverUtils';
import { VisionTrackingView } from '@/hooks/useVisionTracking';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Solver star!', 'Solved!', 'Champion!', 'Adapt hero!', 'Problem ace!'];

type Phase = 'intro' | 'calibrate' | 'play';

const ProblemSolverGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalRounds = P.rounds;

  const [active, setActive] = useState(true);
  const tracking = useSensoryTracking(active);
  const { sample, hasCamera, cameraSupported, pose, vision, previewContainerId, permissionGranted } = tracking;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordStar,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [roundPhase, setRoundPhase] = useState<SolverPhaseKind>('try');
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [tryScore, setTryScore] = useState(0);
  const [adaptScore, setAdaptScore] = useState(0);
  const [solveScore, setSolveScore] = useState(0);
  const [quality, setQuality] = useState(0);
  const [tryOk, setTryOk] = useState(false);
  const [adaptOk, setAdaptOk] = useState(false);
  const [solveOk, setSolveOk] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;
  const solverRound = PROBLEM_SOLVER_ROUNDS[Math.min(round, PROBLEM_SOLVER_ROUNDS.length - 1)]!;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<SolverPhaseKind>('try');
  const roundRef = useRef<ProblemSolverRound>(solverRound);
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const phaseStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const motorSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { roundRef.current = solverRound; }, [solverRound]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const beginAdaptPhase = useCallback((sr: ProblemSolverRound) => {
    roundPhaseRef.current = 'adapt';
    setRoundPhase('adapt');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setBanner(T.adaptLabel);
    setCoachCue(sr.adaptCue);
    phaseStartRef.current = Date.now();
    speakTTS(sr.voiceAdapt, 0.85).catch(() => {});
    playSound('clap', 0.55, 1.05).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const beginSolvePhase = useCallback((sr: ProblemSolverRound) => {
    roundPhaseRef.current = 'solve';
    setRoundPhase('solve');
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    setBanner(T.solveLabel);
    setCoachCue(sr.solveCue);
    phaseStartRef.current = Date.now();
    speakTTS(sr.voiceSolve, 0.85).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const done = completedRef.current;
    const xp = done * 22 + accuracy + Math.round(motorSumRef.current / Math.max(1, done) * 26);
    setFinalStats({ correct: done, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'problem-solver',
        score: done,
        accuracy,
        meta: { ...analyticsMeta, solving: motorSumRef.current / Math.max(1, done) },
      });
      await logGameAndAward('problem-solver', done, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, totalRounds, tracking.vision]);

  const startRound = useCallback((r: number) => {
    const sr = PROBLEM_SOLVER_ROUNDS[Math.min(r, PROBLEM_SOLVER_ROUNDS.length - 1)]!;
    setRound(r);
    holdMsRef.current = 0;
    lastInZoneRef.current = 0;
    setHoldProgress(0);
    roundPhaseRef.current = 'try';
    setRoundPhase('try');
    setBanner(T.tryLabel);
    setCoachCue(sr.voiceTry);
    setTryOk(false);
    setAdaptOk(false);
    setSolveOk(false);
    phaseStartRef.current = Date.now();
    speakTTS(sr.voiceTry, 0.82).catch(() => {});
  }, []);

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');

    recordHold(P.solveHoldMs);
    completedRef.current += 1;
    motorSumRef.current += quality;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setCompleted(next);

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, quality, recordHold, recordStar, schedule, startRound, totalRounds]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const sr = roundRef.current;
    const rp = roundPhaseRef.current;

    const holdTarget =
      rp === 'try' ? P.tryHoldMs : rp === 'adapt' ? P.adaptHoldMs : P.solveHoldMs;
    const grace =
      rp === 'try' ? P.tryGraceMs : rp === 'adapt' ? P.adaptGraceMs : P.solveGraceMs;

    if (!camLiveRef.current) {
      const fbMs =
        rp === 'try' ? P.fallbackTryMs : rp === 'adapt' ? P.fallbackAdaptMs : P.fallbackSolveMs;
      const elapsed = now - phaseStartRef.current;
      const t = clamp01(elapsed / fbMs);
      setHoldProgress(t);
      setTryScore(0.84);
      setAdaptScore(0.82);
      setSolveScore(0.8);
      setQuality(0.88);
      if (rp === 'try' && t >= 1) beginAdaptPhase(sr);
      else if (rp === 'adapt' && t >= 1) beginSolvePhase(sr);
      else if (rp === 'solve' && t >= 1) completeRound();
      recordTick(dt, { upright: true, still: true, quality: 0.86 });
      return;
    }

    const s = sampleRef.current;
    const cursor = s.cursor;

    if (!s.present || !cursor) {
      setCoachCue(T.positionCue);
      holdMsRef.current = 0;
      setHoldProgress(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    prevCursorRef.current = cursor;
    const smooth = movementSmoothness(prev, cursor);

    if (rp === 'try') {
      const ok = inSolverZone(cursor, sr.try);
      const holdPct = clamp01(holdMsRef.current / holdTarget);
      const q = problemSolverQuality(ok, false, false, holdPct, smooth, s.postureQuality, s.attentionScore, 'try');

      setTryOk(ok);
      setAdaptOk(false);
      setSolveOk(false);
      setTryScore(ok ? holdPct * 0.55 + 0.35 : smooth * 0.25);
      setAdaptScore(0.25);
      setSolveScore(0.2);
      setQuality(q);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(ok ? T.holdTryLabel : T.tryLabel);
      setCoachCue(ok ? 'Hold at the try node…' : sr.voiceTry);

      if (ok) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        if (holdMsRef.current >= holdTarget) beginAdaptPhase(sr);
      } else if (now - (lastInZoneRef.current || now) > grace) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.45);
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        lastInZoneRef.current = 0;
      }

      recordTick(dt, { upright: s.postureQuality > 0.35, still: smooth > 0.35, quality: q });
      return;
    }

    if (rp === 'adapt') {
      const inZone = inSolverZone(cursor, sr.adapt);
      const ok =
        inZone &&
        s.postureQuality >= P.minPostureForAdapt &&
        smooth >= P.minStillnessForAdapt;
      const holdPct = clamp01(holdMsRef.current / holdTarget);
      const q = problemSolverQuality(true, ok, false, holdPct, smooth, s.postureQuality, s.attentionScore, 'adapt');

      setTryOk(true);
      setAdaptOk(ok);
      setSolveOk(false);
      setTryScore(0.85);
      setAdaptScore(ok ? holdPct * 0.55 + smooth * 0.35 : inZone ? 0.35 : 0.15);
      setSolveScore(0.2);
      setQuality(q);
      qualSumRef.current += q;
      qualCountRef.current += 1;

      setBanner(ok ? T.holdAdaptLabel : T.adaptLabel);
      setCoachCue(ok ? sr.adaptCue : inZone ? 'Calm your body — adapt hold!' : sr.voiceAdapt);

      if (ok) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        if (holdMsRef.current >= holdTarget) beginSolvePhase(sr);
      } else if (now - (lastInZoneRef.current || now) > grace) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / holdTarget));
        lastInZoneRef.current = 0;
      }

      recordTick(dt, {
        upright: s.postureQuality > P.minPostureForAdapt,
        still: smooth > P.minStillnessForAdapt,
        quality: q,
      });
      return;
    }

    const inZone = inSolverZone(cursor, sr.solve);
    const ok =
      inZone &&
      s.postureQuality >= P.minPostureForSolve &&
      s.attentionScore >= P.minAttentionForSolve;
    const holdPct = clamp01(holdMsRef.current / holdTarget);
    const q = problemSolverQuality(true, true, ok, holdPct, smooth, s.postureQuality, s.attentionScore, 'solve');

    setTryOk(true);
    setAdaptOk(true);
    setSolveOk(ok);
    setTryScore(0.9);
    setAdaptScore(0.88);
    setSolveScore(ok ? holdPct * 0.6 + s.attentionScore * 0.35 : smooth * 0.25);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    setBanner(ok ? T.holdSolveLabel : T.solveLabel);
    setCoachCue(ok ? sr.solveCue : sr.voiceSolve);

    if (ok) {
      if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
      holdMsRef.current += dt;
      setHoldProgress(clamp01(holdMsRef.current / holdTarget));
      if (holdMsRef.current >= holdTarget) completeRound();
    } else if (now - (lastInZoneRef.current || now) > grace) {
      holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
      setHoldProgress(clamp01(holdMsRef.current / holdTarget));
      lastInZoneRef.current = 0;
    }

    recordTick(dt, {
      upright: s.postureQuality > P.minPostureForSolve,
      still: smooth > 0.35,
      quality: q,
    });
  }, [beginSolvePhase, beginAdaptPhase, completeRound, recordTick]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    motorSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Show your full body — solver sensors calibrating…');
    await tracking.vision.resetCalibration().catch(() => {});
    const start = Date.now();
    const timer = setInterval(() => {
      const p = clamp01((Date.now() - start) / P.calibrationMs);
      setCalibProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        schedule(beginPlay, 400);
      }
    }, 80);
  }, [beginPlay, schedule, tracking.vision]);

  useEffect(() => {
    return () => {
      clearTimers();
      tracking.vision.stopTracking().catch(() => {});
      cleanupSounds();
      stopAllSpeech();
    };
  }, [clearTimers, tracking.vision]);

  const handleBack = useCallback(() => {
    clearTimers();
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [clearTimers, onBack]);

  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        title={T.congrats}
        subtitle={`${finalStats.correct}/${finalStats.total} problems solved · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const renderOverlay = () => (
    <>
      <ProblemSolverVisuals solvePhase={roundPhase === 'solve'} />
      <AttentionMeter
        find={tryScore}
        focus={adaptScore}
        calm={solveScore}
        title="SOLVE"
        labels={{ find: 'TRY', focus: 'ADAPT', calm: 'SOLVE' }}
        style={{
          glassBorder: SOLVER_SHELL.glassBorder,
          statLabel: SOLVER_SHELL.statLabel,
          accent: T.accent,
          fillColors: ['#14B8A6', '#F59E0B', '#6366F1'],
        }}
      />
      {phase === 'play' && (
        <>
          <ProblemSolverOverlay
            round={solverRound}
            phase={roundPhase}
            holdProgress={holdProgress}
            tryOk={tryOk}
            adaptOk={adaptOk}
            solveOk={solveOk}
          />
          <ExplorerCursor cursor={sample.cursor} leftWrist={null} rightWrist={null} accent={T.accent} />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={SOLVER_SHELL.sparkleColor} count={28} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Solver calibration… {Math.round(calibProgress * 100)}%</Text>
          <View style={styles.calibTrack}>
            <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
          </View>
        </View>
      )}
    </>
  );

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: SOLVER_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: SOLVER_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>💡 {SOLVER_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: SOLVER_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: SOLVER_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: SOLVER_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: SOLVER_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>🧩</Text>
              <Text style={[styles.statValue, { color: SOLVER_SHELL.statValue }]}>{completed}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: SOLVER_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: SOLVER_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: SOLVER_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          {useNativeVision ? (
            <View style={styles.nativeStage}>
              <VisionTrackingView active={camLive} style={StyleSheet.absoluteFill} />
              {renderOverlay()}
              {(phase === 'play' || phase === 'calibrate') && !!coachCue && (
                <View style={styles.cueWrap} pointerEvents="none">
                  <Text style={styles.cueText}>{coachCue}</Text>
                </View>
              )}
            </View>
          ) : (
            <CameraStage
              {...poseStageNativeProps(pose)}
              previewContainerId={previewContainerId}
              cameraSupported={cameraSupported}
              permissionGranted={permissionGranted}
              hasCamera={hasCamera}
              present={sample.present}
              isDetecting={pose.isDetecting}
              calibrating={phase === 'calibrate'}
              quality={quality}
              glowColor={T.glow}
              hero={T.hero}
              coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
            >
              {renderOverlay()}
            </CameraStage>
          )}
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {tracking.error && camLive && <Text style={styles.errorText}>{tracking.error}</Text>}
            <View style={styles.skillRow}>
              {T.skillTags.map((tag) => (
                <View key={tag} style={styles.skillPill}>
                  <Text style={styles.skillText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: T.accent }]}
              onPress={() => {
                speakTTS(T.voiceIntro, 0.85).catch(() => {});
                tracking.requestCameraAccess().finally(() => beginCalibration());
              }}
            >
              <Text style={styles.primaryBtnText}>Begin Solver Quest</Text>
            </Pressable>
            {cameraSupported && !camLive && (
              <Pressable style={styles.secondaryBtn} onPress={() => setForceFallback(true)}>
                <Text style={styles.secondaryText}>Skip camera — guided mode</Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProblemSolverGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: SOLVER_SHELL.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#EEF2FF', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#C7D2FE', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statLabel: { fontSize: 10, fontWeight: '800' },
  statValue: { fontSize: 16, fontWeight: '900' },
  statEmoji: { fontSize: 16 },
  stageWrap: { flex: 1, marginHorizontal: 16, marginBottom: 8, minHeight: 300 },
  nativeStage: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: SOLVER_SHELL.stageBorder,
    backgroundColor: SOLVER_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.88)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SOLVER_SHELL.glassBorder,
  },
  phaseBannerText: { color: SOLVER_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#EEF2FF', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#6366F1' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SOLVER_SHELL.glassBorder,
  },
  cueText: { color: SOLVER_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: SOLVER_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.15)' },
  skillText: { color: '#C7D2FE', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#EEF2FF', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#C7D2FE', fontWeight: '700' },
  errorText: { color: SOLVER_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
