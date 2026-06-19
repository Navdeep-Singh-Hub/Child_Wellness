/**
 * Novel Motor Challenges — OT Level 8 Session 9 shared engine.
 *
 * Each round presents an unfamiliar composite body move. Some modes hide the move
 * behind a surprise "?" reveal first. The child plans, performs and holds the
 * novel move. Camera + guided fallback.
 *
 * Modes: alienMoves · robotFactory · mysteryIsland · surpriseActions · challengeQuest
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
import { NovelChallengeOverlay } from '@/components/game/occupational/level8/session9/components/NovelChallengeOverlay';
import { evalNovel, type NovelChallenge } from '@/components/game/occupational/level8/session9/novelChallenge';
import { NOVEL_GAME_THEMES, NOVEL_SHELL, type NovelMode } from '@/components/game/occupational/level8/session9/novelTheme';
import { SESSION9_PACING as P, SESSION9_THRESHOLDS as TH } from '@/components/game/occupational/level8/session9/session9Pacing';
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

const VOICE_PRAISE = ['Novel move!', 'You nailed it!', 'So creative!', 'Wild move!', 'Amazing!'];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Phase = 'intro' | 'calibrate' | 'play';

export const NovelChallengeGame: React.FC<{
  mode: NovelMode;
  onBack?: () => void;
  onComplete?: () => void;
}> = ({ mode, onBack, onComplete }) => {
  const router = useRouter();
  const T = NOVEL_GAME_THEMES[mode];
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
  const [challenge, setChallenge] = useState<NovelChallenge | null>(null);
  const [revealed, setRevealed] = useState(true);
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
  const revealedRef = useRef(true);

  const challengeRef = useRef<NovelChallenge | null>(null);
  const lastIdxRef = useRef(-1);
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
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

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
    const novelAcc = accCountRef.current > 0 ? accSumRef.current / accCountRef.current : 0;
    const moveQuality = qualCountRef.current > 0 ? qualSumRef.current / qualCountRef.current : 0;
    const headline = Math.round((completion * 0.5 + novelAcc * 0.5) * 100);
    const xp = Math.round(completed * 20 + novelAcc * 100 * 0.4 + moveQuality * 100 * 0.4);

    const snap = analyticsSnapshot(headline);
    setFinalStats({ correct: completed, total: totalRounds, xp, accuracy: headline });
    setShowCongrats(true);
    speakTTS(T.voiceComplete, 0.8).catch(() => {});

    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: `novel-challenge-${mode}` as any,
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
            novelAccuracy: Math.round(novelAcc * 100),
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

  const beginPerform = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    setRoundActive(true);
    roundStartRef.current = Date.now();
    setBanner('Do the novel move!');
    Haptics.selectionAsync().catch(() => {});
    schedule(() => setBanner(''), 850);
  }, [schedule]);

  const startRound = useCallback(
    (r: number) => {
      if (doneRef.current) return;
      setRound(r);

      let idx = Math.floor(Math.random() * T.challenges.length);
      let guard = 0;
      while (idx === lastIdxRef.current && guard++ < 4) idx = Math.floor(Math.random() * T.challenges.length);
      lastIdxRef.current = idx;
      const chosen = T.challenges[idx]!;
      challengeRef.current = chosen;
      setChallenge(chosen);

      holdStartRef.current = 0;
      lastOkRef.current = 0;
      bestScoreRef.current = 0;
      setMatchProgress(0);
      setMatched(false);
      setScore(0);
      roundActiveRef.current = false;
      setRoundActive(false);
      setCoachCue(T.hintText);

      if (T.surpriseReveal) {
        setRevealed(false);
        revealedRef.current = false;
        setBanner('❓ Surprise coming…');
        speakTTS(T.voiceSurprise, 0.9).catch(() => {});
        schedule(() => {
          if (doneRef.current) return;
          setRevealed(true);
          revealedRef.current = true;
          setBanner(`${chosen.icon} ${chosen.name}!`);
          speakTTS(chosen.name, 0.9).catch(() => {});
          speakTTS(chosen.teaser, 0.85).catch(() => {});
          schedule(() => beginPerform(), P.surprisePlanMs);
        }, P.surpriseRevealMs);
      } else {
        setRevealed(true);
        revealedRef.current = true;
        setBanner(`New move: ${chosen.name}`);
        if (r === 0 || r % 2 === 0) speakTTS(T.voicePlan, 0.85).catch(() => {});
        speakTTS(chosen.name, 0.9).catch(() => {});
        speakTTS(chosen.teaser, 0.85).catch(() => {});
        schedule(() => beginPerform(), P.planDelayMs);
      }
    },
    [beginPerform, schedule, T],
  );

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play' || !revealedRef.current) return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const m = metricsRef.current;
    const prev = prevMetricsRef.current;
    const ch = challengeRef.current;
    if (!ch) {
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

    const ev = evalNovel(ch.kind, m, prev, base, TH);
    setScore(ev.score);
    setMatched(ev.ok);
    if (ev.score > bestScoreRef.current) bestScoreRef.current = ev.score;

    if (roundActiveRef.current) {
      if (ev.transient) {
        setMatchProgress(ev.ok ? 1 : ev.score);
        if (ev.ok) onMatched(0.88);
      } else if (ev.ok) {
        if (holdStartRef.current === 0) holdStartRef.current = now;
        lastOkRef.current = now;
        const prog = clamp01((now - holdStartRef.current) / ev.holdMs);
        setMatchProgress(prog);
        if (prog >= 1) onMatched(Math.max(0.75, bestScoreRef.current));
      } else {
        setMatchProgress(ev.score * 0.7);
        if (now - lastOkRef.current > P.holdGraceMs) holdStartRef.current = 0;
      }
    }

    if (!positioned) recordPostureBreak();
    recordTick(dt, { upright: positioned, still: ch.kind === 'surpriseFreeze' && ev.ok, quality: q });
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
    lastIdxRef.current = -1;
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
    speakTTS('Stand facing me with room to move in new ways!', 0.8).catch(() => {});
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
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: NOVEL_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: NOVEL_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🌟 WILD MOVE LAB</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {T.emoji} {T.title}
          </Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: NOVEL_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: NOVEL_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: NOVEL_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: NOVEL_SHELL.statBorder }]}>
              <Text style={styles.coinEmoji}>{T.collectible}</Text>
              <Text style={[styles.statValue, { color: NOVEL_SHELL.statValue }]}>{coins}</Text>
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
              <NovelChallengeOverlay
                theme={T}
                challenge={challenge}
                revealed={revealed}
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

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={NOVEL_SHELL.sparkleColor} count={16} />

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
                    ? T.surpriseReveal
                      ? 'Stay ready — surprise novel moves will pop up!'
                      : 'Learn brand-new body moves you have never seen before!'
                    : 'Guided mode: try each wild new move!'}
                </Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: T.accent }]} onPress={handleStart}>
                  <Text style={styles.primaryBtnText}>{T.hero} Start Challenge</Text>
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

export default NovelChallengeGame;
