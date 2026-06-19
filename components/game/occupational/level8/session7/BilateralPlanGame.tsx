/**
 * Bilateral Motor Planning — OT Level 8 Session 7 shared engine.
 *
 * Each round shows a bilateral pattern (symmetric twin move, cross clap, bear
 * shape, mirror hands or dual action). The child plans and coordinates BOTH
 * sides, then holds the match to confirm. Camera + guided fallback.
 *
 * Modes: twinMoves · crossClap · bearPattern · mirrorHands · dualAction
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import {
  averageBaseline,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  limbMotion,
  movementIntensity,
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { BilateralOverlay } from '@/components/game/occupational/level8/session7/components/BilateralOverlay';
import { evalBilateral, type BilateralPattern } from '@/components/game/occupational/level8/session7/bilateralPlan';
import { BILATERAL_GAME_THEMES, BILATERAL_SHELL, type BilateralMode } from '@/components/game/occupational/level8/session7/bilateralTheme';
import { SESSION7_PACING as P, SESSION7_THRESHOLDS as TH } from '@/components/game/occupational/level8/session7/session7Pacing';
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

const VOICE_PRAISE = ['Both sides great!', 'Twin power!', 'Perfect coordination!', 'Amazing hands!', 'Super bilateral!'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Phase = 'intro' | 'calibrate' | 'play';

export const BilateralPlanGame: React.FC<{
  mode: BilateralMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = BILATERAL_GAME_THEMES[mode];
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
  const [pattern, setPattern] = useState<BilateralPattern | null>(null);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
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

  const patternRef = useRef<BilateralPattern | null>(null);
  const lastPatIdxRef = useRef(-1);
  const roundActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastOkRef = useRef(0);
  const roundStartRef = useRef(0);
  const bestScoreRef = useRef(0);
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

  const endGame = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);

    const completed = completedRef.current;
    const completion = totalRounds > 0 ? completed / totalRounds : 0;
    const bilAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + bilAcc * 0.5) * 100);
    const xp = Math.round(completed * 18 + bilAcc * 100 * 0.4 + moveQuality * 100 * 0.4);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `bilateral-plan-${mode}` as any,
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
            bilateralAccuracy: Math.round(bilAcc * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, mode, router, T.skillTags, T.voiceComplete, totalRounds]);

  const onMatched = useCallback(
    (acc: number) => {
      if (doneRef.current) return;
      roundActiveRef.current = false;
      setRoundActive(false);
      setMatchProgress(1);
      setMatched(true);

      accSumRef.current += acc;
      accCountRef.current += 1;
      completedRef.current += 1;
      recordHold(TH.holdMs);
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
    },
    [endGame, recordHold, recordStar, schedule, totalRounds],
  );

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      setRound(r);

      let idx = Math.floor(Math.random() * T.patterns.length);
      let guard = 0;
      while (idx === lastPatIdxRef.current && guard++ < 4) idx = Math.floor(Math.random() * T.patterns.length);
      lastPatIdxRef.current = idx;
      const chosen = T.patterns[idx]!;
      patternRef.current = chosen;
      setPattern(chosen);

      holdStartRef.current = 0;
      lastOkRef.current = 0;
      bestScoreRef.current = 0;
      setMatchProgress(0);
      setMatched(false);
      setScore(0);
      roundActiveRef.current = false;
      setRoundActive(false);
      setBanner(`Get ready: ${chosen.name}`);
      setCoachCue(T.hintText);
      if (r === 0 || r % 2 === 0) speakTTS(T.voicePlan, 0.85).catch(() => {});
      speakTTS(chosen.name, 0.9).catch(() => {});

      schedule(() => {
        if (doneRef.current) return;
        roundActiveRef.current = true;
        setRoundActive(true);
        roundStartRef.current = Date.now();
        setBanner('Coordinate both sides!');
        Haptics.selectionAsync().catch(() => {});
        schedule(() => setBanner(''), 850);
      }, P.planDelayMs);
    },
    [schedule, T.hintText, T.patterns, T.voicePlan],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const pat = patternRef.current;
    if (!pat) {
      prevMetricsRef.current = m;
      return;
    }

    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - roundStartRef.current;
        const prog = clamp01(elapsed / P.fallbackMatchMs);
        setMatchProgress(prog);
        setScore(0.6 + 0.3 * prog);
        setMatched(prog > 0.8);
        if (prog >= 1) onMatched(0.85);
      }
      recordTick(dt, { upright: true, still: true, quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    if (!m.present) {
      setCoachCue(T.positionCue);
      setMatched(false);
      setScore(0);
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      prevMetricsRef.current = m;
      return;
    }
    setCoachCue(T.hintText);

    const base = baselineRef.current;
    const positioned = uprightScore(m, base) >= 0.2;
    const motion = limbMotion(prev, m);
    const intensity = movementIntensity(motion, P.intensityCeiling);
    const controlled = clamp01(1 - Math.max(0, intensity - P.jerkHigh) / (1 - P.jerkHigh));
    const q = clamp01((positioned ? 0.5 : 0.3) + 0.5 * controlled);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    const ev = evalBilateral(pat, m, prev, base, TH);
    setScore(ev.score);
    setMatched(ev.ok);
    if (ev.score > bestScoreRef.current) bestScoreRef.current = ev.score;

    if (roundActiveRef.current) {
      if (ev.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastOkRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / ev.holdMs);
        setMatchProgress(prog);
        if (prog >= 1) onMatched(Math.max(0.7, bestScoreRef.current));
      } else {
        setMatchProgress(ev.score * 0.7);
        if (now - lastOkRef.current > P.holdGraceMs) holdStartRef.current = 0;
      }
    }

    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: pat.kind === 'bear' && ev.ok, quality: q });
    prevMetricsRef.current = m;
  }, [onMatched, recordPostureBreak, recordTick, T.hintText, T.positionCue]);

  const beginPlay = useCallback(() => {
    resetAnalytics();
    completedRef.current = 0;
    accSumRef.current = 0;
    accCountRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    lastTickRef.current = 0;
    prevMetricsRef.current = null;
    lastPatIdxRef.current = -1;
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
    setCoachCue('Stand tall facing the camera — let me see both your arms!');
    speakTTS('Stand facing me so I can see both your arms!', 0.8).catch(() => {});
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: BILATERAL_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: BILATERAL_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>👯 TWIN POWER LAB</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: BILATERAL_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: BILATERAL_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: BILATERAL_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: BILATERAL_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: BILATERAL_SHELL.statValue }]}>{coins}</Text>
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
              <BilateralOverlay
                theme={T}
                pattern={pattern}
                roundActive={roundActive}
                matched={matched}
                matchProgress={matchProgress}
                score={score}
                quality={quality}
                round={round}
                totalRounds={totalRounds}
                banner={banner}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={BILATERAL_SHELL.sparkleColor} count={16} />

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
                    ? 'Stand back so the camera sees both arms — coordinate both sides for each pattern!'
                    : 'Guided mode: follow each bilateral pattern with both hands!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Twin Power</Text>
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
  academyLabel: { color: '#FDE68A', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#FEF3C7', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibFill: { height: '100%', backgroundColor: '#FBBF24' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#FEF3C7', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#FDE68A', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default BilateralPlanGame;
