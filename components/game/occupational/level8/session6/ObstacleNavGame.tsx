/**
 * Obstacle Navigation — OT Level 8 Session 6 shared engine.
 *
 * Each round the child navigates a themed trail gate-by-gate. A plan beat
 * previews the path, then each obstacle must be cleared in order (duck, climb,
 * jump, swerve, turn, balance, step). Detected from the camera with guided fallback.
 *
 * Modes: junglePath · lavaEscape · mountainRoute · spaceMaze · pirateIsland
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
import type { Anchor } from '@/components/game/occupational/level8/motorActions';
import { ObstaclePathOverlay } from '@/components/game/occupational/level8/session6/components/ObstaclePathOverlay';
import { evalObstacle, type ObstacleGate } from '@/components/game/occupational/level8/session6/obstacleNav';
import { buildPath, NAV_GAME_THEMES, NAV_SHELL, type NavMode } from '@/components/game/occupational/level8/session6/navTheme';
import { SESSION6_PACING as P, SESSION6_THRESHOLDS as TH } from '@/components/game/occupational/level8/session6/session6Pacing';
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

const VOICE_PRAISE = ['Trail cleared!', 'Great navigation!', 'Obstacle beaten!', 'Onward!', 'Super path skills!'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Phase = 'intro' | 'calibrate' | 'play';

export const ObstacleNavGame: React.FC<{
  mode: NavMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = NAV_GAME_THEMES[mode];
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
  const [gates, setGates] = useState<ObstacleGate[]>([]);
  const [gateIndex, setGateIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quality, setQuality] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cleared, setCleared] = useState(false);
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
  const gatesRef = useRef<ObstacleGate[]>([]);
  const idxRef = useRef(0);
  const roundActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const lastOkRef = useRef(0);
  const gateStartRef = useRef(0);
  const bestScoreRef = useRef(0);
  const gateAccRef = useRef<number[]>([]);
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
    const navAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + navAcc * 0.5) * 100);
    const xp = Math.round(completed * 20 + navAcc * 100 * 0.4 + moveQuality * 100 * 0.4);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `obstacle-nav-${mode}` as any,
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
            navigationAccuracy: Math.round(navAcc * 100),
            movementQuality: Math.round(moveQuality * 100),
            completion: Math.round(completion * 100),
          },
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [analyticsMeta, analyticsSnapshot, clearTimers, mode, router, T.skillTags, T.voiceComplete, totalRounds]);

  const beginGateAt = useCallback(
    (i: number) => {
      idxRef.current = i;
      setGateIndex(i);
      holdStartRef.current = 0;
      lastOkRef.current = 0;
      bestScoreRef.current = 0;
      gateStartRef.current = Date.now();
      setProgress(0);
      setCleared(false);
      setHandPos(null);
      roundActiveRef.current = true;
      setRoundActive(true);
      const g = gatesRef.current[i];
      if (g) {
        setBanner(`${g.icon} ${g.name}!`);
        speakTTS(g.name, 0.9).catch(() => {});
        schedule(() => setBanner(''), 850);
      }
    },
    [schedule],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    setProgress(0);
    setBanner('');

    const accs = gateAccRef.current;
    const roundAcc = accs.length > 0 ? accs.reduce((a, b) => a + b, 0) / accs.length : 0.85;
    accSumRef.current += roundAcc;
    accCountRef.current += 1;
    completedRef.current += 1;
    recordHold(TH.gateHoldMs);

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

  const onGateDone = useCallback(
    (gateAccuracy: number) => {
      gateAccRef.current.push(gateAccuracy);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const nextIdx = idxRef.current + 1;
      if (nextIdx >= gatesRef.current.length) {
        completeRound();
      } else {
        roundActiveRef.current = false;
        setRoundActive(false);
        const next = gatesRef.current[nextIdx];
        if (next) {
          setBanner(`Next: ${next.name} ${next.icon}`);
          speakTTS(`Now ${next.name}`, 0.9).catch(() => {});
        }
        schedule(() => beginGateAt(nextIdx), P.betweenGatesMs);
      }
    },
    [beginGateAt, completeRound, schedule],
  );

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      roundRef.current = r;
      setRound(r);
      const built = buildPath(T, r);
      gatesRef.current = built;
      setGates(built);
      idxRef.current = 0;
      setGateIndex(0);
      gateAccRef.current = [];
      roundActiveRef.current = false;
      setRoundActive(false);
      setProgress(0);
      setCleared(false);
      setHandPos(null);
      const pathText = built.map((g) => g.name).join(' → ');
      setBanner(`Path: ${pathText}`);
      setCoachCue(T.hintText);
      if (r === 0 || r % 2 === 0) speakTTS(T.voicePlan, 0.85).catch(() => {});

      const planMs = P.planDelayMs + built.length * P.planPerGateMs;
      schedule(() => {
        if (doneRef.current) return;
        Haptics.selectionAsync().catch(() => {});
        beginGateAt(0);
      }, planMs);
    },
    [beginGateAt, schedule, T],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const gate = gatesRef.current[idxRef.current];
    if (!gate) {
      prevMetricsRef.current = m;
      return;
    }

    if (!camLiveRef.current) {
      if (roundActiveRef.current) {
        const elapsed = now - gateStartRef.current;
        const t = clamp01(elapsed / P.fallbackGateMs);
        setProgress(t);
        setAccuracy(0.6 + 0.3 * t);
        setCleared(t > 0.8);
        if (gate.kind === 'step') {
          const start = { x: 0.5, y: 0.82 };
          setHandPos({ x: start.x + (gate.anchor.x - start.x) * t, y: start.y + (gate.anchor.y - start.y) * t });
        }
        if (t >= 1) onGateDone(0.85);
      }
      recordTick(dt, { upright: true, still: gate.kind === 'balance', quality: 0.85 });
      prevMetricsRef.current = m;
      return;
    }

    if (!m.present) {
      setCoachCue(T.positionCue);
      setHandPos(null);
      setCleared(false);
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

    const ev = evalObstacle(gate, m, prev, base, TH);
    setHandPos(ev.probe);
    setCleared(ev.ok);
    setAccuracy(ev.score);
    if (ev.score > bestScoreRef.current) bestScoreRef.current = ev.score;

    if (roundActiveRef.current) {
      if (ev.transient) {
        setProgress(ev.ok ? 1 : ev.score);
        if (ev.ok) onGateDone(0.88);
      } else if (ev.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastOkRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / ev.holdMs);
        setProgress(prog);
        if (prog >= 1) onGateDone(Math.max(0.75, bestScoreRef.current));
      } else {
        setProgress(ev.score * 0.85);
        if (now - lastOkRef.current > P.holdGraceMs) holdStartRef.current = 0;
      }
    }

    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: gate.kind === 'balance' && ev.ok, quality: q });
    prevMetricsRef.current = m;
  }, [onGateDone, recordPostureBreak, recordTick, T.hintText, T.positionCue]);

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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: NAV_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: NAV_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🗺️ TRAIL QUEST</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: NAV_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: NAV_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: NAV_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: NAV_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: NAV_SHELL.statValue }]}>{coins}</Text>
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
              <ObstaclePathOverlay
                theme={T}
                gates={gates}
                gateIndex={gateIndex}
                roundActive={roundActive}
                cleared={cleared}
                progress={progress}
                handPos={handPos}
                accuracy={accuracy}
                quality={quality}
                round={round}
                totalRounds={totalRounds}
                banner={banner}
              />
            )}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={NAV_SHELL.sparkleColor} count={16} />

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
                    ? 'Stand back so the camera sees your whole body — navigate the trail gate by gate!'
                    : 'Guided mode: follow the path and clear each obstacle!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Trail</Text>
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
  academyLabel: { color: '#BBF7D0', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  header: { alignItems: 'center', marginTop: 8 },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginTop: 2, textAlign: 'center' },
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
  calibFill: { height: '100%', backgroundColor: '#34D399' },
  bottomPanel: { paddingBottom: 16, alignItems: 'center', gap: 10 },
  introText: { color: '#D1FAE5', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 22 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  linkBtn: { paddingVertical: 8 },
  linkText: { color: '#BBF7D0', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
});

export default ObstacleNavGame;
